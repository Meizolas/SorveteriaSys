#!/bin/sh
set -eu

password="$(tr -d '\r\n' < /run/secrets/mysql_migrator_password)"
action="${1:-apply}"

case "$action" in
  info) command=info ;;
  validate) command=validate ;;
  apply) command=migrate ;;
  repair) command=repair ;;
  *) echo "Uso: info | validate | apply | repair" >&2; exit 64 ;;
esac

exec flyway \
  -url="jdbc:mysql://db:3306/sorveteria?connectionTimeZone=UTC&useUnicode=true&characterEncoding=utf8&allowPublicKeyRetrieval=true&useSSL=false" \
  -user=app_migrator \
  -password="$password" \
  -locations=filesystem:/flyway/sql \
  -connectRetries=30 \
  "$command"
