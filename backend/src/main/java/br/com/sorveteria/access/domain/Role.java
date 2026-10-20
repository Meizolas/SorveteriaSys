package br.com.sorveteria.access.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "role")
public class Role {
    @Id private Long id;
    @Column(nullable = false, unique = true, updatable = false) private String code;
    @Column(name = "display_name", nullable = false) private String displayName;
    @Column(name = "system_defined", nullable = false) private boolean systemDefined;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "role_permission",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id"))
    private Set<Permission> permissions = new LinkedHashSet<>();

    protected Role() { }
    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getDisplayName() { return displayName; }
    public Set<Permission> getPermissions() { return Set.copyOf(permissions); }
}

