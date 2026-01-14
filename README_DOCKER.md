# Docker Setup - Швидкий старт

## Запуск всіх сервісів

```bash
docker-compose up -d
```

## Порти сервісів

### Backend Services
- **Auth Service**: http://localhost:8001
  - Swagger: http://localhost:8001/docs
- **Catalog Service**: http://localhost:8002
  - Swagger: http://localhost:8002/docs
- **Order Service**: http://localhost:8003
  - Swagger: http://localhost:8003/docs

### Frontend Services
- **Client Frontend**: http://localhost:5174
  - Клієнтський додаток для замовлення їжі
- **Admin Frontend**: http://localhost:5173
  - Адмін панель для управління системою

## Бази даних

Docker монтує поточні БД файли з кореня проєкту:
- `./auth.db` → використовується auth-service
- `./catalog.db` → використовується catalog-service
- `./order.db` → використовується order-service

**Важливо:** 
- Якщо файли БД існують, вони будуть використані
- Якщо файли не існують, вони будуть створені автоматично при першому запуску
- Всі зміни в БД зберігаються на хості

## Корисні команди

```bash
# Перегляд логів
docker-compose logs -f

# Перезапуск сервісу
docker-compose restart auth-service

# Зупинка всіх сервісів
docker-compose down

# Перебудова образів
docker-compose build --no-cache
```

Детальна документація: [DOCKER.md](./DOCKER.md)
