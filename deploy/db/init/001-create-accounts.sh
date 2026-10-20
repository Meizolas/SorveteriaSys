#!/bin/sh
set -eu

read_secret() {
  tr -d '\r\n' < "/run/secrets/$1"
}

migrator_password="$(read_secret mysql_migrator_password)"
runtime_password="$(read_secret mysql_runtime_password)"
backup_password="$(read_secret mysql_backup_password)"
retention_password="$(read_secret mysql_retention_password)"

mysql --protocol=socket -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS sorveteria CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'app_migrator'@'%' IDENTIFIED BY '${migrator_password}';
CREATE USER IF NOT EXISTS 'app_runtime'@'%' IDENTIFIED BY '${runtime_password}';
CREATE USER IF NOT EXISTS 'app_backup'@'%' IDENTIFIED BY '${backup_password}';
CREATE USER IF NOT EXISTS 'app_retention'@'%' IDENTIFIED BY '${retention_password}';
GRANT ALL PRIVILEGES ON sorveteria.* TO 'app_migrator'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON sorveteria.* TO 'app_runtime'@'%';
GRANT SELECT, SHOW VIEW, TRIGGER, EVENT, LOCK TABLES ON sorveteria.* TO 'app_backup'@'%';
FLUSH PRIVILEGES;
SQL
