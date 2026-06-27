package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "credit_scores",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "assessment_month", "assessment_year"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(name = "assessment_month", nullable = false)
    private String month;

    @Column(name = "assessment_year", nullable = false)
    private Integer year;

    private Integer score;
    private String riskLevel;
    private String fraudRisk; // Low, Medium, High
    
    private Integer traditionalScore;
    private Double maxLendableAmount;

    @Column(columnDefinition = "TEXT")
    private String scoreBreakdown; // stored as JSON String

    private LocalDateTime calculationDate = LocalDateTime.now();
}
