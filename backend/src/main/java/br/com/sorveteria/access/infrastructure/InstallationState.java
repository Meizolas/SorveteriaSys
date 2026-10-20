package br.com.sorveteria.access.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;

@Entity
@Table(name = "installation_state")
public class InstallationState {
    @Id private Short id;
    @Column(name = "initial_admin_provisioned", nullable = false) private boolean initialAdminProvisioned;
    @Column(name = "initial_admin_user_id") private Long initialAdminUserId;
    @Column(name = "provisioned_at") private Instant provisionedAt;
    @Version private long version;
    protected InstallationState() { }
    public boolean isInitialAdminProvisioned() { return initialAdminProvisioned; }
    public void provisioned(Long userId, Instant at) {
        if (initialAdminProvisioned) throw new IllegalStateException("Administrador inicial já provisionado");
        initialAdminProvisioned = true; initialAdminUserId = userId; provisionedAt = at;
    }
}

