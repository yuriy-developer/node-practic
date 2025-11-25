FROM postgres:16

# Добавляем свои конфиги
COPY postgres.conf /etc/postgresql/postgres.conf

# Скрипт инициализации (автозапуск)
COPY init.sql /docker-entrypoint-initdb.d/init.sql

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgres.conf"]
