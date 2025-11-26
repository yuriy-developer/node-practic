# node-practic — учебный fullstack проект

Короткая инструкция и примеры запросов к API.

Требования
- Docker и Docker Compose (поддержка `docker compose`)

Запуск

1. Остановить и удалить старые контейнеры (если были):

```bash
docker compose down
```

2. Собрать образы и поднять сервисы в фоне:

```bash
docker compose up --build -d
```

3. Проверить статус контейнеров:

```bash
docker compose ps
```

Логи сервисов:

```bash
docker compose logs --tail=200 backend
docker compose logs --tail=200 frontend
docker compose logs --tail=200 mongo
docker compose logs --tail=200 postgres
```



Минимальный CRUD API (`backend`)

Реализованы эндпоинты:
- `GET /api/users` — список пользователей
- `POST /api/users` — создать пользователя (JSON body: `{ "username": "...", "role": "..." }`)
- `PUT /api/users/:id` — обновить пользователя
- `DELETE /api/users/:id` — удалить пользователя

Примеры запросов (с хоста):

Получить список:
```bash
curl -sS http://localhost:4000/api/users | jq
```

Создать пользователя:
```bash
curl -sS -X POST http://localhost:4000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"username": "alice", "role": "user"}' | jq
```

Обновить пользователя:
```bash
curl -sS -X PUT http://localhost:4000/api/users/<id> \
  -H 'Content-Type: application/json' \
  -d '{"role": "admin"}' | jq
```

Удалить пользователя:
```bash
curl -sS -X DELETE http://localhost:4000/api/users/<id>
```

Дальше
- Могу добавить на фронтенд простую страницу, которая использует эти ручки (fetch/axios).
- Могу добавить в `backend` валидацию, логирование и тесты.
