package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_decisions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lenderId;

    @Column(nullable = false)
    private Long borrowerId;

    @Column(nullable = false)
    private String decision; // APPROVED, REJECTED, DOCUMENTS_REQUESTED

    @Column(columnDefinition = "TEXT")
    private String reason;

    private LocalDateTime timestamp = LocalDateTime.now();
}
