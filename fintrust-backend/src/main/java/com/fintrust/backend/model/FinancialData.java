package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "financial_data",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "assessment_month", "assessment_year"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(name = "assessment_month", nullable = false)
    private String month;

    @Column(name = "assessment_year", nullable = false)
    private Integer year;

    private Double income;
    private Double savings;
    private Double expenses;
    private String incomeStability; // Stable salaried income, Consistent freelancer, etc.
    private Integer transactionCount; // UPI transaction frequency
    private Double paymentConsistency; // calculated payment consistency %

    private LocalDateTime createdAt = LocalDateTime.now();
}
