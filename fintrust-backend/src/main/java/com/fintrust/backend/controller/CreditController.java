package com.fintrust.backend.controller;

import com.fintrust.backend.model.CreditAssessment;
import com.fintrust.backend.repository.CreditAssessmentRepository;
import com.fintrust.backend.security.UserPrincipal;
import com.fintrust.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/credit")
public class CreditController {

    @Autowired
    private CreditAssessmentRepository creditAssessmentRepository;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/assess")
    public ResponseEntity<?> assessCredit(@RequestBody CreditAssessment assessmentRequest) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        assessmentRequest.setUserId(userId);
        
        // Compute credit score using Gemini AI (or local fallback)
        CreditAssessment completedAssessment = geminiService.assessCredit(assessmentRequest);
        
        // Save to Database
        CreditAssessment saved = creditAssessmentRepository.save(completedAssessment);
        
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestAssessment() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        Optional<CreditAssessment> latest = creditAssessmentRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (latest.isPresent()) {
            return ResponseEntity.ok(latest.get());
        } else {
            // Return an empty response or indicator that no assessment has been done
            Map<String, String> response = new HashMap<>();
            response.put("message", "No assessments found. Please check your eligibility first.");
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<CreditAssessment>> getAssessmentHistory() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        List<CreditAssessment> history = creditAssessmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(history);
    }
}
