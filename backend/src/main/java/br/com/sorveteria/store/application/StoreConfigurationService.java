package br.com.sorveteria.store.application;

import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.audit.application.AuditRecorder;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.store.domain.StoreConfiguration;
import br.com.sorveteria.store.domain.StoreConfiguration.StoreData;
import br.com.sorveteria.store.infrastructure.StoreRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoreConfigurationService {
  private static final Pattern DIGITS_14 = Pattern.compile("[0-9]{14}");
  private static final Pattern DIGITS_8 = Pattern.compile("[0-9]{8}");
  private static final Set<String> STATES = Set.of("AC", "AL", "AP", "AM", "BA", "CE", "DF",
      "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
      "RS", "RO", "RR", "SC", "SP", "SE", "TO");
  private final StoreRepository stores;
  private final AuditRecorder audit;
  private final Clock clock = Clock.systemUTC();

  public StoreConfigurationService(StoreRepository stores, AuditRecorder audit) {
    this.stores = stores;
    this.audit = audit;
  }

  @Transactional(readOnly = true)
  public StoreConfiguration get() {
    return stores.findById((short) 1).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
        "STORE_NOT_CONFIGURED", "A loja ainda não foi configurada."));
  }

  @Transactional
  public SaveResult save(StoreData raw, Long expectedVersion, UserPrincipal actor,
      UUID correlationId, String sourceAddress) {
    StoreData data = validate(raw);
    StoreConfiguration current = stores.findById((short) 1).orElse(null);
    boolean created = current == null;
    if (!created && (expectedVersion == null || current.getVersion() != expectedVersion)) {
      throw new ApiException(HttpStatus.PRECONDITION_FAILED, "STALE_STORE",
          "A configuração foi alterada. Recarregue os dados e tente novamente.");
    }
    Map<String, ?> before = created ? Map.of() : snapshot(current);
    Instant now = clock.instant();
    StoreConfiguration store = created
        ? StoreConfiguration.create(data, actor.userId(), now) : current;
    if (!created) {
      store.update(data, actor.userId(), now);
    }
    StoreConfiguration saved = stores.saveAndFlush(store);
    audit.record(new AuditRecorder.Event(created ? "STORE_CREATED" : "STORE_UPDATED",
        AuditEventEntity.Outcome.SUCCEEDED, actor.userId(), actor.login(), actor.displayName(),
        "STORE", "1", null, correlationId, AuditEventEntity.OriginType.NETWORK,
        sourceAddress, before, snapshot(saved)));
    return new SaveResult(saved, created);
  }

  private StoreData validate(StoreData raw) {
    String tradeName = required(raw.tradeName(), 2, 120, "Nome de uso inválido.");
    String legalName = optional(raw.legalName(), 2, 160, "Razão social inválida.");
    String taxId = digits(raw.taxId());
    if (taxId != null && (!DIGITS_14.matcher(taxId).matches() || !validCnpj(taxId))) {
      throw invalid("CNPJ inválido.");
    }
    String postalCode = digits(raw.postalCode());
    if (postalCode != null && !DIGITS_8.matcher(postalCode).matches()) {
      throw invalid("CEP inválido.");
    }
    String state = upper(raw.stateCode());
    if (state != null && !STATES.contains(state)) {
      throw invalid("UF inválida.");
    }
    String country = upper(raw.countryCode());
    if (country != null && !"BR".equals(country)) {
      throw invalid("País inválido.");
    }
    if (!"BRL".equals(raw.currencyCode())) {
      throw invalid("A moeda deve ser BRL.");
    }
    String zone = required(raw.timeZone(), 1, 64, "Fuso horário inválido.");
    try {
      ZoneId.of(zone);
    } catch (RuntimeException exception) {
      throw invalid("Fuso horário inválido.");
    }
    return new StoreData(tradeName, legalName, taxId, postalCode,
        optional(raw.street(), 1, 160, "Logradouro inválido."),
        optional(raw.number(), 1, 30, "Número inválido."),
        optional(raw.complement(), 1, 120, "Complemento inválido."),
        optional(raw.district(), 1, 120, "Bairro inválido."),
        optional(raw.city(), 1, 120, "Cidade inválida."), state, country, "BRL", zone);
  }

  private String required(String value, int min, int max, String message) {
    String result = value == null ? "" : value.trim();
    if (result.length() < min || result.length() > max) {
      throw invalid(message);
    }
    return result;
  }

  private String optional(String value, int min, int max, String message) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return required(value, min, max, message);
  }

  private String digits(String value) {
    return value == null || value.isBlank() ? null : value.replaceAll("[^0-9]", "");
  }

  private String upper(String value) {
    return value == null || value.isBlank() ? null : value.trim().toUpperCase(java.util.Locale.ROOT);
  }

  private boolean validCnpj(String value) {
    if (value.chars().distinct().count() == 1) {
      return false;
    }
    int[] first = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    int[] second = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    return digit(value, first) == value.charAt(12) - '0'
        && digit(value, second) == value.charAt(13) - '0';
  }

  private int digit(String value, int[] weights) {
    int sum = 0;
    for (int index = 0; index < weights.length; index++) {
      sum += (value.charAt(index) - '0') * weights[index];
    }
    int remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  private ApiException invalid(String message) {
    return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STORE", message);
  }

  private Map<String, Object> snapshot(StoreConfiguration store) {
    Map<String, Object> value = new LinkedHashMap<>();
    value.put("tradeName", store.getTradeName());
    value.put("legalName", String.valueOf(store.getLegalName()));
    value.put("taxId", String.valueOf(store.getTaxId()));
    value.put("city", String.valueOf(store.getCity()));
    value.put("stateCode", String.valueOf(store.getStateCode()));
    value.put("currencyCode", store.getCurrencyCode());
    value.put("timeZone", store.getTimeZone());
    return value;
  }

  public record SaveResult(StoreConfiguration store, boolean created) { }
}
