package com.fintrust.backend.repository;

import com.fintrust.backend.model.CreditAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditAssessmentRepository extends JpaRepository<CreditAssessment, Long> {
    List<CreditAssessment> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CreditAssessment> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Admin stats queries
    long countByScoreGreaterThanEqual(int score);
}
