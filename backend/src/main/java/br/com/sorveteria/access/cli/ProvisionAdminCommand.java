package br.com.sorveteria.access.cli;

import br.com.sorveteria.access.application.AdminProvisioningService;
import java.io.Console;
import java.util.Arrays;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "sorveteria.command", havingValue = "provision-admin")
public class ProvisionAdminCommand implements CommandLineRunner {
  private final AdminProvisioningService provisioning;

  public ProvisionAdminCommand(AdminProvisioningService provisioning) {
    this.provisioning = provisioning;
  }

  @Override
  public void run(String... args) {
    Console console = System.console();
    if (console == null) {
      throw new IllegalStateException("provision-admin exige TTY interativo");
    }
    String login = console.readLine("Login do administrador: ");
    String name = console.readLine("Nome do administrador: ");
    char[] password = console.readPassword("Senha permanente: ");
    char[] confirmation = console.readPassword("Confirme a senha: ");
    try {
      if (!Arrays.equals(password, confirmation)) {
        throw new IllegalArgumentException("As senhas não coincidem");
      }
      Long id = provisioning.provision(login, name, password, UUID.randomUUID());
      console.printf("Administrador provisionado com identificador %d.%n", id);
    } finally {
      if (password != null) {
        Arrays.fill(password, '\0');
      }
      if (confirmation != null) {
        Arrays.fill(confirmation, '\0');
      }
    }
  }
}
