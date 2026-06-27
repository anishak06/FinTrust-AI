package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lenders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lender {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String branchName;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String designation;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private String bankAddress;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "ROLE_LENDER";

    private LocalDateTime createdAt = LocalDateTime.now();
}
