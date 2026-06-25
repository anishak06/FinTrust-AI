package com.fintrust.backend.controller;

import com.fintrust.backend.model.Goal;
import com.fintrust.backend.repository.GoalRepository;
import com.fintrust.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @GetMapping
    public ResponseEntity<List<Goal>> getUserGoals() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();
        return ResponseEntity.ok(goalRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestBody Goal goal) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        goal.setUserId(userId);
        calculateGoalStats(goal);

        Goal saved = goalRepository.save(goal);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody Goal goalDetails) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        Optional<Goal> optionalGoal = goalRepository.findById(id);
        if (optionalGoal.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Goal goal = optionalGoal.get();
        if (!goal.getUserId().equals(userId)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Unauthorized to update this goal.");
            return ResponseEntity.badRequest().body(response);
        }

        goal.setName(goalDetails.getName());
        goal.setTargetAmount(goalDetails.getTargetAmount());
        goal.setCurrentSavings(goalDetails.getCurrentSavings());
        goal.setTargetDate(goalDetails.getTargetDate());
        
        calculateGoalStats(goal);

        Goal updated = goalRepository.save(goal);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = principal.getId();

        Optional<Goal> optionalGoal = goalRepository.findById(id);
        if (optionalGoal.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Goal goal = optionalGoal.get();
        if (!goal.getUserId().equals(userId)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Unauthorized to delete this goal.");
            return ResponseEntity.badRequest().body(response);
        }

        goalRepository.delete(goal);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Goal deleted successfully!");
        return ResponseEntity.ok(response);
    }

    private void calculateGoalStats(Goal goal) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate target = LocalDate.parse(goal.getTargetDate());
            long monthsBetween = ChronoUnit.MONTHS.between(today.withDayOfMonth(1), target.withDayOfMonth(1));
            
            if (monthsBetween <= 0) {
                monthsBetween = 1;
            }

            double remaining = goal.getTargetAmount() - goal.getCurrentSavings();
            if (remaining < 0) {
                remaining = 0.0;
            }

            double monthlyNeeded = remaining / monthsBetween;
            
            goal.setEstimatedMonths((int) monthsBetween);
            goal.setMonthlySavingsNeeded(Math.round(monthlyNeeded * 100.0) / 100.0);
        } catch (Exception e) {
            // Fallback in case of parsing issues
            goal.setEstimatedMonths(12);
            double remaining = goal.getTargetAmount() - goal.getCurrentSavings();
            goal.setMonthlySavingsNeeded(Math.round((remaining / 12.0) * 100.0) / 100.0);
        }
    }
}
