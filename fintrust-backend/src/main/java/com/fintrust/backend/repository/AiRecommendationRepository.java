package com.fintrust.backend.repository;

import com.fintrust.backend.model.AiRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, Long> {
    Optional<AiRecommendation> findFirstByUserIdOrderByTimestampDesc(Long userId);
}
