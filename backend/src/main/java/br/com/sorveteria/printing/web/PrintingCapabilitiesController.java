package br.com.sorveteria.printing.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/printing")
public class PrintingCapabilitiesController {
  @GetMapping("/capabilities")
  PrintingCapabilities capabilities() {
    return new PrintingCapabilities("SYSTEM_DIALOG", 80, false,
        "Impressao pelo dialogo do sistema. Selecione a impressora termica instalada.");
  }

  public record PrintingCapabilities(String mode, int paperWidthMm,
      boolean directConnectorAvailable, String guidance) {}
}
