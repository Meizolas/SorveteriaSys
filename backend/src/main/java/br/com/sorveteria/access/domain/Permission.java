package br.com.sorveteria.access.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "permission")
public class Permission {
    @Id private Long id;
    @Column(nullable = false, unique = true, updatable = false) private String code;
    @Column(nullable = false, updatable = false) private String description;

    protected Permission() { }
    public String getCode() { return code; }
    public String getDescription() { return description; }
}

