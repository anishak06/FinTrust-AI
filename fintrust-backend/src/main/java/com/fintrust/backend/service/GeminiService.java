package com.fintrust.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fintrust.backend.model.AiRecommendation;
import com.fintrust.backend.repository.AiRecommendationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiService {
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.url}")
    private String geminiUrl;

    @Value("${app.gemini.key}")
    private String geminiKey;

    @Autowired
    private AiRecommendationRepository aiRecommendationRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generates intelligent, data-driven financial insights using Gemini AI.
     * Scrubbed of all PII. Gemini does NOT calculate score, eligibility, or loan amounts.
     */
    public AiRecommendation generateFinancialInsights(
            Long userId, int score, double income, double savings, double expenses, double consistency, int transactions,
            boolean loanEligible, double suggestedLoanAmount) {

        if (!StringUtils.hasText(geminiKey)) {
            logger.info("Gemini API key is not configured. Falling back to local rule-based insights engine.");
            return calculateLocalInsights(userId, score, income, savings, expenses, consistency, transactions, loanEligible, suggestedLoanAmount);
        }

        try {
            String prompt = buildInsightsPrompt(score, income, savings, expenses, consistency, transactions, loanEligible, suggestedLoanAmount);
            String response = callGeminiApi(prompt);
            return parseInsightsResponse(userId, response);
        } catch (Exception e) {
            logger.error("Error generating insights via Gemini. Falling back to local engine.", e);
            return calculateLocalInsights(userId, score, income, savings, expenses, consistency, transactions, loanEligible, suggestedLoanAmount);
        }
    }

    private String buildInsightsPrompt(
            int score, double income, double savings, double expenses, double consistency, int transactions,
            boolean loanEligible, double suggestedLoanAmount) {
        
        return "You are FinTrust AI, a modern financial intelligence engine. Generate intelligent, data-driven financial insights based on this anonymized borrower profile:\n" +
                "- Credit Score: " + score + " / 900\n" +
                "- Monthly Income: \u20B9" + income + "\n" +
                "- Monthly Savings: \u20B9" + savings + "\n" +
                "- Monthly Expenses: \u20B9" + expenses + "\n" +
                "- Bill Payment Consistency: " + consistency + "%\n" +
                "- UPI Digital Transactions: " + transactions + " transactions/month\n" +
                "- Loan Eligibility Status: " + (loanEligible ? "ELIGIBLE" : "NOT ELIGIBLE") + "\n" +
                "- Maximum Suggested Loan Limit: \u20B9" + suggestedLoanAmount + "\n\n" +
                "Evaluate and return exactly a JSON object (no markdown, no ```json, no extra text, just raw JSON) with the following structure:\n" +
                "{\n" +
                "  \"geminiInsights\": \"General analytical summary of their financial health, savings buffers, and cash flow stability...\",\n" +
                "  \"strengths\": [\n" +
                "     \"\u2705 First key strength...\",\n" +
                "     \"\u2705 Second key strength...\"\n" +
                "  ], // List what they are doing well based on data\n" +
                "  \"weaknesses\": [\n" +
                "     \"\u26A0 First warning area...\",\n" +
                "     \"\u26A0 Second warning area...\"\n" +
                "  ], // List areas to watch out for based on data\n" +
                "  \"loanEligibilityExplanation\": \"Explain WHY the user received their specific eligibility status and suggested loan limit based on the underwriting parameters...\",\n" +
                "  \"recommendations\": [\n" +
                "     \"Increase monthly savings to \u20B9\" + (estimated required savings target) + \" to strengthen buffers.\",\n" +
                "     \"Reduce discretionary spending by 10% to lower expenses under 70% of income.\",\n" +
                "     \"Maintain utility payment consistency on time to secure consistency score...\"\n" +
                "  ] // List personalized, data-driven recommendations with actual numbers. Do not output generic advice.\n" +
                "}";
    }

    private AiRecommendation parseInsightsResponse(Long userId, String responseStr) throws Exception {
        JsonNode root = objectMapper.readTree(responseStr);
        String jsonText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        
        if (jsonText.contains("```")) {
            jsonText = jsonText.replaceAll("```json|```", "").trim();
        }

        JsonNode result = objectMapper.readTree(jsonText);

        AiRecommendation rec = new AiRecommendation();
        rec.setUserId(userId);
        rec.setGeminiInsights(result.path("geminiInsights").asText("Your cash flow and savings buffers display positive progress."));
        rec.setStrengths(objectMapper.writeValueAsString(result.path("strengths")));
        rec.setWeaknesses(objectMapper.writeValueAsString(result.path("weaknesses")));
        rec.setRecommendations(objectMapper.writeValueAsString(result.path("recommendations")));

        // Concat explanation into insights or store it in DB (we can concat it into geminiInsights to display on dashboard!)
        String rawInsights = result.path("geminiInsights").asText();
        String explanation = result.path("loanEligibilityExplanation").asText();
        rec.setGeminiInsights(rawInsights + "\n\n[Underwriting Decision Details]: " + explanation);

        return aiRecommendationRepository.save(rec);
    }

    /**
     * Extracts bill metadata (type, amount, due date, merchant) from uploaded bill file bytes.
     */
    public Map<String, Object> extractBillMetadata(byte[] fileBytes, String mimeType, String fileName) {
        if (!StringUtils.hasText(geminiKey)) {
            logger.info("Gemini API key is not configured. Falling back to local file parsing simulation.");
            return calculateLocalBillMetadata(fileName);
        }

        try {
            String base64Data = Base64.getEncoder().encodeToString(fileBytes);
            String prompt = "You are an AI bill reader. Analyze this document and extract its billing metadata.\n" +
                    "Supported Bill Types: ELECTRICITY, WATER, INTERNET, MOBILE, GAS, RENT, BANK_STATEMENT.\n" +
                    "Return exactly a JSON object (no markdown, no ```json, no extra text, just raw JSON) with the following structure:\n" +
                    "{\n" +
                    "  \"billType\": \"ELECTRICITY\",\n" +
                    "  \"merchantName\": \"Merchant Name (e.g. Tata Power)\",\n" +
                    "  \"amount\": 1500.00, // double\n" +
                    "  \"dueDate\": \"YYYY-MM-DD\", // Due date found on bill\n" +
                    "  \"paymentDate\": \"YYYY-MM-DD\" // Payment date if paid (or null/empty if unpaid)\n" +
                    "}";

            String url = geminiUrl + "?key=" + geminiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);

            // Add base64 document bytes directly to parts
            ObjectNode inlinePart = parts.addObject();
            ObjectNode inlineData = inlinePart.putObject("inlineData");
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", base64Data);

            ObjectNode generationConfig = requestBody.putObject("generationConfig");
            generationConfig.put("responseMimeType", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String jsonText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            if (jsonText.contains("```")) {
                jsonText = jsonText.replaceAll("```json|```", "").trim();
            }

            JsonNode result = objectMapper.readTree(jsonText);
            Map<String, Object> meta = new HashMap<>();
            meta.put("billType", result.path("billType").asText("ELECTRICITY"));
            meta.put("merchantName", result.path("merchantName").asText("Utility Corp"));
            meta.put("amount", result.path("amount").asDouble(1000.0));
            meta.put("dueDate", result.path("dueDate").asText(LocalDate.now().plusDays(10).toString()));
            meta.put("paymentDate", result.path("paymentDate").isNull() ? null : result.path("paymentDate").asText());

            return meta;

        } catch (Exception e) {
            logger.error("Error extracting bill metadata via Gemini. Falling back to local file parsing simulation.", e);
            return calculateLocalBillMetadata(fileName);
        }
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

        // Configure generationConfig for JSON response
        ObjectNode generationConfig = requestBody.putObject("generationConfig");
        generationConfig.put("responseMimeType", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        return response.getBody();
    }

    private AiRecommendation calculateLocalInsights(
            Long userId, int score, double income, double savings, double expenses, double consistency, int transactions,
            boolean loanEligible, double suggestedLoanAmount) {

        AiRecommendation rec = new AiRecommendation();
        rec.setUserId(userId);
        
        // Formulate Strengths
        ArrayNode strengths = objectMapper.createArrayNode();
        if (savings / income >= 0.3) {
            strengths.add("\u2705 You consistently save over 30% of your monthly income.");
        } else if (savings / income >= 0.15) {
            strengths.add("\u2705 You maintain a healthy savings buffer of " + Math.round(savings / income * 100) + "%.");
        }
        if (consistency >= 90) {
            strengths.add("\u2705 Your utility bill payment history is excellent.");
        }
        if (expenses / income < 0.70) {
            strengths.add("\u2705 Your monthly expense management is highly conservative.");
        }

        if (strengths.size() == 0) {
            strengths.add("\u2705 Basic baseline financial accounts registered.");
        }

        // Formulate Weaknesses
        ArrayNode weaknesses = objectMapper.createArrayNode();
        if (expenses / income >= 0.8) {
            weaknesses.add("\u26A0 Discretionary spending is higher than recommended.");
        }
        if (savings / income < 0.15) {
            weaknesses.add("\u26A0 Monthly savings rate is thin, leaving you vulnerable to cashflow shocks.");
        }
        if (consistency < 75) {
            weaknesses.add("\u26A0 Utility payment delays are negatively impacting your consistency index.");
        }
        if (weaknesses.size() == 0) {
            weaknesses.add("\u26A0 No high-priority warnings detected on your profile.");
        }

        // Recommendations
        ArrayNode recs = objectMapper.createArrayNode();
        double targetSavings = Math.round(income * 0.30);
        recs.add("Increase monthly savings to \u20B9" + targetSavings + " to maintain a stable 30% savings ratio.");
        recs.add("Maintain your utility payment consistency on time.");
        if (expenses / income >= 0.7) {
            recs.add("Reduce discretionary spending by 10% to lower overall expense ratios.");
        }
        recs.add("Improve your savings ratio above 30% to maximize underwriting limits.");

        // Insights & Explanation
        String insights = "Based on your credit assessment of " + score + " points, your liquidity buffers are stable.";
        String explanation = "Underwriting criteria determines " + (loanEligible ? "ELIGIBLE" : "NOT ELIGIBLE") + 
                " status. " + (loanEligible ? "Your credit score enables access up to " + Math.round(suggestedLoanAmount / savings) + "x your monthly savings rate." 
                : "A minimum score of 550 is required to unlock alternative underwriting channels.");

        try {
            rec.setStrengths(objectMapper.writeValueAsString(strengths));
            rec.setWeaknesses(objectMapper.writeValueAsString(weaknesses));
            rec.setRecommendations(objectMapper.writeValueAsString(recs));
        } catch (Exception e) {
            rec.setStrengths("[]");
            rec.setWeaknesses("[]");
            rec.setRecommendations("[]");
        }

        rec.setGeminiInsights(insights + "\n\n[Underwriting Decision Details]: " + explanation);
        return aiRecommendationRepository.save(rec);
    }

    private Map<String, Object> calculateLocalBillMetadata(String fileName) {
        Map<String, Object> meta = new HashMap<>();
        String name = fileName.toLowerCase();
        
        // Set type based on file name
        if (name.contains("electricity") || name.contains("power") || name.contains("light")) {
            meta.put("billType", "ELECTRICITY");
            meta.put("merchantName", "State Electricity Board");
        } else if (name.contains("water")) {
            meta.put("billType", "WATER");
            meta.put("merchantName", "Municipal Water Authority");
        } else if (name.contains("internet") || name.contains("broadband") || name.contains("wifi")) {
            meta.put("billType", "INTERNET");
            meta.put("merchantName", "Broadband Fiber Ltd");
        } else if (name.contains("mobile") || name.contains("phone") || name.contains("telecom")) {
            meta.put("billType", "MOBILE");
            meta.put("merchantName", "Telecom Mobile Network");
        } else if (name.contains("gas")) {
            meta.put("billType", "GAS");
            meta.put("merchantName", "Gas Distribution Corp");
        } else if (name.contains("rent") || name.contains("receipt")) {
            meta.put("billType", "RENT");
            meta.put("merchantName", "Landlord Rental Property");
        } else {
            meta.put("billType", "BANK_STATEMENT");
            meta.put("merchantName", "National Trust Bank");
        }

        // Set simulated amounts
        double amount = Math.round(500.0 + Math.random() * 2500.0);
        meta.put("amount", amount);

        // Simulated dates (Paid on time or late based on random chance)
        LocalDate dueDate = LocalDate.now().minusDays((int) (Math.random() * 15) - 5);
        meta.put("dueDate", dueDate.toString());

        // 80% chance it is paid, and if paid, 90% chance it is on time
        if (Math.random() > 0.15) {
            LocalDate paymentDate;
            if (Math.random() > 0.10) {
                paymentDate = dueDate.minusDays((int) (Math.random() * 5)); // paid on time
            } else {
                paymentDate = dueDate.plusDays((int) (Math.random() * 5) + 1); // paid late
            }
            meta.put("paymentDate", paymentDate.toString());
        } else {
            meta.put("paymentDate", null); // Unpaid
        }

        return meta;
    }
}
