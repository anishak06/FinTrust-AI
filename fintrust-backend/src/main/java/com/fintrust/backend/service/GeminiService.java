package com.fintrust.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fintrust.backend.model.CreditAssessment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.url}")
    private String geminiUrl;

    @Value("${app.gemini.key}")
    private String geminiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CreditAssessment assessCredit(CreditAssessment assessment) {
        if (!StringUtils.hasText(geminiKey)) {
            logger.info("Gemini API key is not configured. Falling back to local credit engine.");
            return calculateLocalAssessment(assessment);
        }

        try {
            String prompt = buildPrompt(assessment);
            String response = callGeminiApi(prompt);
            return parseGeminiResponse(response, assessment);
        } catch (Exception e) {
            logger.error("Error invoking Gemini API. Falling back to local credit engine.", e);
            return calculateLocalAssessment(assessment);
        }
    }

    private String buildPrompt(CreditAssessment a) {
        return "You are FinTrust AI, a modern alternative credit scoring engine designed to evaluate individuals with little or no traditional credit history.\n" +
                "Evaluate the following alternative financial profile:\n" +
                "- Monthly Income: \u20B9" + a.getMonthlyIncome() + "\n" +
                "- Monthly Expenses: \u20B9" + a.getMonthlyExpenses() + "\n" +
                "- Monthly Savings: \u20B9" + a.getMonthlySavings() + "\n" +
                "- Utility Bill Payment Consistency: " + a.getUtilityBillConsistency() + "\n" +
                "- UPI Digital Transactions Frequency: " + a.getUpiTransactionFrequency() + " transactions/month\n" +
                "- Employment Status: " + a.getEmploymentType() + "\n" +
                "- Occupation: " + a.getOccupation() + "\n" +
                "- Existing Active Loans: \u20B9" + (a.getExistingLoans() != null ? a.getExistingLoans() : 0.0) + "\n\n" +
                "Evaluate and return exactly a JSON object (no markdown, no ```json, no extra text, just raw JSON) with the following structure:\n" +
                "{\n" +
                "  \"score\": 750, // integer from 300 to 900 representing credit score\n" +
                "  \"riskCategory\": \"Low Risk\", // Low Risk, Medium Risk, High Risk\n" +
                "  \"healthStatus\": \"Excellent\", // Excellent, Good, Fair, Poor\n" +
                "  \"breakdown\": [\n" +
                "     { \"factor\": \"Consistent Savings\", \"points\": 120, \"description\": \"Savings rate of 30% indicates solid liquidity buffer\" },\n" +
                "     { \"factor\": \"UPI Transaction Patterns\", \"points\": 40, \"description\": \"Regular small transactions show digital activity\" }\n" +
                "  ], // detailed breakdown including positive and negative scoring factors\n" +
                "  \"loanEligible\": true, // boolean\n" +
                "  \"suggestedLoanAmount\": 150000.0, // double\n" +
                "  \"loanRiskLevel\": \"Low\", // Low, Moderate, High\n" +
                "  \"confidenceScore\": 0.92, // double between 0.0 and 1.0\n" +
                "  \"recommendations\": [\n" +
                "     \"Increase monthly savings by \u20B91000 to maximize score\",\n" +
                "     \"Reduce discretionary spending by 10%\"\n" +
                "  ]\n" +
                "}";
    }

    private String callGeminiApi(String prompt) throws Exception {
        String url = geminiUrl + "?key=" + geminiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build the request body for Gemini API
        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        parts.addObject().put("text", prompt);

        // If you want to configure generationConfig for JSON response
        ObjectNode generationConfig = requestBody.putObject("generationConfig");
        generationConfig.put("responseMimeType", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        return response.getBody();
    }

    private CreditAssessment parseGeminiResponse(String responseStr, CreditAssessment assessment) throws Exception {
        JsonNode root = objectMapper.readTree(responseStr);
        String jsonText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        
        // Clean markdown backticks if Gemini ignored the configuration and returned them anyway
        if (jsonText.contains("```")) {
            jsonText = jsonText.replaceAll("```json|```", "").trim();
        }

        JsonNode result = objectMapper.readTree(jsonText);

        assessment.setScore(result.path("score").asInt(650));
        assessment.setRiskCategory(result.path("riskCategory").asText("Medium Risk"));
        assessment.setHealthStatus(result.path("healthStatus").asText("Fair"));

        // Store breakdown and recommendations as JSON string
        assessment.setScoreBreakdown(objectMapper.writeValueAsString(result.path("breakdown")));
        assessment.setRecommendations(objectMapper.writeValueAsString(result.path("recommendations")));

        assessment.setLoanEligible(result.path("loanEligible").asBoolean(false));
        assessment.setSuggestedLoanAmount(result.path("suggestedLoanAmount").asDouble(0.0));
        assessment.setLoanRiskLevel(result.path("loanRiskLevel").asText("High"));
        assessment.setConfidenceScore(result.path("confidenceScore").asDouble(0.70));

        return assessment;
    }

    private CreditAssessment calculateLocalAssessment(CreditAssessment a) {
        int baseScore = 550;
        List<Map<String, Object>> breakdown = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // 1. Savings Consistency
        double income = a.getMonthlyIncome() > 0 ? a.getMonthlyIncome() : 1.0;
        double savingsRatio = a.getMonthlySavings() / income;
        
        if (savingsRatio >= 0.30) {
            baseScore += 120;
            breakdown.add(createBreakdownItem("Consistent Savings", 120, "Excellent savings rate of " + Math.round(savingsRatio * 100) + "%"));
        } else if (savingsRatio >= 0.15) {
            baseScore += 70;
            breakdown.add(createBreakdownItem("Healthy Savings Buffer", 70, "Healthy savings rate of " + Math.round(savingsRatio * 100) + "%"));
        } else if (savingsRatio >= 0.05) {
            baseScore += 30;
            breakdown.add(createBreakdownItem("Minimal Savings Rate", 30, "Minimal savings buffer of " + Math.round(savingsRatio * 100) + "%"));
        } else {
            baseScore -= 50;
            breakdown.add(createBreakdownItem("Low Savings Rate", -50, "Extremely thin savings buffer. High vulnerability."));
            recommendations.add("Increase monthly savings by \u20B91,500 to build an emergency fund.");
        }

        // 2. Utility Bill Payment Consistency
        String billConsistency = a.getUtilityBillConsistency();
        if ("CONSISTENT".equalsIgnoreCase(billConsistency)) {
            baseScore += 110;
            breakdown.add(createBreakdownItem("Timely Bill Payments", 110, "100% consistent utility bill payments on record"));
        } else if ("SEMI_CONSISTENT".equalsIgnoreCase(billConsistency)) {
            baseScore += 40;
            breakdown.add(createBreakdownItem("Variable Utility Payments", 40, "Mostly timely payments with slight delays"));
            recommendations.add("Automate utility bill payments to secure credit score points.");
        } else {
            baseScore -= 70;
            breakdown.add(createBreakdownItem("Missed Utility Payments", -70, "Inconsistent bill payment behavior detected"));
            recommendations.add("Prioritize clearing all due utility bills on time.");
        }

        // 3. Spending Behavior (Expense Ratio)
        double expenseRatio = a.getMonthlyExpenses() / income;
        if (expenseRatio <= 0.50) {
            baseScore += 80;
            breakdown.add(createBreakdownItem("Controlled Spending", 80, "Excellent expense control under 50% of income"));
        } else if (expenseRatio >= 0.85) {
            baseScore -= 90;
            breakdown.add(createBreakdownItem("High Discretionary Spending", -90, "Extremely high expense ratio of " + Math.round(expenseRatio * 100) + "%"));
            recommendations.add("Reduce discretionary spending by 15% to increase monthly buffers.");
        } else {
            baseScore += 10;
            breakdown.add(createBreakdownItem("Moderate Expense Balance", 10, "Average spending pattern"));
        }

        // 4. Income / Employment Stability
        String empType = a.getEmploymentType();
        if ("SALARIED".equalsIgnoreCase(empType)) {
            baseScore += 90;
            breakdown.add(createBreakdownItem("Stable Salaried Income", 90, "Regular salaried paycheck reduces credit default risk"));
        } else if ("SELF_EMPLOYED".equalsIgnoreCase(empType)) {
            baseScore += 60;
            breakdown.add(createBreakdownItem("Business Revenue Stream", 60, "Active self-employment income patterns"));
            recommendations.add("Maintain structured business ledger logs to demonstrate stable cash flow.");
        } else if ("STUDENT".equalsIgnoreCase(empType)) {
            baseScore += 20;
            breakdown.add(createBreakdownItem("Student Credit Starter", 20, "Initial student baseline profile"));
        } else {
            baseScore -= 80;
            breakdown.add(createBreakdownItem("No Active Income Stream", -80, "Unemployed status increases credit risk profile"));
            recommendations.add("Acquire part-time or structured employment to establish creditworthiness.");
        }

        // 5. UPI digital transactions
        int upiFreq = a.getUpiTransactionFrequency() != null ? a.getUpiTransactionFrequency() : 0;
        if (upiFreq > 50) {
            baseScore -= 20;
            breakdown.add(createBreakdownItem("High UPI Transaction Velocity", -20, "Elevated small-value digital expenditure patterns"));
            recommendations.add("Consolidate recurring micro-payments to reduce transaction noise.");
        } else if (upiFreq >= 10) {
            baseScore += 50;
            breakdown.add(createBreakdownItem("Active Digital Fingerprint", 50, "Frequent active digital transaction history"));
        } else {
            baseScore += 10;
            breakdown.add(createBreakdownItem("Low Digital Footprint", 10, "Sparse transaction frequency"));
        }

        // 6. Existing Loans
        double loans = a.getExistingLoans() != null ? a.getExistingLoans() : 0.0;
        if (loans > 0) {
            baseScore -= 40;
            breakdown.add(createBreakdownItem("Existing Debt Liabilities", -40, "Active outstanding loans on record"));
            recommendations.add("Limit new debt inquiries until current liabilities are fully settled.");
        } else {
            baseScore += 50;
            breakdown.add(createBreakdownItem("Debt Free Profile", 50, "No active outstanding credit liabilities"));
        }

        // Clip the credit score to standard 300 - 900
        int finalScore = Math.max(300, Math.min(900, baseScore));
        a.setScore(finalScore);

        // Set Risk Category
        if (finalScore >= 750) {
            a.setRiskCategory("Low Risk");
            a.setHealthStatus("Excellent");
        } else if (finalScore >= 630) {
            a.setRiskCategory("Medium Risk");
            a.setHealthStatus("Good");
        } else if (finalScore >= 520) {
            a.setRiskCategory("Medium Risk");
            a.setHealthStatus("Fair");
        } else {
            a.setRiskCategory("High Risk");
            a.setHealthStatus("Poor");
        }

        // Loan Eligibility
        boolean eligible = finalScore >= 600 && !"UNEMPLOYED".equalsIgnoreCase(empType);
        a.setLoanEligible(eligible);
        if (eligible) {
            double multiplier = (finalScore - 500) / 100.0;
            double suggestedAmount = Math.round((a.getMonthlyIncome() * 4 * multiplier) / 5000) * 5000;
            a.setSuggestedLoanAmount(suggestedAmount);
            a.setLoanRiskLevel(finalScore >= 750 ? "Low" : "Moderate");
        } else {
            a.setSuggestedLoanAmount(0.0);
            a.setLoanRiskLevel("High");
        }

        double conf = 0.72 + (finalScore - 300) / 2500.0;
        a.setConfidenceScore(Math.round(conf * 100.0) / 100.0);

        if (recommendations.isEmpty()) {
            recommendations.add("Maintain current consistent financial behavior.");
            recommendations.add("Consider creating a new savings goal to structure long-term growth.");
        }

        try {
            a.setScoreBreakdown(objectMapper.writeValueAsString(breakdown));
            a.setRecommendations(objectMapper.writeValueAsString(recommendations));
        } catch (Exception e) {
            a.setScoreBreakdown("[]");
            a.setRecommendations("[]");
        }

        return a;
    }

    private Map<String, Object> createBreakdownItem(String factor, int points, String desc) {
        Map<String, Object> map = new HashMap<>();
        map.put("factor", factor);
        map.put("points", points);
        map.put("description", desc);
        return map;
    }
}
