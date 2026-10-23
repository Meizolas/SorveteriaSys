package br.com.sorveteria.store.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;

@Entity
@Table(name = "store_config")
public class StoreConfiguration {
  @Id private Short id;
  @Column(name = "trade_name", nullable = false, length = 120) private String tradeName;
  @Column(name = "legal_name", length = 160) private String legalName;
  @Column(name = "tax_id", length = 14) private String taxId;
  @Column(name = "postal_code", length = 8) private String postalCode;
  @Column(length = 160) private String street;
  @Column(name = "address_number", length = 30) private String number;
  @Column(length = 120) private String complement;
  @Column(length = 120) private String district;
  @Column(length = 120) private String city;
  @Column(name = "state_code", length = 2) private String stateCode;
  @Column(name = "country_code", length = 2) private String countryCode;
  @Column(name = "currency_code", nullable = false, length = 3) private String currencyCode;
  @Column(name = "time_zone", nullable = false, length = 64) private String timeZone;
  @Version @Column(nullable = false) private long version;
  @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;
  @Column(name = "created_by", nullable = false, updatable = false) private Long createdBy;
  @Column(name = "updated_by", nullable = false) private Long updatedBy;

  protected StoreConfiguration() { }

  public static StoreConfiguration create(StoreData data, Long actor, Instant now) {
    StoreConfiguration store = new StoreConfiguration();
    store.id = 1;
    store.createdAt = now;
    store.createdBy = actor;
    store.apply(data, actor, now);
    return store;
  }

  public void update(StoreData data, Long actor, Instant now) {
    apply(data, actor, now);
  }

  private void apply(StoreData data, Long actor, Instant now) {
    tradeName = data.tradeName();
    legalName = data.legalName();
    taxId = data.taxId();
    postalCode = data.postalCode();
    street = data.street();
    number = data.number();
    complement = data.complement();
    district = data.district();
    city = data.city();
    stateCode = data.stateCode();
    countryCode = data.countryCode();
    currencyCode = data.currencyCode();
    timeZone = data.timeZone();
    updatedAt = now;
    updatedBy = actor;
  }

  public Short getId() { return id; }
  public String getTradeName() { return tradeName; }
  public String getLegalName() { return legalName; }
  public String getTaxId() { return taxId; }
  public String getPostalCode() { return postalCode; }
  public String getStreet() { return street; }
  public String getNumber() { return number; }
  public String getComplement() { return complement; }
  public String getDistrict() { return district; }
  public String getCity() { return city; }
  public String getStateCode() { return stateCode; }
  public String getCountryCode() { return countryCode; }
  public String getCurrencyCode() { return currencyCode; }
  public String getTimeZone() { return timeZone; }
  public long getVersion() { return version; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }

  public record StoreData(String tradeName, String legalName, String taxId, String postalCode,
      String street, String number, String complement, String district, String city,
      String stateCode, String countryCode, String currencyCode, String timeZone) { }
}
