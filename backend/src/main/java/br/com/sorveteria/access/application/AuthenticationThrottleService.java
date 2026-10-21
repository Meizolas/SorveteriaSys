package br.com.sorveteria.access.application;

import br.com.sorveteria.access.domain.User;
import br.com.sorveteria.access.infrastructure.AuthenticationThrottleEntity;
import br.com.sorveteria.access.infrastructure.AuthenticationThrottleRepository;
import br.com.sorveteria.platform.config.ApplicationProperties;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationThrottleService {
  private static final Duration WINDOW = Duration.ofMinutes(15);
  private static final Duration BLOCK = Duration.ofMinutes(15);
  private static final int LIMIT = 5;
  private final AuthenticationThrottleRepository repository;
  private final byte[] key;
  private final Clock clock = Clock.systemUTC();

  public AuthenticationThrottleService(
      AuthenticationThrottleRepository repository, ApplicationProperties properties) {
    this.repository = repository;
    this.key = properties.security().throttleHmacKey().getBytes(StandardCharsets.UTF_8);
    if (key.length < 32) {
      throw new IllegalStateException("auth_throttle_hmac_key deve ter ao menos 32 bytes");
    }
  }

  @Transactional(readOnly = true)
  public Decision check(String login, String origin) {
    Instant now = clock.instant();
    return repository
        .findById(subject(login, origin))
        .filter(entity -> entity.getBlockedUntil() != null && entity.getBlockedUntil().isAfter(now))
        .map(
            entity ->
                new Decision(false, Duration.between(now, entity.getBlockedUntil()).toSeconds()))
        .orElseGet(() -> new Decision(true, 0));
  }

  @Transactional
  public Decision failure(String login, String origin) {
    Instant now = clock.instant();
    byte[] subject = subject(login, origin);
    AuthenticationThrottleEntity entity =
        repository
            .findById(subject)
            .orElseGet(() -> new AuthenticationThrottleEntity(subject, now));
    if (!entity.getWindowStartedAt().plus(WINDOW).isAfter(now)) {
      entity.reset(now);
    }
    Instant blockedUntil = entity.getFailureCount() + 1 >= LIMIT ? now.plus(BLOCK) : null;
    entity.fail(now, blockedUntil);
    repository.save(entity);
    return blockedUntil == null ? new Decision(true, 0) : new Decision(false, BLOCK.toSeconds());
  }

  @Transactional
  public void success(String login, String origin) {
    repository.deleteById(subject(login, origin));
  }

  private byte[] subject(String login, String origin) {
    try {
      String canonical;
      try {
        canonical = User.normalizeLogin(login);
      } catch (IllegalArgumentException ignored) {
        canonical = "invalid";
      }
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(key, "HmacSHA256"));
      return mac.doFinal(
          (canonical + "\n" + normalizeOrigin(origin)).getBytes(StandardCharsets.UTF_8));
    } catch (java.security.GeneralSecurityException exception) {
      throw new IllegalStateException("HMAC indisponível", exception);
    }
  }

  private String normalizeOrigin(String origin) {
    if (origin == null || origin.isBlank()) {
      return "unknown";
    }
    String value = origin.trim().toLowerCase(java.util.Locale.ROOT);
    return value.length() > 45 ? value.substring(0, 45) : value;
  }

  public record Decision(boolean allowed, long retryAfterSeconds) {}
}
