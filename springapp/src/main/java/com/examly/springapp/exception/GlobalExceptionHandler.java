package com.examly.springapp.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFoundException(EntityNotFoundException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Ticket not found");
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> body = new HashMap<>();
        String msg = ex.getMessage();
        if (msg != null && msg.toLowerCase().contains("not found")) {
            body.put("message", "Ticket not found");
            return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
        }
        if (msg != null && msg.toLowerCase().contains("invalid status")) {
            // The ONLY case BAD_REQUEST for invalid status
            body.put("message", "Invalid status: " + msg.split(":", 2)[1].trim());
            return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Invalid input");
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> body = new LinkedHashMap<>();
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        body.put("message", msg);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAll(Exception ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Unexpected error");
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
