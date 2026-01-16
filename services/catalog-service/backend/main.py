"""
Catalog Service - Restaurant, Menu, and Categories management.
This service manages only Restaurant, Category, and MenuItem entities.
"""

import traceback
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.database import Base
from backend.database.session import engine, SessionLocal

# Import only models managed by this service
from backend.models.restaurant import Restaurant
from backend.models.category import Category
from backend.models.menu_item import MenuItem

# Import routers
from backend.routers import (
    restaurants,
    admin_restaurants,
    categories,
    admin_categories,
    menu,
    admin_menu,
)

# Create FastAPI application
app = FastAPI(
    title="Catalog Service",
    version="1.0.0",
    description="Restaurant, Menu, and Categories management",
)


def init_db():
    """Initialize database tables for catalog-service (restaurant_info, categories, menu_items)."""
    Base.metadata.create_all(bind=engine)
    print(
        "[OK] Catalog service: Database tables created (restaurant_info, categories, menu_items)"
    )


def init_default_data():
    """Create default restaurant, categories, and menu items if they don't exist."""
    from backend.core.config import DEFAULT_RESTAURANT_ID

    db: Session = SessionLocal()
    try:
        # Create default restaurant if doesn't exist
        if (
            db.query(Restaurant).filter(Restaurant.id == DEFAULT_RESTAURANT_ID).first()
            is None
        ):
            default_restaurant = Restaurant(
                id=DEFAULT_RESTAURANT_ID,
                name="Main Restaurant",
                description="Our main restaurant for food delivery",
                address="Kyiv, Ukraine",
                phone="+380501234567",
                opening_hours="09:00-23:00",
            )
            db.add(default_restaurant)
            db.commit()
            print(f"[OK] Default restaurant created (ID: {DEFAULT_RESTAURANT_ID})")

        # Create default categories if they don't exist
        categories_data = [
            {
                "name": "Закуски та Салати",
                "description": "Почніть свій обід чи вечерю з ретельно підібраних інгредієнтів. Свіжі салати та вишукані холодні й гарячі закуски, що ідеально доповнять ваш вибір.",
            },
            {
                "name": "Основні страви",
                "description": "Центральний елемент вашої трапези. Наші шеф-кухарі приготували добірні страви з м'яса, риби та птиці, а також класичні італійські пасти та різото.",
            },
            {
                "name": "Десерти",
                "description": "Ідеальне завершення. Насолоджуйтесь нашою колекцією класичних десертів, свіжої випічки та фруктів, створених, щоб подарувати вам солодкі миті.",
            },
        ]

        created_categories = {}
        for cat_data in categories_data:
            existing = (
                db.query(Category).filter(Category.name == cat_data["name"]).first()
            )
            if existing is None:
                category = Category(
                    name=cat_data["name"], description=cat_data["description"]
                )
                db.add(category)
                db.commit()
                db.refresh(category)
                created_categories[cat_data["name"]] = category.id
                print(f"[OK] Category created: {cat_data['name']}")
            else:
                created_categories[cat_data["name"]] = existing.id

        # Create default menu items if they don't exist
        menu_items_data = [
            # Закуски та Салати
            {
                "category": "Закуски та Салати",
                "name": 'Салат "Цезар" з куркою',
                "description": "Листя романо, хрусткі крутони, томати чері, пармезан та філе гриль під фірмовим соусом.",
                "price": 14500,
                "image_url": "https://bandasmaku.com.ua/wp-content/uploads/2024/05/%D0%A6%D0%B5%D0%B7%D0%B0%D1%80-%D0%B7-%D0%BA%D1%83%D1%80%D0%BA%D0%BE%D1%8E-200-%D0%B3-140%E2%82%B4-600x400.webp",
            },
            {
                "category": "Закуски та Салати",
                "name": "Брускети з томатами та базиліком",
                "description": "Хрусткий багет з дрібно нарізаними томатами, часником, свіжим базиліком та оливковою олією.",
                "price": 12000,
                "image_url": "https://eco-buffet.com/wp-content/uploads/2023/09/brusketa.png",
            },
            {
                "category": "Закуски та Салати",
                "name": "Сирна тарілка",
                "description": "Асорті з благородних сирів (брі, дорблю, пармезан) з медом, волоськими горіхами та виноградом.",
                "price": 18500,
                "image_url": "https://unopizzagrill.com.ua/image/cache/catalog/menu/salad/7266-1920x1281.webp",
            },
            {
                "category": "Закуски та Салати",
                "name": "Карпачо з лосося",
                "description": "Тонкі скибочки свіжого лосося, заправлені лимонним соком, оливковою олією, з каперсами та руколою.",
                "price": 17000,
                "image_url": "https://borges1896.com/app/uploads//14_62793819_%D0%9A%D0%90%D0%A0%D0%9F%D0%90%D0%A7%D0%A7%D0%9E-%D0%98%D0%97-%D0%9B%D0%9E%D0%A1%D0%9E%D0%A1%D0%AF.jpg",
            },
            # Основні страви
            {
                "category": "Основні страви",
                "name": 'Стейк "Нью-Йорк" з овочами гриль',
                "description": "Соковитий стейк з яловичини, подається з обсмаженими на грилі болгарським перцем, кабачками та баклажанами.",
                "price": 35000,
                "image_url": "https://assets.dots.live/misteram-public/018f42be-b319-7097-8858-817535fdd8dc-826x0.png",
            },
            {
                "category": "Основні страви",
                "name": "Паста Карбонара",
                "description": "Класична італійська паста зі спагеті, беконом, яєчним жовтком, сиром пекоріно та чорним перцем.",
                "price": 22000,
                "image_url": "https://images.unian.net/photos/2021_03/thumb_files/1200_0_1615387932-9078.jpg",
            },
            {
                "category": "Основні страви",
                "name": "Філе дорадо з картопляним пюре",
                "description": "Ніжне філе морської риби, запечене з травами, подається з вершковим картопляним пюре та шпинатним соусом.",
                "price": 28000,
                "image_url": "https://assets.dots.live/misteram-public/0186df23-805a-7177-b149-a5b238ffd0e7-826x0.png",
            },
            {
                "category": "Основні страви",
                "name": "Різото з білими грибами",
                "description": "Кремове різото з рисом арборіо, ароматними білими грибами, пармезаном та трюфельною олією.",
                "price": 24500,
                "image_url": "https://assets.dots.live/misteram-public/0196a67f-eb11-70fb-8cdf-5ac3eac8e6ea-826x0.png",
            },
            # Десерти
            {
                "category": "Десерти",
                "name": "Шоколадний фондан",
                "description": "Гарячий шоколадний кекс з рідкою начинкою, подається з кулькою ванільного морозива.",
                "price": 11000,
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQorpJnieWO0imrpB8qOX88Y6-8xl6dLbf-Uw&s",
            },
            {
                "category": "Десерти",
                "name": 'Чізкейк "Нью-Йорк"',
                "description": "Класичний вершковий чізкейк на пісочній основі, подається зі свіжим ягідним соусом.",
                "price": 9500,
                "image_url": "https://la-torta.ua/content/uploads/images/12-cake.jpg",
            },
            {
                "category": "Десерти",
                "name": "Тирамісу",
                "description": "Традиційний італійський десерт з печива савоярді, просоченого кавою, та ніжним кремом з маскарпоне.",
                "price": 10500,
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKA5_dNLZhtefKQixJJTSLNI5fYOmPcdxScQ&s",
            },
            {
                "category": "Десерти",
                "name": "Фруктове асорті",
                "description": "Сезонні фрукти та ягоди (полуниця, лохина, ківі, апельсин), подаються з м'ятним сиропом.",
                "price": 8500,
                "image_url": "https://retsepty.co.ua/wp-content/uploads/2025/04/Fruktove-asorti.jpg",
            },
        ]

        for item_data in menu_items_data:
            category_id = created_categories.get(item_data["category"])
            if category_id:
                existing = (
                    db.query(MenuItem)
                    .filter(
                        MenuItem.name == item_data["name"],
                        MenuItem.restaurant_id == DEFAULT_RESTAURANT_ID,
                    )
                    .first()
                )

                if existing is None:
                    menu_item = MenuItem(
                        restaurant_id=DEFAULT_RESTAURANT_ID,
                        category_id=category_id,
                        name=item_data["name"],
                        description=item_data["description"],
                        price=item_data["price"],
                        image_url=item_data.get("image_url"),
                    )
                    db.add(menu_item)
                    db.commit()
                    print(f"[OK] Menu item created: {item_data['name']}")
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    init_db()
    init_default_data()
    print("[OK] Catalog service: Startup complete")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# IMPORTANT: Admin routers must be registered BEFORE public routers
# to avoid path conflicts (e.g., /admin/menu/{id} vs /menu/{id})
app.include_router(admin_restaurants.router)
app.include_router(admin_categories.router)
app.include_router(admin_menu.router)
app.include_router(restaurants.router)
app.include_router(categories.router)
app.include_router(menu.router)


# Health check endpoint
@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "catalog-service", "version": "1.0.0"}


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all exceptions and log them."""
    print("=" * 60)
    print("ERROR OCCURRED:")
    print(f"Request: {request.method} {request.url}")
    print(f"Error: {type(exc).__name__}: {str(exc)}")
    print("\nTraceback:")
    traceback.print_exc()
    print("=" * 60)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": str(exc), "type": type(exc).__name__},
    )
