# Інструкція для розробників

## Вимоги

Перед запуском переконайтесь що встановлено:
- Python 3.8 або новіший
- Node.js 18+ та npm

## Перший запуск

1. Розпакуйте архів проєкту

2. Запустіть всі сервіси:
   ```
   START.bat
   ```

Всі залежності вже встановлені в проєкті (включно з .venv).

## Структура проєкту

- `services/auth-service/` - автентифікація та користувачі (порт 8001)
- `services/catalog-service/` - меню, категорії, ресторан (порт 8002)
- `services/order-service/` - кошик, замовлення, оплата (порт 8003)
- `client/` - клієнтський сайт (порт 5174)
- `admin/` - адмін панель (порт 5173)
- `auth.db` - база даних auth-service (тільки таблиця users)
- `catalog.db` - база даних catalog-service (restaurant_info, categories, menu_items)
- `order.db` - база даних order-service (orders, order_items, payments, reviews, carts, cart_items)

## Як працює

Фронтенд автоматично визначає який сервіс обробляє запит:
- `/auth/*`, `/users/*` → Auth Service (8001)
- `/restaurant/*`, `/categories/*`, `/menu/*` → Catalog Service (8002)
- `/cart/*`, `/orders/*`, `/reviews/*` → Order Service (8003)

Кожен сервіс має свою окрему базу даних:
- `auth.db` - для auth-service
- `catalog.db` - для catalog-service  
- `order.db` - для order-service

Сервіси комунікують між собою через HTTP API, а не через спільну БД.

## Важливі налаштування

- JWT_SECRET_KEY має бути однаковим у всіх сервісах (в `config.py`)
- Бази даних створюються автоматично при першому запуску кожного сервісу
- WAL mode увімкнено для одночасної роботи кількох сервісів
- Service URLs налаштовуються через environment variables або config.py

## Міграція даних

Якщо у вас є стара спільна база даних `app.db`, виконайте міграцію:

```bash
python migrate_db.py
```

Скрипт:
- Створить backup старої БД
- Перенесе дані в окремі БД для кожного сервісу
- Перевірить успішність міграції

Після міграції стару `app.db` можна видалити (backup зберігається автоматично).

## Розробка

Кожен сервіс можна запускати окремо:
```
cd services/auth-service
set PYTHONPATH=%CD%
python -m uvicorn backend.main:app --reload --port 8001
```

Swagger документація доступна на `/docs` кожного сервісу.

## Наступні кроки

1. Docker - Dockerfile для кожного сервісу
2. docker-compose.yml - для локальної розробки
3. Kubernetes manifests - Deployment, Service, ConfigMap, Secret, Ingress

## Технології

Backend: Python 3.8+, FastAPI, SQLAlchemy, SQLite
Frontend: React 18, TypeScript, Vite, TailwindCSS