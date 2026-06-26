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
        @UniqueConstraint(columnNames = {"userId", "month", "year"})
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

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private Integer year;

    private Double income;
    private Double savings;
    private Double expenses;
    private String incomeStability; // Stable salaried income, Consistent freelancer, etc.
    private Integer transactionCount; // UPI transaction frequency
    private Double paymentConsistency; // calculated payment consistency %

    private LocalDateTime createdAt = LocalDateTime.now();
}
