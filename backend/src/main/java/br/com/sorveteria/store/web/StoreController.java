package br.com.sorveteria.store.web;

import br.com.sorveteria.access.application.AccessPermissions;
import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.platform.observability.CorrelationFilter;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.store.application.StoreConfigurationService;
import br.com.sorveteria.store.domain.StoreConfiguration;
import br.com.sorveteria.store.domain.StoreConfiguration.StoreData;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/store")
public class StoreController {
  private final StoreConfigurationService service;

  public StoreController(StoreConfigurationService service) { this.service = service; }

  @GetMapping
  @PreAuthorize("hasAuthority('" + AccessPermissions.STORE_READ + "')")
  ResponseEntity<StoreView> get() {
    StoreConfiguration store = service.get();
    return ResponseEntity.ok().eTag(etag(store)).body(StoreView.from(store));
  }

  @PutMapping
  @PreAuthorize("hasAuthority('" + AccessPermissions.STORE_WRITE + "')")
  ResponseEntity<StoreView> save(@Valid @RequestBody StoreInput input,
      @RequestHeader(value = HttpHeaders.IF_MATCH, required = false) String ifMatch,
      Authentication authentication, HttpServletRequest request) {
    StoreConfigurationService.SaveResult result = service.save(input.data(), version(ifMatch),
        principal(authentication), CorrelationFilter.correlationId(request), request.getRemoteAddr());
    HttpStatus status = result.created() ? HttpStatus.CREATED : HttpStatus.OK;
    return ResponseEntity.status(status).eTag(etag(result.store())).body(StoreView.from(result.store()));
  }

  private Long version(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    try {
      return Long.valueOf(value.replace("\"", ""));
    } catch (NumberFormatException exception) {
      throw new ApiException(HttpStatus.PRECONDITION_FAILED,
          "INVALID_ETAG", "Versão de configuração inválida.");
    }
  }

  private String etag(StoreConfiguration store) { return "\"" + store.getVersion() + "\""; }

  private UserPrincipal principal(Authentication authentication) {
    if (authentication.getPrincipal() instanceof UserPrincipal value) {
      return value;
    }
    throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_REQUIRED", "Autenticação necessária.");
  }

  public record AddressInput(String postalCode, @Size(max = 160) String street,
      @Size(max = 30) String number, @Size(max = 120) String complement,
      @Size(max = 120) String district, @Size(max = 120) String city,
      @Size(max = 2) String stateCode, @Size(max = 2) String countryCode) { }

  public record StoreInput(@NotBlank @Size(min = 2, max = 120) String tradeName,
      @Size(max = 160) String legalName, @Size(max = 18) String taxId,
      AddressInput address, @NotBlank String currencyCode, @NotBlank String timeZone) {
    StoreData data() {
      AddressInput item = address == null ? new AddressInput(null, null, null, null, null, null, null, null) : address;
      return new StoreData(tradeName, legalName, taxId, item.postalCode(), item.street(),
          item.number(), item.complement(), item.district(), item.city(), item.stateCode(),
          item.countryCode(), currencyCode, timeZone);
    }
  }

  public record AddressView(String postalCode, String street, String number, String complement,
      String district, String city, String stateCode, String countryCode) { }

  public record StoreView(String id, String tradeName, String legalName, String taxId,
      AddressView address, String currencyCode, String timeZone, long version,
      Instant createdAt, Instant updatedAt) {
    static StoreView from(StoreConfiguration store) {
      AddressView address = new AddressView(store.getPostalCode(), store.getStreet(), store.getNumber(),
          store.getComplement(), store.getDistrict(), store.getCity(), store.getStateCode(),
          store.getCountryCode());
      return new StoreView("1", store.getTradeName(), store.getLegalName(), store.getTaxId(),
          address, store.getCurrencyCode(), store.getTimeZone(), store.getVersion(),
          store.getCreatedAt(), store.getUpdatedAt());
    }
  }
}
