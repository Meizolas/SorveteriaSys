package br.com.sorveteria.reporting.web;

import br.com.sorveteria.reporting.application.SalesReportService;
import br.com.sorveteria.reporting.application.SalesReportService.SalesReport;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportingController {
  private final SalesReportService reports;

  public ReportingController(SalesReportService reports) {
    this.reports = reports;
  }

  @GetMapping("/sales")
  SalesReport sales(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    return reports.report(from, to);
  }
}
