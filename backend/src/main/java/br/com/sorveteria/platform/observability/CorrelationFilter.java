package br.com.sorveteria.platform.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationFilter extends OncePerRequestFilter {
    public static final String HEADER = "X-Correlation-ID";
    public static final String ATTRIBUTE = CorrelationFilter.class.getName() + ".id";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        UUID correlationId = parseOrCreate(request.getHeader(HEADER));
        request.setAttribute(ATTRIBUTE, correlationId);
        response.setHeader(HEADER, correlationId.toString());
        long startedAt = System.nanoTime();
        try (MDC.MDCCloseable ignored = MDC.putCloseable("correlationId", correlationId.toString())) {
            filterChain.doFilter(request, response);
        } finally {
            request.setAttribute("durationMicros", (System.nanoTime() - startedAt) / 1_000L);
        }
    }

    public static UUID correlationId(HttpServletRequest request) {
        Object value = request.getAttribute(ATTRIBUTE);
        return value instanceof UUID id ? id : UUID.randomUUID();
    }

    private UUID parseOrCreate(String raw) {
        if (raw == null || raw.isBlank() || raw.length() > 36) {
            return UUID.randomUUID();
        }
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException ignored) {
            return UUID.randomUUID();
        }
    }
}

