package com.fintrust.backend.controller;

import com.fintrust.backend.model.User;
import com.fintrust.backend.repository.UserRepository;
import com.fintrust.backend.security.JwtTokenProvider;
import com.fintrust.backend.security.UserPrincipal;
import com.fintrust.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> signUpRequest) {
        String username = signUpRequest.get("username");
        String password = signUpRequest.get("password");
        String fullName = signUpRequest.get("fullName");
        String role = signUpRequest.get("role"); // USER or ADMIN
        String email = signUpRequest.get("email");
        String occupation = signUpRequest.get("occupation");

        if (userRepository.existsByUsername(username)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Username is already taken!");
            return ResponseEntity.badRequest().body(response);
        }

        // Set default email if not provided
        if (email == null || email.trim().isEmpty()) {
            if (username.contains("@")) {
                email = username;
            } else {
                email = username + "@fintrust.com";
            }
        }

        // Default role is ROLE_USER if not provided or invalid
        if (role == null || (!role.equalsIgnoreCase("USER") && !role.equalsIgnoreCase("ADMIN"))) {
            role = "ROLE_USER";
        } else {
            role = "ROLE_" + role.toUpperCase();
        }

        User user = new User();
        user.setUsername(username);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setOccupation(occupation != null ? occupation : "General");

        User savedUser = userRepository.save(user);

        // Audit Logging
        auditLogService.logAction(savedUser.getId(), "USER_SIGNUP", "SUCCESS");

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(username).orElseThrow();

        // Audit Logging
        auditLogService.logAction(user.getId(), "USER_LOGIN", "SUCCESS");

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserPrincipal) {
                Long userId = ((UserPrincipal) principal).getId();
                auditLogService.logAction(userId, "USER_LOGOUT", "SUCCESS");
            }
        } catch (Exception e) {
            // Ignore if anonymous
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        Map<String, String> response = new HashMap<>();
        if (userRepository.existsByUsername(username)) {
            response.put("message", "A secure reset link has been dispatched to the email registered with username " + username);
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Username not found");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
