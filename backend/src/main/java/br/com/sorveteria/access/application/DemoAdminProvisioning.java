package br.com.sorveteria.access.application;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("development")
@ConditionalOnProperty(name = "sorveteria.demo.enabled", havingValue = "true")
public class DemoAdminProvisioning implements ApplicationRunner {
    private final AdminProvisioningService provisioning;
    private final String password;

    public DemoAdminProvisioning(
            AdminProvisioningService provisioning,
            @Value("${demo_admin_password}") String password) {
        this.provisioning = provisioning;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        char[] passwordCharacters = password.toCharArray();
        try {
            provisioning.provision("admin", "Administrador", passwordCharacters, UUID.randomUUID());
        } catch (IllegalStateException alreadyProvisioned) {
            // O bootstrap é idempotente: uma instalação existente preserva sua conta atual.
        } finally {
            java.util.Arrays.fill(passwordCharacters, '\0');
        }
    }
}
