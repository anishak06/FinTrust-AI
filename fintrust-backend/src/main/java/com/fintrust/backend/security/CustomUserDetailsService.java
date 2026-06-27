package com.fintrust.backend.security;

import com.fintrust.backend.model.User;
import com.fintrust.backend.model.Lender;
import com.fintrust.backend.repository.UserRepository;
import com.fintrust.backend.repository.LenderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LenderRepository lenderRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to load as borrower User first
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            return UserPrincipal.create(userOpt.get());
        }

        // Try to load as Lender by email next
        Optional<Lender> lenderOpt = lenderRepository.findByEmail(username);
        if (lenderOpt.isPresent()) {
            return UserPrincipal.create(lenderOpt.get());
        }

        throw new UsernameNotFoundException("Principal not found with username/email: " + username);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserByIdAndRole(Long id, String role) {
        if ("ROLE_LENDER".equalsIgnoreCase(role)) {
            Lender lender = lenderRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("Lender not found with id: " + id));
            return UserPrincipal.create(lender);
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        return UserPrincipal.create(user);
    }
}
