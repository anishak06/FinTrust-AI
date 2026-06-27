package com.fintrust.backend.repository;

import com.fintrust.backend.model.LoanDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanDecisionRepository extends JpaRepository<LoanDecision, Long> {
    List<LoanDecision> findByLenderId(Long lenderId);
    Optional<LoanDecision> findFirstByBorrowerIdOrderByTimestampDesc(Long borrowerId);
}
