package br.com.sorveteria.dashboard.web;

import br.com.sorveteria.dashboard.application.DashboardService;
import br.com.sorveteria.dashboard.application.DashboardService.DashboardView;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
  private final DashboardService dashboard;

  public DashboardController(DashboardService dashboard) {
    this.dashboard = dashboard;
  }

  @GetMapping
  DashboardView overview() {
    return dashboard.overview();
  }
}
