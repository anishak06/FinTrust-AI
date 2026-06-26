package com.fintrust.backend.service;

import com.fintrust.backend.model.AuditLog;
import com.fintrust.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(Long userId, String action, String status) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setStatus(status);
        auditLogRepository.save(log);
    }
}
