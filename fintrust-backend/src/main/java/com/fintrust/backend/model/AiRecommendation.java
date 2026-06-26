package com.fintrust.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "ai_recommendations",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "month", "year"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private Integer year;

    @Column(columnDefinition = "TEXT")
    private String geminiInsights;

    @Column(columnDefinition = "TEXT")
    private String strengths; // What You're Doing Well

    @Column(columnDefinition = "TEXT")
    private String weaknesses; // Areas To Watch

    @Column(columnDefinition = "TEXT")
    private String recommendations; // Personalized Recommendations

    private LocalDateTime timestamp = LocalDateTime.now();
}
