package com.IMS.inventory_management_system.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request) {
        Map<String, Object> body = basePayload(request.getRequestURI());
        String message = ex.getReason();
        if (message == null || message.isBlank()) {
            message = ex.getStatusCode().toString();
        }
        body.put("status", ex.getStatusCode().value());
        body.put("message", message);
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler({ BadCredentialsException.class, UsernameNotFoundException.class })
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(HttpServletRequest request) {
        Map<String, Object> body = basePayload(request.getRequestURI());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("message", "Invalid credentials.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    private Map<String, Object> basePayload(String path) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("path", path);
        return body;
    }
}
