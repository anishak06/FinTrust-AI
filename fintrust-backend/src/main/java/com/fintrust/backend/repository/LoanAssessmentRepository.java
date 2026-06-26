package com.fintrust.backend.repository;

import com.fintrust.backend.model.LoanAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LoanAssessmentRepository extends JpaRepository<LoanAssessment, Long> {
    Optional<LoanAssessment> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
