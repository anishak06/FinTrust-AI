package com.fintrust.backend.controller;

import com.fintrust.backend.model.UploadedBill;
import com.fintrust.backend.repository.UploadedBillRepository;
import com.fintrust.backend.security.UserPrincipal;
import com.fintrust.backend.service.AuditLogService;
import com.fintrust.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private UploadedBillRepository uploadedBillRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private AuditLogService auditLogService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf", "image/png", "image/jpeg", "image/jpg"
    );

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBill(@RequestParam("file") MultipartFile file) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        // 1. Validation
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty."));
        }

        // Validate MIME type
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            auditLogService.logAction(userId, "BILL_UPLOAD_FAILED", "REJECTED_MIME_TYPE");
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("error", "Invalid file format. Only PDF, PNG, JPG, and JPEG files are permitted."));
        }

        // Validate size (max 5MB, properties handled by Spring, but extra check is safe)
        if (file.getSize() > 5 * 1024 * 1024) {
            auditLogService.logAction(userId, "BILL_UPLOAD_FAILED", "REJECTED_FILE_SIZE_LIMIT");
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds the maximum limit of 5MB."));
        }

        try {
            // 2. Local Storage Persistence
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String uniqueName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir).resolve(uniqueName);
            Files.copy(file.getInputStream(), filePath);

            // 3. Metadata Extraction
            byte[] fileBytes = Files.readAllBytes(filePath);
            Map<String, Object> metadata = geminiService.extractBillMetadata(fileBytes, mimeType, file.getOriginalFilename());

            // 4. Determine Payment Status
            String paymentDateStr = (String) metadata.get("paymentDate");
            String dueDateStr = (String) metadata.get("dueDate");
            String paymentStatus = "UNPAID";

            if (StringUtils.hasText(paymentDateStr)) {
                try {
                    LocalDate paymentDate = LocalDate.parse(paymentDateStr);
                    LocalDate dueDate = LocalDate.parse(dueDateStr);
                    if (paymentDate.isAfter(dueDate)) {
                        paymentStatus = "PAID_LATE";
                    } else {
                        paymentStatus = "PAID_ON_TIME";
                    }
                } catch (Exception e) {
                    // Fallback status if date parsing fails
                    paymentStatus = "PAID_ON_TIME";
                }
            }

            // 5. Save Entity
            UploadedBill bill = new UploadedBill();
            bill.setUserId(userId);
            bill.setBillType((String) metadata.get("billType"));
            bill.setMerchantName((String) metadata.get("merchantName"));
            bill.setAmount((Double) metadata.get("amount"));
            bill.setDueDate(dueDateStr);
            bill.setPaymentDate(paymentDateStr);
            bill.setPaymentStatus(paymentStatus);
            bill.setFileName(file.getOriginalFilename());
            bill.setFilePath(filePath.toString());

            UploadedBill saved = uploadedBillRepository.save(bill);

            // 6. Audit Logging
            auditLogService.logAction(userId, "BILL_UPLOAD", "SUCCESS");

            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            auditLogService.logAction(userId, "BILL_UPLOAD_FAILED", "IO_EXCEPTION");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save file on the server."));
        }
    }

    @GetMapping
    public ResponseEntity<List<UploadedBill>> getUserBills() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();
        return ResponseEntity.ok(uploadedBillRepository.findByUserIdOrderByUploadDateDesc(userId));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadBill(@PathVariable Long id) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        Optional<UploadedBill> optionalBill = uploadedBillRepository.findById(id);
        if (optionalBill.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UploadedBill bill = optionalBill.get();
        // RBAC Check
        if (!bill.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. You can only view your own files."));
        }

        try {
            Path path = Paths.get(bill.getFilePath());
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                return ResponseEntity.status(HttpStatus.GONE)
                        .body(Map.of("error", "File not found on server."));
            }

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + bill.getFileName() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
