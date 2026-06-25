package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    // Financial Inputs
    private Double monthlyIncome;
    private Double monthlyExpenses;
    private Double monthlySavings;
    private String utilityBillConsistency; // CONSISTENT, SEMI_CONSISTENT, INCONSISTENT
    private Integer upiTransactionFrequency; // Transactions per month
    private String employmentType; // SALARIED, SELF_EMPLOYED, UNEMPLOYED, STUDENT
    private String occupation;
    private Double existingLoans;

    // Assessment Outputs
    private Integer score; // 0 to 1000
    private String riskCategory; // Low Risk, Medium Risk, High Risk
    private String healthStatus; // Excellent, Good, Fair, Poor

    // Explainable Credit Breakdown & Recommendations (Stored as JSON Text)
    @Column(columnDefinition = "TEXT")
    private String scoreBreakdown;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    // Loan Eligibility
    private Boolean loanEligible;
    private Double suggestedLoanAmount;
    private String loanRiskLevel;
    private Double confidenceScore;

    private LocalDateTime createdAt = LocalDateTime.now();
}
