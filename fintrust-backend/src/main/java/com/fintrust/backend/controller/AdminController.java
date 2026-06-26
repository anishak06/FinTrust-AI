package com.fintrust.backend.controller;

import com.fintrust.backend.model.*;
import com.fintrust.backend.repository.*;
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
    private CreditScoreRepository creditScoreRepository;

    @Autowired
    private LoanAssessmentRepository loanAssessmentRepository;

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

            Optional<CreditScore> latestScore = creditScoreRepository.findFirstByUserIdOrderByCalculationDateDesc(user.getId());
            Optional<LoanAssessment> latestLoan = loanAssessmentRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());

            if (latestScore.isPresent()) {
                userMap.put("hasAssessment", true);
                userMap.put("latestScore", latestScore.get().getScore());
                userMap.put("riskCategory", latestScore.get().getRiskLevel());
                
                String health = "Poor";
                int score = latestScore.get().getScore();
                if (score >= 750) health = "Excellent";
                else if (score >= 650) health = "Good";
                else if (score >= 550) health = "Fair";
                userMap.put("healthStatus", health);
                
                userMap.put("loanEligible", latestLoan.isPresent() && latestLoan.get().getEligibility());
                userMap.put("lastAssessmentDate", latestScore.get().getCalculationDate());
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
        List<CreditScore> scores = creditScoreRepository.findAll();
        List<LoanAssessment> loans = loanAssessmentRepository.findAll();

        long totalUsers = users.size();
        
        // Pick latest score for each user
        Map<Long, CreditScore> latestUserScores = new HashMap<>();
        for (CreditScore sc : scores) {
            CreditScore existing = latestUserScores.get(sc.getUserId());
            if (existing == null || sc.getCalculationDate().isAfter(existing.getCalculationDate())) {
                latestUserScores.put(sc.getUserId(), sc);
            }
        }
        
        // Pick latest loan for each user
        Map<Long, LoanAssessment> latestUserLoans = new HashMap<>();
        for (LoanAssessment la : loans) {
            LoanAssessment existing = latestUserLoans.get(la.getUserId());
            if (existing == null || la.getCreatedAt().isAfter(existing.getCreatedAt())) {
                latestUserLoans.put(la.getUserId(), la);
            }
        }

        long assessedUsers = latestUserScores.size();
        double totalScoreSum = 0;
        long eligibleCount = 0;
        long lowRiskCount = 0;
        long medRiskCount = 0;
        long highRiskCount = 0;

        for (CreditScore cs : latestUserScores.values()) {
            totalScoreSum += cs.getScore();
            
            if ("Low Risk".equalsIgnoreCase(cs.getRiskLevel())) {
                lowRiskCount++;
            } else if ("Medium Risk".equalsIgnoreCase(cs.getRiskLevel())) {
                medRiskCount++;
            } else {
                highRiskCount++;
            }

            LoanAssessment la = latestUserLoans.get(cs.getUserId());
            if (la != null && la.getEligibility()) {
                eligibleCount++;
            }
        }

        double averageScore = assessedUsers == 0 ? 0.0 : totalScoreSum / assessedUsers;
        double approvalRate = assessedUsers == 0 ? 0.0 : (double) eligibleCount / assessedUsers * 100.0;

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
        scores.stream()
                .sorted((s1, s2) -> s2.getCalculationDate().compareTo(s1.getCalculationDate()))
                .limit(5)
                .forEach(s -> {
                    Map<String, Object> act = new HashMap<>();
                    Optional<User> u = userRepository.findById(s.getUserId());
                    act.put("username", u.isPresent() ? u.get().getFullName() : "Unknown User");
                    act.put("score", s.getScore());
                    act.put("risk", s.getRiskLevel());
                    
                    Optional<LoanAssessment> lOpt = loanAssessmentRepository.findFirstByUserIdOrderByCreatedAtDesc(s.getUserId());
                    act.put("eligible", lOpt.isPresent() && lOpt.get().getEligibility());
                    act.put("date", s.getCalculationDate());
                    recentActivities.add(act);
                });

        stats.put("recentActivities", recentActivities);

        return ResponseEntity.ok(stats);
    }
}
