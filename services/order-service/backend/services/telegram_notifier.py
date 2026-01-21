"""
Telegram notification service for sending alerts to admins.
"""

import logging
from datetime import datetime
from typing import Optional

from aiogram import Bot

from backend.core.config import (
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_ADMIN_CHAT_IDS,
    TELEGRAM_NOTIFICATIONS_ENABLED,
)

logger = logging.getLogger(__name__)


async def send_new_order_notification(
    order_id: int,
    total_price: int,
    delivery_address: str,
    user_phone: Optional[str] = None,
    user_name: Optional[str] = None,
    delivery_time: Optional[datetime] = None,
    items_count: int = 0,
) -> bool:
    """
    Send notification about new order to all admin chat IDs.

    Args:
        order_id: The order ID
        total_price: Total price in kopiyky/cents
        delivery_address: Delivery address
        user_phone: User's phone number (optional)
        user_name: User's name (optional)
        delivery_time: Scheduled delivery time (optional)
        items_count: Number of items in order

    Returns:
        True if notification was sent successfully, False otherwise
    """
    # Check if notifications are enabled
    if not TELEGRAM_NOTIFICATIONS_ENABLED:
        logger.debug("Telegram notifications are disabled")
        return False

    # Check if bot token is configured
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN is not configured")
        return False

    # Check if there are admin chat IDs
    if not TELEGRAM_ADMIN_CHAT_IDS:
        logger.warning("TELEGRAM_ADMIN_CHAT_IDS is not configured")
        return False

    try:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)

        # Format price (convert from kopiyky to UAH)
        price_uah = total_price / 100

        # Build message
        message_parts = [
            f"🆕 <b>Нове замовлення #{order_id}</b>",
            "",
            f"💰 Сума: <b>{price_uah:.2f} грн</b>",
            f"📦 Товарів: {items_count}",
            f"📍 Адреса: {delivery_address}",
        ]

        # Add user info if available
        if user_name:
            message_parts.append(f"👤 Клієнт: {user_name}")
        if user_phone:
            message_parts.append(f"📱 Телефон: {user_phone}")

        # Add delivery time if scheduled
        if delivery_time:
            formatted_time = delivery_time.strftime("%d.%m.%Y о %H:%M")
            message_parts.append(f"🕐 Доставити до: {formatted_time}")
        else:
            message_parts.append("🕐 Доставити: якнайшвидше")

        message = "\n".join(message_parts)

        # Send to all admin chats (notification only, no action buttons)
        success = True
        for chat_id in TELEGRAM_ADMIN_CHAT_IDS:
            try:
                await bot.send_message(
                    chat_id=chat_id,
                    text=message,
                    parse_mode="HTML",
                )
                logger.info(f"Sent new order notification to chat {chat_id}")
            except Exception as e:
                logger.error(f"Failed to send notification to chat {chat_id}: {e}")
                success = False

        await bot.session.close()
        return success

    except Exception as e:
        logger.error(f"Error sending Telegram notification: {e}")
        return False


async def send_order_cancelled_notification(
    order_id: int,
    reason: Optional[str] = None,
) -> bool:
    """
    Send notification about order cancellation to admins.

    Args:
        order_id: The order ID
        reason: Cancellation reason (optional)

    Returns:
        True if notification was sent successfully, False otherwise
    """
    if (
        not TELEGRAM_NOTIFICATIONS_ENABLED
        or not TELEGRAM_BOT_TOKEN
        or not TELEGRAM_ADMIN_CHAT_IDS
    ):
        return False

    try:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)

        message = f"❌ <b>Замовлення #{order_id} скасовано</b>"
        if reason:
            message += f"\n\nПричина: {reason}"

        for chat_id in TELEGRAM_ADMIN_CHAT_IDS:
            try:
                await bot.send_message(
                    chat_id=chat_id,
                    text=message,
                    parse_mode="HTML",
                )
            except Exception as e:
                logger.error(
                    f"Failed to send cancellation notification to chat {chat_id}: {e}"
                )

        await bot.session.close()
        return True

    except Exception as e:
        logger.error(f"Error sending cancellation notification: {e}")
        return False
