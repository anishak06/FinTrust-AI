package com.fintrust.backend.repository;

import com.fintrust.backend.model.LenderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LenderHistoryRepository extends JpaRepository<LenderHistory, Long> {
    List<LenderHistory> findByLenderIdOrderByViewedAtDesc(Long lenderId);
    Optional<LenderHistory> findByLenderIdAndBorrowerId(Long lenderId, Long borrowerId);
}
