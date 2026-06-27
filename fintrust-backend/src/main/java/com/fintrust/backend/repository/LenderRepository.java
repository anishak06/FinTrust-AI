package com.fintrust.backend.repository;

import com.fintrust.backend.model.Lender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LenderRepository extends JpaRepository<Lender, Long> {
    Optional<Lender> findByEmail(String email);
    boolean existsByEmail(String email);
}
