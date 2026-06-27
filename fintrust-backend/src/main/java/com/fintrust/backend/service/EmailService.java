package com.fintrust.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private void sendEmail(String to, String subject, String text) {
        logger.info("[EmailService] Attempting to send email to={}, subject={}", to, subject);
        if (mailSender == null) {
            logger.warn("[EmailService] JavaMailSender not configured. Email logged to console:\n" +
                    "To: {}\nSubject: {}\nBody: {}", to, subject, text);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            logger.info("[EmailService] Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("[EmailService] Failed to send email via SMTP, logging fallback instead. Error: {}", e.getMessage());
            logger.info("[EmailService FALLBACK] Email details:\n" +
                    "To: {}\nSubject: {}\nBody: {}", to, subject, text);
        }
    }

    public void sendRegistrationVerification(String email, String name) {
        String subject = "Welcome to FinTrust AI - Registration Verification";
        String body = String.format("Hello %s,\n\nThank you for registering on FinTrust AI.\n" +
                "Your registration request has been successfully submitted and is under review.\n\n" +
                "Best regards,\nFinTrust AI Team", name);
        sendEmail(email, subject, body);
    }

    public void sendForgotPasswordOtp(String email, String otp) {
        String subject = "FinTrust AI - Password Reset OTP";
        String body = String.format("Hello,\n\nWe received a request to reset your password.\n" +
                "Your secure verification OTP code is: %s\n" +
                "This code will expire in 15 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\nFinTrust AI Team", otp);
        sendEmail(email, subject, body);
    }

    public void sendLoanApproved(String email, String borrowerName, String bankName, double amount) {
        String subject = "Congratulations! Your Loan Application Has Been Approved";
        String body = String.format("Hello %s,\n\nGreat news! Your credit application has been approved by %s.\n" +
                "Approved Amount: INR %,.2f\n\n" +
                "Our representative will reach out to you shortly to complete the disbursement.\n\n" +
                "Best regards,\nFinTrust AI Team", borrowerName, bankName, amount);
        sendEmail(email, subject, body);
    }

    public void sendLoanRejected(String email, String borrowerName, String bankName, String reason) {
        String subject = "FinTrust AI - Loan Application Status Update";
        String body = String.format("Hello %s,\n\nThank you for applying for a credit line via FinTrust AI.\n" +
                "We regret to inform you that your loan application has been declined by %s.\n" +
                "Reason: %s\n\n" +
                "You can re-apply after 90 days with updated financial profiles.\n\n" +
                "Best regards,\nFinTrust AI Team", borrowerName, bankName, reason);
        sendEmail(email, subject, body);
    }

    public void sendRequestAdditionalDocuments(String email, String borrowerName, String bankName, String details) {
        String subject = "Action Required: Additional Documents Requested for Loan Review";
        String body = String.format("Hello %s,\n\n%s is reviewing your credit application and requires additional documentation:\n" +
                "Requested Items: %s\n\n" +
                "Please upload these items in your borrower portal dashboard under the custom uploads section.\n\n" +
                "Best regards,\nFinTrust AI Team", borrowerName, bankName, details);
        sendEmail(email, subject, body);
    }
}
