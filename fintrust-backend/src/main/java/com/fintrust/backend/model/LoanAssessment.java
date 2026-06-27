package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "loan_assessments",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "assessment_month", "assessment_year"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(name = "assessment_month", nullable = false)
    private String month;

    @Column(name = "assessment_year", nullable = false)
    private Integer year;

    private Boolean eligibility;
    private Double loanAmount;
    private String riskCategory;
    private LocalDateTime createdAt = LocalDateTime.now();
}
