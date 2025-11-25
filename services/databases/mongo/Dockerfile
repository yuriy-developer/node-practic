FROM mongo:7

# Кидаем кастомный конфиг
COPY mongo.conf /etc/mongo/mongo.conf

# Скрипты инициализации (выполняются автоматически)
COPY init/ /docker-entrypoint-initdb.d/

# Запускаем Mongo с кастомным конфигом
CMD ["mongod", "--config", "/etc/mongo/mongo.conf"]
