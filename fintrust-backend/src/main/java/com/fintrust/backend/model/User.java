package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String username; // Serves as username / login credential

    @Column(nullable = false)
    @Convert(converter = com.fintrust.backend.security.AttributeEncryptor.class)
    private String email;

    @Column(nullable = false)
    private String password;

    private String occupation;

    @Column(nullable = false)
    private String role; // ROLE_USER, ROLE_ADMIN

    private Integer age;
    private String employmentType;
    private Double monthlyIncome;
    private String city;
    private String phoneNumber;
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    private LocalDateTime createdAt = LocalDateTime.now();
}
