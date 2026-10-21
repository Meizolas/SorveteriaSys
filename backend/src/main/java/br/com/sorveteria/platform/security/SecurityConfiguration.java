package br.com.sorveteria.platform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.context.SecurityContextHolderFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {
    private final SessionValidationFilter sessionValidationFilter;

    public SecurityConfiguration(SessionValidationFilter sessionValidationFilter) {
        this.sessionValidationFilter = sessionValidationFilter;
    }
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrf = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrf.setCookieName("XSRF-TOKEN");
        csrf.setHeaderName("X-XSRF-TOKEN");
        csrf.setCookiePath("/");

        http
                .csrf(configurer -> configurer.csrfTokenRepository(csrf))
                .sessionManagement(configurer -> configurer
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation(fixation -> fixation.migrateSession()))
                .rememberMe(configurer -> configurer.disable())
                .requestCache(configurer -> configurer.disable())
                .httpBasic(configurer -> configurer.disable())
                .formLogin(configurer -> configurer.disable())
                .logout(configurer -> configurer.disable())
                .authorizeHttpRequests(registry -> registry
                        .requestMatchers(HttpMethod.GET, "/health/live", "/health/ready").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/session/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/session").permitAll()
                        .requestMatchers("/api/v1/session/**").authenticated()
                        .requestMatchers("/api/v1/categories/**", "/api/v1/products/**",
                                "/api/v1/stock/**", "/api/v1/sales/**").authenticated()
                        .requestMatchers("/api/v1/roles", "/api/v1/users/**", "/api/v1/store", "/api/v1/audit-events").authenticated()
                        .anyRequest().denyAll())
                .addFilterAfter(sessionValidationFilter, SecurityContextHolderFilter.class);
        return http.build();
    }
}

