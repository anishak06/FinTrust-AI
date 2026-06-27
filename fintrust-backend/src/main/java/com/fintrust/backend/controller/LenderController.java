package com.fintrust.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fintrust.backend.model.*;
import com.fintrust.backend.repository.*;
import com.fintrust.backend.security.JwtTokenProvider;
import com.fintrust.backend.security.UserPrincipal;
import com.fintrust.backend.service.AuditLogService;
import com.fintrust.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/lender")
public class LenderController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(LenderController.class);

    @Autowired
    private LenderRepository lenderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QrVerificationTokenRepository qrVerificationTokenRepository;

    @Autowired
    private CreditScoreRepository creditScoreRepository;

    @Autowired
    private FinancialDataRepository financialDataRepository;

    @Autowired
    private LoanAssessmentRepository loanAssessmentRepository;

    @Autowired
    private AiRecommendationRepository aiRecommendationRepository;

    @Autowired
    private LenderHistoryRepository lenderHistoryRepository;

    @Autowired
    private LoanDecisionRepository loanDecisionRepository;

    @Autowired
    private ActiveSessionRepository activeSessionRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory OTP storage for forgot password
    private static final ConcurrentHashMap<String, OtpDetails> otpStorage = new ConcurrentHashMap<>();

    private static class OtpDetails {
        final String otp;
        final LocalDateTime expiry;

        OtpDetails(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    // Strong password validation regex:
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );

    @PostMapping("/signup")
    public ResponseEntity<?> registerLender(@RequestBody Map<String, String> request) {
        String bankName = request.get("bankName");
        String branchName = request.get("branchName");
        String employeeName = request.get("employeeName");
        String employeeId = request.get("employeeId");
        String designation = request.get("designation");
        String email = request.get("email");
        String mobileNumber = request.get("mobileNumber");
        String bankAddress = request.get("bankAddress");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and Password are required."));
        }

        if (!password.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match."));
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."));
        }

        if (lenderRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered."));
        }

        Lender lender = new Lender();
        lender.setBankName(bankName);
        lender.setBranchName(branchName);
        lender.setEmployeeName(employeeName);
        lender.setEmployeeId(employeeId);
        lender.setDesignation(designation);
        lender.setEmail(email);
        lender.setMobileNumber(mobileNumber);
        lender.setBankAddress(bankAddress);
        lender.setPassword(passwordEncoder.encode(password));

        lenderRepository.save(lender);

        auditLogService.logAction(lender.getId(), "LENDER_SIGNUP", "SUCCESS");
        emailService.sendRegistrationVerification(email, employeeName);

        return ResponseEntity.ok(Map.of("message", "Lender registration successful. Please log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginLender(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String deviceId = request.get("deviceId");

        if (deviceId == null || deviceId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "deviceId is required"));
        }

        Lender lender = lenderRepository.findByEmail(email).orElse(null);
        if (lender == null || !passwordEncoder.matches(password, lender.getPassword())) {
            if (lender != null) {
                auditLogService.logAction(lender.getId(), "LENDER_LOGIN_FAILED", "FAIL");
            }
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        // Manage session
        Optional<ActiveSession> existingSessionOpt = activeSessionRepository.findByUserIdAndIsValidTrue(lender.getId());
        existingSessionOpt.ifPresent(session -> {
            session.setValid(false);
            activeSessionRepository.save(session);
        });

        ActiveSession newSession = new ActiveSession();
        newSession.setUserId(lender.getId());
        newSession.setDeviceId(deviceId);
        newSession.setSessionToken(jwt);
        activeSessionRepository.save(newSession);

        auditLogService.logAction(lender.getId(), "LENDER_LOGIN", "SUCCESS");

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("email", lender.getEmail());
        response.put("employeeName", lender.getEmployeeName());
        response.put("bankName", lender.getBankName());
        response.put("role", lender.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }

        Lender lender = lenderRepository.findByEmail(email).orElse(null);
        if (lender == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email not registered."));
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpStorage.put(email, new OtpDetails(otp, LocalDateTime.now().plusMinutes(15)));

        emailService.sendForgotPasswordOtp(email, otp);
        auditLogService.logAction(lender.getId(), "LENDER_FORGOT_PASSWORD_REQUEST", "SUCCESS");

        return ResponseEntity.ok(Map.of("message", "OTP has been sent to your registered email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, OTP, and newPassword are required."));
        }

        OtpDetails details = otpStorage.get(email);
        if (details == null || !details.otp.equals(otp) || details.expiry.isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP."));
        }

        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."));
        }

        Lender lender = lenderRepository.findByEmail(email).orElseThrow();
        lender.setPassword(passwordEncoder.encode(newPassword));
        lenderRepository.save(lender);

        otpStorage.remove(email);
        auditLogService.logAction(lender.getId(), "LENDER_RESET_PASSWORD", "SUCCESS");

        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    @PostMapping("/consent/verify")
    public ResponseEntity<?> verifyBorrowerConsent(@RequestBody Map<String, String> request) {
        String tokenString = request.get("token");
        if (tokenString == null || tokenString.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Consent Token is required."));
        }

        // Support full verification URLs as well as raw token strings
        if (tokenString.contains("/api/credit/verify-profile/")) {
            tokenString = tokenString.substring(tokenString.lastIndexOf("/") + 1);
        }

        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long lenderId = principal.getId();

        Optional<QrVerificationToken> tokenOpt = qrVerificationTokenRepository.findByToken(tokenString);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Invalid or expired consent token"));
        }

        QrVerificationToken token = tokenOpt.get();
        if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body(Map.of("error", "Consent token has expired or has already been used."));
        }

        // Mark consent token as used immediately to enforce one-time usage
        token.setUsed(true);
        qrVerificationTokenRepository.save(token);

        Long borrowerId = token.getUserId();
        User borrower = userRepository.findById(borrowerId).orElseThrow();

        // Save access details to history
        Optional<LenderHistory> histOpt = lenderHistoryRepository.findByLenderIdAndBorrowerId(lenderId, borrowerId);
        if (histOpt.isEmpty()) {
            LenderHistory history = new LenderHistory();
            history.setLenderId(lenderId);
            history.setBorrowerId(borrowerId);
            lenderHistoryRepository.save(history);
        } else {
            LenderHistory history = histOpt.get();
            history.setViewedAt(LocalDateTime.now());
            lenderHistoryRepository.save(history);
        }

        auditLogService.logAction(lenderId, "LENDER_VIEWED_BORROWER_PROFILE", "SUCCESS");

        // Construct borrower profile summary payload
        Map<String, Object> response = new HashMap<>();
        response.put("borrowerId", borrower.getId());
        response.put("fullName", borrower.getFullName());
        response.put("age", borrower.getAge() != null ? borrower.getAge() : 27);
        response.put("occupation", borrower.getOccupation());
        response.put("employmentType", borrower.getEmploymentType() != null ? borrower.getEmploymentType() : "SALARIED");
        response.put("monthlyIncome", borrower.getMonthlyIncome() != null ? borrower.getMonthlyIncome() : 45000.0);
        response.put("city", borrower.getCity() != null ? borrower.getCity() : "Mumbai");
        response.put("email", borrower.getEmail());
        response.put("phoneNumber", borrower.getPhoneNumber() != null ? borrower.getPhoneNumber() : "+91-9876543210");
        response.put("verificationStatus", borrower.getVerificationStatus());

        // Fetch latest credit assessment details
        Optional<CreditScore> scoreOpt = creditScoreRepository.findFirstByUserIdOrderByCalculationDateDesc(borrowerId);
        if (scoreOpt.isPresent()) {
            CreditScore cs = scoreOpt.get();
            response.put("score", cs.getScore());
            response.put("riskLevel", cs.getRiskLevel());
            response.put("traditionalScore", cs.getTraditionalScore() != null ? cs.getTraditionalScore() : 680);
            response.put("maxLendableAmount", cs.getMaxLendableAmount() != null ? cs.getMaxLendableAmount() : 250000.0);
            response.put("scoreBreakdown", cs.getScoreBreakdown());
            response.put("calculationDate", cs.getCalculationDate());
            response.put("fraudRisk", cs.getFraudRisk() != null ? cs.getFraudRisk() : "Low");
        } else {
            response.put("score", null);
            response.put("riskLevel", "N/A");
            response.put("traditionalScore", 650);
            response.put("maxLendableAmount", 0.0);
            response.put("scoreBreakdown", "[]");
            response.put("calculationDate", null);
            response.put("fraudRisk", "Low");
        }

        // Fetch behavior timeline variables
        List<FinancialData> list = financialDataRepository.findByUserId(borrowerId);
        List<Map<String, Object>> timeline = new ArrayList<>();
        for (FinancialData fd : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", fd.getMonth());
            map.put("year", fd.getYear());
            map.put("income", fd.getIncome());
            map.put("savings", fd.getSavings());
            map.put("expenses", fd.getExpenses());
            map.put("upiTransactions", fd.getTransactionCount());
            map.put("paymentConsistency", fd.getPaymentConsistency());
            timeline.add(map);
        }
        response.put("timeline", timeline);

        // Fetch AI recommendations
        Optional<AiRecommendation> recOpt = aiRecommendationRepository.findFirstByUserIdOrderByTimestampDesc(borrowerId);
        if (recOpt.isPresent()) {
            AiRecommendation rec = recOpt.get();
            response.put("geminiInsights", rec.getGeminiInsights());
            response.put("strengths", rec.getStrengths());
            response.put("weaknesses", rec.getWeaknesses());
            response.put("recommendations", rec.getRecommendations());
        } else {
            response.put("geminiInsights", "AI Insights are currently unavailable.");
            response.put("strengths", "No profile data uploaded");
            response.put("weaknesses", "No historical records");
            response.put("recommendations", "Establish alternative transaction records");
        }

        // Fetch latest loan decision if any
        Optional<LoanDecision> decisionOpt = loanDecisionRepository.findFirstByBorrowerIdOrderByTimestampDesc(borrowerId);
        if (decisionOpt.isPresent()) {
            response.put("lastDecision", decisionOpt.get().getDecision());
            response.put("lastDecisionReason", decisionOpt.get().getReason());
        } else {
            response.put("lastDecision", "PENDING");
            response.put("lastDecisionReason", "");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/loan-decision")
    public ResponseEntity<?> makeLoanDecision(@RequestBody Map<String, String> request) {
        String borrowerIdStr = request.get("borrowerId");
        String decisionString = request.get("decision"); // APPROVED, REJECTED, DOCUMENTS_REQUESTED
        String reason = request.get("reason");

        if (borrowerIdStr == null || decisionString == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "borrowerId and decision are required."));
        }

        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long lenderId = principal.getId();
        Long borrowerId = Long.parseLong(borrowerIdStr);

        Lender lender = lenderRepository.findById(lenderId).orElseThrow();
        User borrower = userRepository.findById(borrowerId).orElseThrow();

        // Save Decision
        LoanDecision decision = new LoanDecision();
        decision.setLenderId(lenderId);
        decision.setBorrowerId(borrowerId);
        decision.setDecision(decisionString);
        decision.setReason(reason);
        loanDecisionRepository.save(decision);

        // Update borrower status
        if ("APPROVED".equalsIgnoreCase(decisionString)) {
            borrower.setVerificationStatus("VERIFIED");
        } else if ("REJECTED".equalsIgnoreCase(decisionString)) {
            borrower.setVerificationStatus("REJECTED");
        } else {
            borrower.setVerificationStatus("PENDING");
        }
        userRepository.save(borrower);

        auditLogService.logAction(lenderId, "LENDER_SUBMITTED_LOAN_DECISION: " + decisionString, "SUCCESS");

        // Send Email
        double amount = 250000.0; // default mapping recommendation
        Optional<CreditScore> cs = creditScoreRepository.findFirstByUserIdOrderByCalculationDateDesc(borrowerId);
        if (cs.isPresent() && cs.get().getMaxLendableAmount() != null) {
            amount = cs.get().getMaxLendableAmount();
        }

        if ("APPROVED".equalsIgnoreCase(decisionString)) {
            emailService.sendLoanApproved(borrower.getEmail(), borrower.getFullName(), lender.getBankName(), amount);
        } else if ("REJECTED".equalsIgnoreCase(decisionString)) {
            emailService.sendLoanRejected(borrower.getEmail(), borrower.getFullName(), lender.getBankName(), reason);
        } else {
            emailService.sendRequestAdditionalDocuments(borrower.getEmail(), borrower.getFullName(), lender.getBankName(), reason);
        }

        return ResponseEntity.ok(Map.of("message", "Loan decision saved and email notification sent."));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getLenderHistory() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long lenderId = principal.getId();

        List<LenderHistory> list = lenderHistoryRepository.findByLenderIdOrderByViewedAtDesc(lenderId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (LenderHistory hist : list) {
            Optional<User> borrowerOpt = userRepository.findById(hist.getBorrowerId());
            if (borrowerOpt.isEmpty()) continue;

            User borrower = borrowerOpt.get();
            Map<String, Object> item = new HashMap<>();
            item.put("borrowerId", borrower.getId());
            item.put("borrowerName", borrower.getFullName());
            item.put("viewedAt", hist.getViewedAt());

            Optional<CreditScore> scoreOpt = creditScoreRepository.findFirstByUserIdOrderByCalculationDateDesc(borrower.getId());
            if (scoreOpt.isPresent()) {
                item.put("score", scoreOpt.get().getScore());
                item.put("riskLevel", scoreOpt.get().getRiskLevel());
                item.put("amount", scoreOpt.get().getMaxLendableAmount());
            } else {
                item.put("score", "N/A");
                item.put("riskLevel", "N/A");
                item.put("amount", 0.0);
            }

            Optional<LoanDecision> decOpt = loanDecisionRepository.findFirstByBorrowerIdOrderByTimestampDesc(borrower.getId());
            if (decOpt.isPresent()) {
                item.put("decision", decOpt.get().getDecision());
            } else {
                item.put("decision", "PENDING");
            }

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }
}
