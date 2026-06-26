package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Integer score;
    private String riskLevel;

    @Column(columnDefinition = "TEXT")
    private String scoreBreakdown; // stored as JSON String

    private LocalDateTime calculationDate = LocalDateTime.now();
}
