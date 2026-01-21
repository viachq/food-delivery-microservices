# Food Delivery Microservices

Система замовлення та доставки їжі з ресторану. Проєкт побудований на мікросервісній архітектурі з трьома незалежними сервісами.

## Опис проєкту

Проєкт складається з трьох мікросервісів, кожен з яких має свою базу даних:

- **Auth Service** - автентифікація та управління користувачами
- **Catalog Service** - меню, категорії та інформація про ресторан
- **Order Service** - кошик, замовлення, оплата та відгуки

Сервіси спілкуються між собою через HTTP API. Кожен сервіс може працювати незалежно, що дозволяє масштабувати окремі компоненти системи.

## Технологічний стек

### Backend
- Python 3.13+
- FastAPI
- SQLAlchemy
- SQLite (окрема БД для кожного сервісу)
- JWT для автентифікації
- httpx для міжсервісної комунікації

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router

### CI/CD

- GitHub Actions pipeline
- Linting with flake8
- Unit & integration tests with pytest
- Docker image build and push to GitHub Container Registry (GHCR)

Image:
ghcr.io/<username>/auth-service:latest


## Структура проєкту

```
food-delivery-microservices/
├── services/
│   ├── auth-service/          # Порт 8001
│   │   └── backend/
│   ├── catalog-service/       # Порт 8002
│   │   └── backend/
│   └── order-service/         # Порт 8003
│       └── backend/
├── client/                    # Клієнтський додаток (порт 5174)
├── admin/                     # Адмін панель (порт 5173)
├── auth.db                    # База даних auth-service
├── catalog.db                 # База даних catalog-service
├── order.db                   # База даних order-service
└── START.bat                  # Скрипт запуску всіх сервісів
```

## Вимоги

Для запуску проєкту потрібно:

- Python 3.13 або новіший
- Node.js 18+ та npm
- Git

**Альтернатива:** Docker та Docker Compose (для запуску через контейнери)

## Інструкція з розгортання

### Варіант 1: Запуск через Docker (Рекомендовано)

Найпростіший спосіб запустити всі сервіси:

```bash
# Запуск всіх сервісів
docker-compose up -d

# Перегляд логів
docker-compose logs -f

# Зупинка
docker-compose down
```

Детальна інструкція: [DOCKER.md](./DOCKER.md)

**Сервіси будуть доступні:**
- Auth Service: http://localhost:8001 (docs: http://localhost:8001/docs)
- Catalog Service: http://localhost:8002 (docs: http://localhost:8002/docs)
- Order Service: http://localhost:8003 (docs: http://localhost:8003/docs)

### Варіант 3: Запуск в Kubernetes

Для розгортання в Kubernetes кластер:

```bash
# Швидкий деплой (Linux/Mac)
cd k8s
./deploy.sh

# Або Windows
cd k8s
deploy.bat

# З Ingress
./deploy.sh --with-ingress
```

Детальна інструкція: [k8s/README.md](./k8s/README.md)

**Вимоги:**
- Kubernetes кластер (minikube, k3s, kind, або cloud)
- kubectl встановлений
- Docker images зібрані

**Компоненти:**
- ✅ Deployment (2 replicas для кожного сервісу)
- ✅ Service (ClusterIP)
- ✅ ConfigMap (конфігурація)
- ✅ Secret (JWT, Telegram токени)
- ✅ Ingress (для доступу)
- ✅ Health checks (liveness/readiness probes)

### Варіант 2: Локальний запуск

### 1. Клонування репозиторію

```bash
git clone https://github.com/viachq/ippt_project.git
cd ippt_project
```

### 2. Встановлення залежностей

#### Backend сервіси

Для кожного сервісу потрібно створити віртуальне середовище та встановити залежності:

```bash
# Auth Service
cd services/auth-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# Catalog Service
cd services/catalog-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# Order Service
cd services/order-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

На Linux/Mac замість `.venv\Scripts\activate` використовуйте `source .venv/bin/activate`.

Альтернативно можна використати uv (якщо встановлено):

```bash
uv sync
```

#### Frontend додатки

Встановіть залежності для обох фронтенд додатків:

```bash
cd client
npm install
cd ../admin
npm install
cd ../..
```

### 3. Налаштування

Важливо: в усіх сервісах має бути однаковий `JWT_SECRET_KEY`. Перевірте файли `services/*/backend/core/config.py`:

```python
JWT_SECRET_KEY = "your-secret-key-here"
```

URL сервісів можна налаштувати через змінні оточення, або вони будуть використовувати значення за замовчуванням:
- AUTH_SERVICE_URL=http://localhost:8001
- CATALOG_SERVICE_URL=http://localhost:8002
- ORDER_SERVICE_URL=http://localhost:8003

### 4. Запуск проєкту

#### Швидкий запуск (Windows)

Найпростіший спосіб - запустити скрипт:

```bash
START.bat
```

Скрипт автоматично запустить всі сервіси в окремих вікнах командного рядка.

#### Ручний запуск

Або запускайте кожен сервіс окремо:

**Backend сервіси:**

```bash
# Auth Service
cd services/auth-service
set PYTHONPATH=%CD%
python -m uvicorn backend.main:app --reload --port 8001 --host 0.0.0.0

# Catalog Service (в новому терміналі)
cd services/catalog-service
set PYTHONPATH=%CD%
python -m uvicorn backend.main:app --reload --port 8002 --host 0.0.0.0

# Order Service (в новому терміналі)
cd services/order-service
set PYTHONPATH=%CD%
python -m uvicorn backend.main:app --reload --port 8003 --host 0.0.0.0
```

**Frontend додатки:**

```bash
# Клієнтський додаток
cd client
npm run dev

# Адмін панель (в новому терміналі)
cd admin
npm run dev
```

### 5. Доступ до додатків

Після запуску всіх сервісів:

- **Клієнтський додаток**: http://localhost:5174
- **Адмін панель**: http://localhost:5173
- **Auth Service API**: http://localhost:8001/docs
- **Catalog Service API**: http://localhost:8002/docs
- **Order Service API**: http://localhost:8003/docs

## База даних

Кожен сервіс має власну SQLite базу даних:

- `auth.db` - користувачі (auth-service)
- `catalog.db` - ресторан, категорії, меню (catalog-service)
- `order.db` - замовлення, кошик, оплати, відгуки (order-service)

Бази даних створюються автоматично під час першого запуску сервісів. Тестові дані (користувачі, меню, категорії) також додаються автоматично.

## Архітектура

### Незалежність сервісів

Кожен сервіс:
- Має власну базу даних
- Може бути розгорнутий окремо
- Комунікує з іншими сервісами через HTTP API
- Не має прямих ForeignKey зв'язків з моделями інших сервісів

### Міжсервісна комунікація

Сервіси використовують HTTP клієнти для отримання даних з інших сервісів:

- Order Service запитує дані користувачів з Auth Service
- Order Service запитує дані меню з Catalog Service
- Catalog Service запитує відгуки з Order Service

### Автентифікація

JWT токени використовуються для автентифікації. Токен містить інформацію про користувача та перевіряється кожним сервісом незалежно.

## Розробка

### Додавання нових ендпоінтів

Кожен сервіс має власну структуру роутерів в `backend/routers/`. Додавайте нові роутери та підключайте їх в `main.py`.

### Тестування

Swagger документація доступна на `/docs` кожного сервісу. Використовуйте її для тестування API.

### Зміни в моделях

При зміні моделей бази даних, SQLite автоматично оновить структуру. Для production середовища рекомендується використовувати міграції (наприклад, Alembic).

## Kubernetes Deployment

Проєкт включає повний набір Kubernetes manifests для розгортання в кластер:

- **Deployment** - для кожного сервісу (2 replicas)
- **Service** - ClusterIP для внутрішньої комунікації
- **ConfigMap** - для конфігурацій
- **Secret** - для чутливих даних (JWT, Telegram)
- **Ingress** - для зовнішнього доступу
- **Health Checks** - liveness та readiness probes

Детальна інструкція: [k8s/README.md](./k8s/README.md)

## Відомі обмеження

- Використовується SQLite для спрощення розгортання. У production середовищі краще використовувати PostgreSQL
- Сервіси запускаються на localhost. Для production потрібна налаштування мережевої інфраструктури
- Немає API Gateway - кожен сервіс доступний напряму через свій порт

## Ліцензія

Цей проєкт створено в навчальних цілях.

## Контакти

Для питань та пропозицій створюйте issues в репозиторії.
