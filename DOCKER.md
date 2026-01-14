# Docker Setup для Food Delivery Microservices

## Огляд

Проєкт підтримує запуск через Docker та Docker Compose для локальної розробки та тестування.

## Структура

- `docker-compose.yml` - конфігурація для запуску всіх сервісів
- `services/*/Dockerfile` - Dockerfile для кожного сервісу
- `services/*/.dockerignore` - файли, які ігноруються при збірці

## Швидкий старт

### Запуск всіх сервісів

```bash
docker-compose up -d
```

### Перегляд логів

```bash
# Всі сервіси
docker-compose logs -f

# Конкретний сервіс
docker-compose logs -f auth-service
```

### Зупинка сервісів

```bash
docker-compose down
```

### Зупинка з видаленням volumes (видалить бази даних)

```bash
docker-compose down -v
```

## Сервіси

### Backend Services

- **auth-service** - http://localhost:8001
  - Swagger: http://localhost:8001/docs
- **catalog-service** - http://localhost:8002
  - Swagger: http://localhost:8002/docs
- **order-service** - http://localhost:8003
  - Swagger: http://localhost:8003/docs

### Frontend Services

- **client-frontend** - http://localhost:5174
  - Клієнтський додаток для замовлення їжі
- **admin-frontend** - http://localhost:5173
  - Адмін панель для управління системою

### Бази даних

Бази даних SQLite монтуються напряму з хоста:
- `./auth.db` → `/app/data/auth.db` (auth-service)
- `./catalog.db` → `/app/data/catalog.db` (catalog-service)
- `./order.db` → `/app/data/order.db` (order-service)

**Важливо:** Docker використовує поточні БД файли з кореня проєкту. Якщо файли не існують, вони будуть створені автоматично при першому запуску сервісів.

Також монтуються файли WAL mode:
- `*.db-shm` - shared memory файли
- `*.db-wal` - write-ahead log файли

## Environment Variables

Можна налаштувати через `.env` файл або environment variables:

```bash
# .env файл
JWT_SECRET_KEY=your-secret-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_ADMIN_CHAT_IDS=123456789
```

## Збірка образів

### Збірка всіх образів

```bash
docker-compose build
```

### Збірка конкретного сервісу

```bash
docker-compose build auth-service
```

### Збірка без кешу

```bash
docker-compose build --no-cache
```

## Розробка

### Перезапуск сервісу після змін

```bash
docker-compose restart auth-service
```

### Перегляд статусу сервісів

```bash
docker-compose ps
```

### Виконання команд в контейнері

```bash
# Відкрити shell в контейнері
docker-compose exec auth-service /bin/bash

# Виконати команду
docker-compose exec auth-service python -c "print('Hello')"
```

## Troubleshooting

### Проблеми з портами

Якщо порти зайняті, змініть маппінг портів в `docker-compose.yml`:

```yaml
ports:
  - "8001:8001"  # host:container
```

### Проблеми з базами даних

Якщо бази даних не створюються:

```bash
# Перевірте логи
docker-compose logs auth-service

# Перевірте, чи існують файли БД на хості
ls -la *.db

# Якщо файли не існують, вони будуть створені автоматично
# Перевірте права доступу до файлів
```

### Очищення

```bash
# Видалити всі контейнери, образи та volumes
docker-compose down -v --rmi all

# Видалити тільки невикористовувані ресурси
docker system prune -a
```

## Production

Для production середовища рекомендується:

1. Використовувати PostgreSQL замість SQLite
2. Додати reverse proxy (nginx/traefik)
3. Налаштувати SSL/TLS
4. Використовувати secrets management
5. Додати моніторинг та логування
6. Налаштувати backup для баз даних
