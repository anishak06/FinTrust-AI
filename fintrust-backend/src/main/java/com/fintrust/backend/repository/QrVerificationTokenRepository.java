package com.fintrust.backend.repository;

import com.fintrust.backend.model.QrVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrVerificationTokenRepository extends JpaRepository<QrVerificationToken, Long> {
    Optional<QrVerificationToken> findByToken(String token);
}
