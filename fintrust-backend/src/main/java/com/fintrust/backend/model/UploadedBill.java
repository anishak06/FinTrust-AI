package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "uploaded_bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadedBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String billType; // ELECTRICITY, WATER, INTERNET, MOBILE, GAS, RENT, BANK_STATEMENT
    private String merchantName;
    private Double amount;
    private String dueDate;
    private String paymentDate;
    private String paymentStatus; // PAID_ON_TIME, PAID_LATE, UNPAID
    private String fileName;
    private String filePath;
    private LocalDateTime uploadDate = LocalDateTime.now();
}
