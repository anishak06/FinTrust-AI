package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "active_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String deviceId;

    @Column(nullable = false, length = 1000)
    private String sessionToken;

    private String ipAddress;

    private LocalDateTime lastActive = LocalDateTime.now();

    @Column(nullable = false)
    private boolean isValid = true;
}
