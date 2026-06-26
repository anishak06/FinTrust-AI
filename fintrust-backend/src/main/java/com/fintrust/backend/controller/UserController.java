package com.fintrust.backend.controller;

import com.fintrust.backend.model.QrVerificationToken;
import com.fintrust.backend.repository.QrVerificationTokenRepository;
import com.fintrust.backend.security.UserPrincipal;
import com.fintrust.backend.service.QrCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private QrVerificationTokenRepository qrVerificationTokenRepository;

    @Autowired
    private QrCodeService qrCodeService;

    private final SecureRandom secureRandom = new SecureRandom();

    @GetMapping("/qr-code")
    public ResponseEntity<?> generateQrCode() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        String nonce = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        QrVerificationToken token = new QrVerificationToken();
        token.setUserId(userId);
        token.setToken(nonce);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        token.setUsed(false);

        qrVerificationTokenRepository.save(token);

        String verifyUrl = "http://localhost:8080/api/credit/verify-profile/" + nonce;
        String qrCodeBase64 = qrCodeService.generateQrCodeBase64(verifyUrl);

        Map<String, Object> response = new HashMap<>();
        response.put("qrCode", qrCodeBase64);
        response.put("expiresIn", 300); // 5 minutes in seconds

        return ResponseEntity.ok(response);
    }
}
