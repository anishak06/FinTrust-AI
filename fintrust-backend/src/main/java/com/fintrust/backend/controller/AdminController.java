package com.fintrust.backend.controller;

import com.fintrust.backend.model.CreditAssessment;
import com.fintrust.backend.model.User;
import com.fintrust.backend.repository.CreditAssessmentRepository;
import com.fintrust.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CreditAssessmentRepository creditAssessmentRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsersWithScores() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("fullName", user.getFullName());
            userMap.put("role", user.getRole());
            userMap.put("createdAt", user.getCreatedAt());

            Optional<CreditAssessment> latest = creditAssessmentRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
            if (latest.isPresent()) {
                userMap.put("hasAssessment", true);
                userMap.put("latestScore", latest.get().getScore());
                userMap.put("riskCategory", latest.get().getRiskCategory());
                userMap.put("healthStatus", latest.get().getHealthStatus());
                userMap.put("loanEligible", latest.get().getLoanEligible());
                userMap.put("lastAssessmentDate", latest.get().getCreatedAt());
            } else {
                userMap.put("hasAssessment", false);
                userMap.put("latestScore", null);
                userMap.put("riskCategory", "N/A");
                userMap.put("healthStatus", "N/A");
                userMap.put("loanEligible", false);
                userMap.put("lastAssessmentDate", null);
            }
            result.add(userMap);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getPlatformStats() {
        List<User> users = userRepository.findAll();
        List<CreditAssessment> assessments = creditAssessmentRepository.findAll();

        long totalUsers = users.size();
        long assessedUsers = assessments.stream().map(CreditAssessment::getUserId).distinct().count();

        // Calculate average score of the LATEST assessments for each user
        Map<Long, Integer> userLatestScores = new HashMap<>();
        long eligibleCount = 0;
        long lowRiskCount = 0;
        long medRiskCount = 0;
        long highRiskCount = 0;

        // Group assessments by user and pick latest
        Map<Long, CreditAssessment> latestUserAssessments = new HashMap<>();
        for (CreditAssessment assessment : assessments) {
            CreditAssessment existing = latestUserAssessments.get(assessment.getUserId());
            if (existing == null || assessment.getCreatedAt().isAfter(existing.getCreatedAt())) {
                latestUserAssessments.put(assessment.getUserId(), assessment);
            }
        }

        double totalScoreSum = 0;
        for (CreditAssessment a : latestUserAssessments.values()) {
            totalScoreSum += a.getScore();
            if (a.getLoanEligible()) {
                eligibleCount++;
            }
            if ("Low Risk".equalsIgnoreCase(a.getRiskCategory())) {
                lowRiskCount++;
            } else if ("Medium Risk".equalsIgnoreCase(a.getRiskCategory())) {
                medRiskCount++;
            } else {
                highRiskCount++;
            }
        }

        double averageScore = latestUserAssessments.isEmpty() ? 0.0 : totalScoreSum / latestUserAssessments.size();
        double approvalRate = latestUserAssessments.isEmpty() ? 0.0 : (double) eligibleCount / latestUserAssessments.size() * 100.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("assessedUsers", assessedUsers);
        stats.put("averageScore", Math.round(averageScore * 10.0) / 10.0);
        stats.put("approvalRate", Math.round(approvalRate * 10.0) / 10.0);

        Map<String, Long> riskBreakdown = new HashMap<>();
        riskBreakdown.put("lowRisk", lowRiskCount);
        riskBreakdown.put("mediumRisk", medRiskCount);
        riskBreakdown.put("highRisk", highRiskCount);
        stats.put("riskBreakdown", riskBreakdown);

        // Recent assessment activities
        List<Map<String, Object>> recentActivities = new ArrayList<>();
        assessments.stream()
                .sorted((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()))
                .limit(5)
                .forEach(a -> {
                    Map<String, Object> act = new HashMap<>();
                    Optional<User> u = userRepository.findById(a.getUserId());
                    act.put("username", u.isPresent() ? u.get().getFullName() : "Unknown User");
                    act.put("score", a.getScore());
                    act.put("risk", a.getRiskCategory());
                    act.put("eligible", a.getLoanEligible());
                    act.put("date", a.getCreatedAt());
                    recentActivities.add(act);
                });

        stats.put("recentActivities", recentActivities);

        return ResponseEntity.ok(stats);
    }
}
