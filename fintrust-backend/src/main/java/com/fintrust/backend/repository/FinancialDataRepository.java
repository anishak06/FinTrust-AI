package com.fintrust.backend.repository;

import com.fintrust.backend.model.FinancialData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FinancialDataRepository extends JpaRepository<FinancialData, Long> {
    Optional<FinancialData> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
