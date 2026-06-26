package com.fintrust.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fintrust.backend.model.*;
import com.fintrust.backend.repository.*;
import com.fintrust.backend.security.UserPrincipal;
import com.fintrust.backend.service.AuditLogService;
import com.fintrust.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/credit")
public class CreditController {

    @Autowired
    private FinancialDataRepository financialDataRepository;

    @Autowired
    private CreditScoreRepository creditScoreRepository;

    @Autowired
    private LoanAssessmentRepository loanAssessmentRepository;

    @Autowired
    private AiRecommendationRepository aiRecommendationRepository;

    @Autowired
    private UploadedBillRepository uploadedBillRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/assess")
    public ResponseEntity<?> assessCredit(@RequestBody Map<String, Object> request) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        try {
            // 1. Ingest inputs safely
            double income = Double.parseDouble(request.get("monthlyIncome").toString());
            double expenses = Double.parseDouble(request.get("monthlyExpenses").toString());
            double savings = Double.parseDouble(request.get("monthlySavings").toString());
            int transactions = Integer.parseInt(request.get("upiTransactionFrequency").toString());
            String employmentType = request.get("employmentType").toString();
            String occupation = request.get("occupation").toString();
            String selfReportedConsistency = request.get("utilityBillConsistency").toString();

            // Save occupation back to User profile if not set
            userRepository.findById(userId).ifPresent(user -> {
                if (!StringUtils.hasText(user.getOccupation())) {
                    user.setOccupation(occupation);
                    userRepository.save(user);
                }
            });

            // 2. Bill Payment Consistency calculation from DB uploaded bills
            double billConsistencyPct = 100.0;
            List<UploadedBill> uploadedBills = uploadedBillRepository.findByUserIdOrderByUploadDateDesc(userId);
            
            if (!uploadedBills.isEmpty()) {
                long totalBills = uploadedBills.size();
                long onTimeBills = uploadedBills.stream()
                        .filter(b -> "PAID_ON_TIME".equalsIgnoreCase(b.getPaymentStatus()))
                        .count();
                billConsistencyPct = ((double) onTimeBills / totalBills) * 100.0;
            } else {
                // Fallback to self-reported consistency
                if ("CONSISTENT".equalsIgnoreCase(selfReportedConsistency)) {
                    billConsistencyPct = 100.0;
                } else if ("SEMI_CONSISTENT".equalsIgnoreCase(selfReportedConsistency)) {
                    billConsistencyPct = 80.0;
                } else {
                    billConsistencyPct = 40.0;
                }
            }

            // 3. Scoring Points Calculations (Deterministic Weighted Engine)
            
            // A. Savings Ratio (30%)
            double savingsRatio = savings / (income > 0 ? income : 1.0);
            int savingsPoints = 20;
            if (savingsRatio >= 0.30) savingsPoints = 100;
            else if (savingsRatio >= 0.20) savingsPoints = 80;
            else if (savingsRatio >= 0.10) savingsPoints = 60;
            else if (savingsRatio >= 0.05) savingsPoints = 40;

            // B. Bill Payment Consistency (25%)
            int billPoints = 20;
            if (billConsistencyPct >= 100.0) billPoints = 100;
            else if (billConsistencyPct >= 90.0) billPoints = 80;
            else if (billConsistencyPct >= 75.0) billPoints = 60;
            else if (billConsistencyPct >= 50.0) billPoints = 40;

            // C. Income Stability (20%)
            int stabilityPoints = 40;
            String stabilityCategory = "Highly inconsistent";
            if ("SALARIED".equalsIgnoreCase(employmentType)) {
                stabilityPoints = 100;
                stabilityCategory = "Stable salaried income";
            } else if ("SELF_EMPLOYED".equalsIgnoreCase(employmentType)) {
                stabilityPoints = 80;
                stabilityCategory = "Consistent freelancer";
            } else if ("STUDENT".equalsIgnoreCase(employmentType)) {
                stabilityPoints = 60;
                stabilityCategory = "Moderately inconsistent";
            }

            // D. Expense Management (15%)
            double expenseRatio = expenses / (income > 0 ? income : 1.0);
            int expensePoints = 20;
            if (expenseRatio < 0.70) expensePoints = 100;
            else if (expenseRatio >= 0.70 && expenseRatio < 0.80) expensePoints = 80;
            else if (expenseRatio >= 0.80 && expenseRatio < 0.90) expensePoints = 60;
            else if (expenseRatio >= 0.90 && expenseRatio <= 1.00) expensePoints = 40;

            // E. Digital Transaction Activity (10%)
            int txnPoints = 20;
            if (transactions >= 100) txnPoints = 100;
            else if (transactions >= 50) txnPoints = 80;
            else if (transactions >= 20) txnPoints = 60;
            else if (transactions >= 10) txnPoints = 40;

            // Weighted scoring logic
            double weightedResult = (savingsPoints * 0.30) + 
                                    (billPoints * 0.25) + 
                                    (stabilityPoints * 0.20) + 
                                    (expensePoints * 0.15) + 
                                    (txnPoints * 0.10);

            // Bounded score translation (W from 20 to 100 -> Score from 300 to 900)
            int score = (int) Math.round(300.0 + ((weightedResult - 20.0) / 80.0) * 600.0);
            score = Math.max(300, Math.min(900, score));

            String riskLevel = score >= 750 ? "Low Risk" : (score >= 600 ? "Medium Risk" : "High Risk");

            // Build Explainable Score Breakdown JSON
            ArrayNode breakdownArray = objectMapper.createArrayNode();
            breakdownArray.add(createBreakdownNode("Savings Ratio (30%)", savingsPoints, "Savings rate is " + Math.round(savingsRatio * 100) + "% of income"));
            breakdownArray.add(createBreakdownNode("Bill Consistency (25%)", billPoints, "On-time payment rate verified at " + Math.round(billConsistencyPct) + "%"));
            breakdownArray.add(createBreakdownNode("Income Stability (20%)", stabilityPoints, "Stability categorized as " + stabilityCategory));
            breakdownArray.add(createBreakdownNode("Expense Management (15%)", expensePoints, "Expense ratio is " + Math.round(expenseRatio * 100) + "% of income"));
            breakdownArray.add(createBreakdownNode("Digital Transactions (10%)", txnPoints, "Digital footprint verified at " + transactions + " txns/month"));

            // 4. Loan Eligibility Underwriting (Backend Only)
            boolean loanEligible = score >= 550;
            double suggestedAmount = 0.0;
            String riskCategory = "High";

            if (score >= 750) {
                suggestedAmount = savings * 12.0;
                riskCategory = "Low";
            } else if (score >= 650) {
                suggestedAmount = savings * 8.0;
                riskCategory = "Moderate";
            } else if (score >= 550) {
                suggestedAmount = savings * 4.0;
                riskCategory = "High";
            }

            // 5. Database Persistence Loops
            // Save FinancialData
            FinancialData fd = new FinancialData();
            fd.setUserId(userId);
            fd.setIncome(income);
            fd.setSavings(savings);
            fd.setExpenses(expenses);
            fd.setIncomeStability(stabilityCategory);
            fd.setTransactionCount(transactions);
            fd.setPaymentConsistency(billConsistencyPct);
            financialDataRepository.save(fd);

            // Save CreditScore
            CreditScore cs = new CreditScore();
            cs.setUserId(userId);
            cs.setScore(score);
            cs.setRiskLevel(riskLevel);
            cs.setScoreBreakdown(objectMapper.writeValueAsString(breakdownArray));
            creditScoreRepository.save(cs);

            // Save LoanAssessment
            LoanAssessment la = new LoanAssessment();
            la.setUserId(userId);
            la.setEligibility(loanEligible);
            la.setLoanAmount(suggestedAmount);
            la.setRiskCategory(riskCategory);
            loanAssessmentRepository.save(la);

            // 6. Invoke Gemini AI (Insights Only, PII Strip Enforced)
            AiRecommendation rec = geminiService.generateFinancialInsights(
                    userId, score, income, savings, expenses, billConsistencyPct, transactions, loanEligible, suggestedAmount
            );

            // 7. Audit Logging
            auditLogService.logAction(userId, "CREDIT_SCORE_GENERATION", "SUCCESS");
            auditLogService.logAction(userId, "LOAN_ELIGIBILITY_CHECK", "SUCCESS");
            auditLogService.logAction(userId, "RECOMMENDATION_GENERATION", "SUCCESS");

            // 8. Return Consolidated backward-compatible dashboard response
            Map<String, Object> dashboardRes = buildConsolidatedResponse(fd, cs, la, rec);
            return ResponseEntity.ok(dashboardRes);

        } catch (Exception e) {
            auditLogService.logAction(userId, "CREDIT_ASSESS_FAILED", "EXCEPTION");
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid assessment payload fields or parsing error."));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestAssessment() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        Optional<CreditScore> latestScore = creditScoreRepository.findFirstByUserIdOrderByCalculationDateDesc(userId);
        if (latestScore.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "No assessments found. Please check your eligibility first."));
        }

        FinancialData latestData = financialDataRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).orElse(new FinancialData());
        LoanAssessment latestLoan = loanAssessmentRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).orElse(new LoanAssessment());
        AiRecommendation latestRec = aiRecommendationRepository.findFirstByUserIdOrderByTimestampDesc(userId).orElse(new AiRecommendation());

        return ResponseEntity.ok(buildConsolidatedResponse(latestData, latestScore.get(), latestLoan, latestRec));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getAssessmentHistory() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        List<CreditScore> scoreHistory = creditScoreRepository.findByUserIdOrderByCalculationDateDesc(userId);
        List<Map<String, Object>> list = new ArrayList<>();

        for (CreditScore cs : scoreHistory) {
            Map<String, Object> map = new HashMap<>();
            map.put("score", cs.getScore());
            map.put("createdAt", cs.getCalculationDate());
            list.add(map);
        }
        return ResponseEntity.ok(list);
    }

    private ObjectNode createBreakdownNode(String factor, int points, String desc) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("factor", factor);
        node.put("points", points);
        node.put("description", desc);
        return node;
    }

    private Map<String, Object> buildConsolidatedResponse(FinancialData fd, CreditScore cs, LoanAssessment la, AiRecommendation rec) {
        Map<String, Object> map = new HashMap<>();
        map.put("score", cs.getScore());
        map.put("riskCategory", cs.getRiskLevel()); // Maps to Low Risk, Medium Risk, High Risk
        
        // Calculate health status based on score thresholds
        String health = "Poor";
        if (cs.getScore() >= 750) health = "Excellent";
        else if (cs.getScore() >= 650) health = "Good";
        else if (cs.getScore() >= 550) health = "Fair";
        
        map.put("healthStatus", health);
        map.put("monthlyIncome", fd.getIncome());
        map.put("monthlyExpenses", fd.getExpenses());
        map.put("monthlySavings", fd.getSavings());
        map.put("upiTransactionFrequency", fd.getTransactionCount());
        map.put("loanEligible", la.getEligibility());
        map.put("suggestedLoanAmount", la.getLoanAmount());
        map.put("scoreBreakdown", cs.getScoreBreakdown());
        map.put("recommendations", rec.getRecommendations());
        map.put("geminiInsights", rec.getGeminiInsights());
        map.put("strengths", rec.getStrengths());
        map.put("weaknesses", rec.getWeaknesses());
        map.put("createdAt", cs.getCalculationDate());
        return map;
    }
}
