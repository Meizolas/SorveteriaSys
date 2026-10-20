package br.com.sorveteria.platform.web;

import br.com.sorveteria.access.application.TooManyAttemptsException;
import br.com.sorveteria.platform.observability.CorrelationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ProblemDetail> handleApi(ApiException exception, HttpServletRequest request) {
        return response(exception.status(), exception.code(), exception.getMessage(), request, null);
    }

    @ExceptionHandler(TooManyAttemptsException.class)
    ResponseEntity<ProblemDetail> handleThrottle(
            TooManyAttemptsException exception,
            HttpServletRequest request) {
        ResponseEntity<ProblemDetail> base = response(HttpStatus.TOO_MANY_REQUESTS,
                "AUTHENTICATION_THROTTLED", exception.getMessage(), request, null);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", Long.toString(exception.retryAfter()))
                .body(base.getBody());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemDetail> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        List<Violation> violations = exception.getBindingResult().getFieldErrors().stream()
                .map(this::toViolation)
                .toList();
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Dados inválidos.", request, violations);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ProblemDetail> handleConstraint(
            ConstraintViolationException exception,
            HttpServletRequest request) {
        List<Violation> violations = exception.getConstraintViolations().stream()
                .map(item -> new Violation(item.getPropertyPath().toString(), "INVALID", item.getMessage()))
                .toList();
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Dados inválidos.", request, violations);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemDetail> handleUnexpected(Exception exception, HttpServletRequest request) {
        LOGGER.error("Unhandled request failure", exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "Não foi possível concluir a operação.", request, null);
    }

    private ResponseEntity<ProblemDetail> response(
            HttpStatus status,
            String code,
            String detail,
            HttpServletRequest request,
            List<Violation> violations) {
        String correlationId = CorrelationFilter.correlationId(request).toString();
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(status.getReasonPhrase());
        problem.setType(URI.create("urn:sorveteria:problem:" + code.toLowerCase()));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", code);
        problem.setProperty("correlationId", correlationId);
        if (violations != null && !violations.isEmpty()) {
            problem.setProperty("violations", violations);
        }
        return ResponseEntity.status(status).body(problem);
    }

    private Violation toViolation(FieldError error) {
        return new Violation(error.getField(), "INVALID", error.getDefaultMessage());
    }

    public record Violation(String field, String code, String message) { }
}

