package br.com.sorveteria.platform.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("sorveteria")
public record ApplicationProperties(
        @Valid @NotNull Security security,
        @Valid @NotNull Installation installation) {

    public record Security(
            @NotBlank String throttleHmacKey,
            @NotNull Duration absoluteSessionTimeout,
            @NotNull Duration temporaryPasswordLifetime) {
    }

    public record Installation(@NotBlank String expectedSchemaVersion) {
    }
}

