#!/bin/bash
echo "Run in mapvoyage/server (!!!)"

set -a
source .env.db
set +a

mkdir -p /tmp/wiki-import

wget -O /tmp/wiki-import/page_props.sql.gz https://dumps.wikimedia.org/enwikivoyage/latest/enwikivoyage-latest-page_props.sql.gz
wget -O /tmp/wiki-import/page.sql.gz https://dumps.wikimedia.org/enwikivoyage/latest/enwikivoyage-latest-page.sql.gz

zcat /tmp/wiki-import/page.sql.gz | docker compose exec -T db mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"
zcat /tmp/wiki-import/page_props.sql.gz | docker compose exec -T db mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"
