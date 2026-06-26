package com.fintrust.backend.repository;

import com.fintrust.backend.model.UploadedBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UploadedBillRepository extends JpaRepository<UploadedBill, Long> {
    List<UploadedBill> findByUserIdOrderByUploadDateDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndPaymentStatus(Long userId, String paymentStatus);
}
