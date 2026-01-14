import { useState, useEffect } from 'react';

/**
 * Hook для debounce значення (затримка оновлення)
 * Корисно для пошуку, щоб не робити запит на кожну букву
 * 
 * @param value - Значення для debounce
 * @param delay - Затримка в мілісекундах (за замовчуванням 300ms)
 * @returns Debounced значення
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Встановлюємо таймер для оновлення значення
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищуємо таймер при кожній зміні value або delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

