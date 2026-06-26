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
    private String email;

    @Column(nullable = false)
    private String password;

    private String occupation;

    @Column(nullable = false)
    private String role; // ROLE_USER, ROLE_ADMIN

    private LocalDateTime createdAt = LocalDateTime.now();
}
