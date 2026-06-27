package com.fintrust.backend.repository;

import com.fintrust.backend.model.ActiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActiveSessionRepository extends JpaRepository<ActiveSession, Long> {
    Optional<ActiveSession> findByUserIdAndIsValidTrue(Long userId);
    Optional<ActiveSession> findBySessionTokenAndIsValidTrue(String sessionToken);
    void deleteByUserId(Long userId);
}
