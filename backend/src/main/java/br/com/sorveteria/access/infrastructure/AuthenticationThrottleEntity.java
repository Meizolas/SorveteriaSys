package br.com.sorveteria.access.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "authentication_throttle")
public class AuthenticationThrottleEntity {
    @Id @Column(name = "subject_hash", columnDefinition = "BINARY(32)") private byte[] subjectHash;
    @Column(name = "window_started_at", nullable = false) private Instant windowStartedAt;
    @Column(name = "failure_count", nullable = false) private int failureCount;
    @Column(name = "blocked_until") private Instant blockedUntil;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected AuthenticationThrottleEntity() { }
    public AuthenticationThrottleEntity(byte[] hash, Instant now) {
        subjectHash = hash.clone(); windowStartedAt = now; updatedAt = now;
    }
    public Instant getWindowStartedAt() { return windowStartedAt; }
    public int getFailureCount() { return failureCount; }
    public Instant getBlockedUntil() { return blockedUntil; }
    public void reset(Instant now) { windowStartedAt = now; failureCount = 0; blockedUntil = null; updatedAt = now; }
    public void fail(Instant now, Instant blockUntil) { failureCount++; blockedUntil = blockUntil; updatedAt = now; }
}

