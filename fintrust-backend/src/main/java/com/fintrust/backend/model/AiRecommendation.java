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
        @UniqueConstraint(columnNames = {"userId", "assessment_month", "assessment_year"})
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

    @Column(name = "assessment_month", nullable = false)
    private String month;

    @Column(name = "assessment_year", nullable = false)
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
