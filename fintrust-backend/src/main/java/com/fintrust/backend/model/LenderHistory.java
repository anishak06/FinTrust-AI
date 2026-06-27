package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lender_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LenderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lenderId;

    @Column(nullable = false)
    private Long borrowerId;

    private LocalDateTime viewedAt = LocalDateTime.now();
}
