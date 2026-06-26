package com.fintrust.backend.repository;

import com.fintrust.backend.model.CreditScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditScoreRepository extends JpaRepository<CreditScore, Long> {
    Optional<CreditScore> findFirstByUserIdOrderByCalculationDateDesc(Long userId);
    List<CreditScore> findByUserIdOrderByCalculationDateDesc(Long userId);
}
