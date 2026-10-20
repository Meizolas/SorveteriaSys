CREATE TABLE app_user (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    login_display VARCHAR(64) NOT NULL,
    login_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    temporary_password_expires_at DATETIME(6) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    authorization_version BIGINT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_user_login_key (login_key),
    KEY ix_app_user_active_name (active, display_name, id),
    CONSTRAINT ck_app_user_login_key CHECK (login_key REGEXP '^[a-z0-9._-]{3,64}$'),
    CONSTRAINT ck_app_user_temp_password CHECK (
      (must_change_password = TRUE AND temporary_password_expires_at IS NOT NULL)
      OR (must_change_password = FALSE AND temporary_password_expires_at IS NULL)
    ),
    CONSTRAINT fk_app_user_created_by FOREIGN KEY (created_by) REFERENCES app_user(id),
    CONSTRAINT fk_app_user_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE installation_state (
    id TINYINT UNSIGNED NOT NULL,
    initial_admin_provisioned BOOLEAN NOT NULL DEFAULT FALSE,
    initial_admin_user_id BIGINT UNSIGNED NULL,
    provisioned_at DATETIME(6) NULL,
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT ck_installation_singleton CHECK (id = 1),
    CONSTRAINT fk_installation_admin FOREIGN KEY (initial_admin_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO installation_state (id, initial_admin_provisioned) VALUES (1, FALSE);

CREATE TABLE role (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    system_defined BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_code (code),
    CONSTRAINT ck_role_code CHECK (code IN ('ADMINISTRATOR', 'OPERATOR')),
    CONSTRAINT ck_role_system CHECK (system_defined = TRUE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE permission (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    description VARCHAR(200) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_permission_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE role_permission (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES role(id),
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permission(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_role (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_at DATETIME(6) NOT NULL,
    assigned_by BIGINT UNSIGNED NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id),
    CONSTRAINT fk_user_role_actor FOREIGN KEY (assigned_by) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE store_config (
    id TINYINT UNSIGNED NOT NULL,
    trade_name VARCHAR(120) NOT NULL,
    legal_name VARCHAR(160) NULL,
    tax_id CHAR(14) CHARACTER SET ascii COLLATE ascii_bin NULL,
    postal_code CHAR(8) CHARACTER SET ascii COLLATE ascii_bin NULL,
    street VARCHAR(160) NULL,
    address_number VARCHAR(30) NULL,
    complement VARCHAR(120) NULL,
    district VARCHAR(120) NULL,
    city VARCHAR(120) NULL,
    state_code CHAR(2) CHARACTER SET ascii COLLATE ascii_bin NULL,
    country_code CHAR(2) CHARACTER SET ascii COLLATE ascii_bin NULL,
    currency_code CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    time_zone VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT ck_store_singleton CHECK (id = 1),
    CONSTRAINT ck_store_currency CHECK (currency_code = 'BRL'),
    CONSTRAINT ck_store_tax_id CHECK (tax_id IS NULL OR tax_id REGEXP '^[0-9]{14}$'),
    CONSTRAINT ck_store_postal_code CHECK (postal_code IS NULL OR postal_code REGEXP '^[0-9]{8}$'),
    CONSTRAINT ck_store_state CHECK (state_code IS NULL OR state_code REGEXP '^[A-Z]{2}$'),
    CONSTRAINT ck_store_country CHECK (country_code IS NULL OR country_code = 'BR'),
    CONSTRAINT fk_store_created_by FOREIGN KEY (created_by) REFERENCES app_user(id),
    CONSTRAINT fk_store_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE authentication_throttle (
    subject_hash BINARY(32) NOT NULL,
    window_started_at DATETIME(6) NOT NULL,
    failure_count SMALLINT UNSIGNED NOT NULL,
    blocked_until DATETIME(6) NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (subject_hash),
    KEY ix_auth_throttle_updated (updated_at)
) ENGINE=InnoDB;

CREATE TABLE audit_event (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    occurred_at DATETIME(6) NOT NULL,
    action VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    outcome ENUM('SUCCEEDED', 'DENIED', 'FAILED') NOT NULL,
    actor_user_id BIGINT UNSIGNED NULL,
    actor_login_snapshot VARCHAR(64) NULL,
    actor_name_snapshot VARCHAR(120) NULL,
    target_type VARCHAR(80) NULL,
    target_id VARCHAR(80) NULL,
    reason VARCHAR(500) NULL,
    correlation_id BINARY(16) NOT NULL,
    before_json JSON NULL,
    after_json JSON NULL,
    origin_type ENUM('LOCAL_TTY', 'NETWORK') NOT NULL,
    source_address VARCHAR(45) CHARACTER SET ascii COLLATE ascii_bin NULL,
    PRIMARY KEY (id),
    KEY ix_audit_time (occurred_at, id),
    KEY ix_audit_actor (actor_user_id, occurred_at, id),
    KEY ix_audit_action (action, occurred_at, id),
    KEY ix_audit_outcome (outcome, occurred_at, id),
    KEY ix_audit_correlation (correlation_id),
    CONSTRAINT ck_audit_origin CHECK (
      (origin_type = 'LOCAL_TTY' AND source_address IS NULL)
      OR (origin_type = 'NETWORK' AND source_address IS NOT NULL)
    ),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE retention_run (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    started_at DATETIME(6) NOT NULL,
    finished_at DATETIME(6) NULL,
    cutoff_at DATETIME(6) NOT NULL,
    deleted_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('RUNNING', 'SUCCEEDED', 'FAILED') NOT NULL,
    correlation_id BINARY(16) NOT NULL,
    error_code VARCHAR(80) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_retention_correlation (correlation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE idempotency_record (
    idempotency_key BINARY(16) NOT NULL,
    operation VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    request_fingerprint BINARY(32) NOT NULL,
    resource_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    resource_id VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    created_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    PRIMARY KEY (idempotency_key),
    KEY ix_idempotency_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO role (id, code, display_name) VALUES
  (1, 'ADMINISTRATOR', 'Administrador'),
  (2, 'OPERATOR', 'Operador');

INSERT INTO permission (id, code, description) VALUES
  (1, 'USER_READ', 'Consultar usuários'),
  (2, 'USER_WRITE', 'Criar e alterar usuários'),
  (3, 'ROLE_ASSIGN', 'Atribuir perfis'),
  (4, 'STORE_READ', 'Consultar configuração da loja'),
  (5, 'STORE_WRITE', 'Alterar configuração da loja'),
  (6, 'AUDIT_READ', 'Consultar auditoria');

INSERT INTO role_permission (role_id, permission_id)
SELECT 1, id FROM permission;
