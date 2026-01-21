import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import type { CartItem, MenuItem } from '../types';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '../utils/notifications';

interface CartItemWithDetails extends CartItem {
  menu_item: MenuItem;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('client_token')) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/me');
      const cart = response.data;
      
      // Fetch menu item details for each cart item
      // Filter out items where menu item no longer exists
      const itemsWithDetails = await Promise.all(
        cart.items.map(async (item: CartItem) => {
          try {
            const menuResponse = await api.get(`/menu/${item.menu_item_id}`);
            return {
              ...item,
              menu_item: menuResponse.data,
            };
          } catch (error: any) {
            // If menu item not found (404), skip this cart item
            if (error.response?.status === 404) {
              console.warn(`Menu item ${item.menu_item_id} not found, removing from cart`);
              // Optionally remove invalid cart item from backend
              try {
                await api.delete(`/cart/me/items/${item.id}`);
              } catch (deleteError) {
                console.error('Failed to remove invalid cart item:', deleteError);
              }
              return null;
            }
            throw error;
          }
        })
      );
      
      // Filter out null values (items with missing menu items)
      const validItems = itemsWithDetails.filter((item): item is CartItemWithDetails => item !== null);
      setCartItems(validItems);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/me/items/${itemId}`, { quantity: newQuantity });
      fetchCart();
      showSuccess('Кількість оновлено');
    } catch (error) {
      console.error('Failed to update quantity:', error);
      showError('Помилка оновлення кількості');
    }
  };

  const removeItem = async (itemId: number) => {
    // Додаємо анімацію видалення
    setRemovingItems((prev) => new Set(prev).add(itemId));
    
    setTimeout(async () => {
      try {
        await api.delete(`/cart/me/items/${itemId}`);
        await fetchCart();
        showSuccess('Товар видалено з кошика');
      } catch (error) {
        console.error('Failed to remove item:', error);
        showError('Помилка при видаленні');
        // Повертаємо стан назад при помилці
        setRemovingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    }, 300);
  };

  const clearCart = async () => {
    if (!confirm('Очистити весь кошик?')) return;
    try {
      await api.delete('/cart/me');
      setCartItems([]);
      showSuccess('Кошик очищено');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      showError('Помилка очищення кошика');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-neutral-100">
          <ShoppingCart className="w-20 h-20 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">Ваш кошик порожній</h2>
          <p className="text-neutral-600 mb-8 text-lg">Додайте страви з меню, щоб почати замовлення</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Переглянути меню
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Кошик</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          Очистити все
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-neutral-100 ${
              removingItems.has(item.id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* Індикатор економії при великій кількості */}
            {item.quantity >= 3 && (
              <div className="mb-3 inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-accent-200">
                <span>🎉</span>
                Чудовий вибір! {item.quantity} порції
              </div>
            )}

            <div className="flex gap-4">
              {item.menu_item.image_url ? (
                <img
                  src={item.menu_item.image_url}
                  alt={item.menu_item.name}
                  loading="lazy"
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl border border-neutral-200"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <span className="text-4xl">🍕</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-2">
                  {item.menu_item.name}
                </h3>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {item.menu_item.description}
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Кількість */}
                  <div className="flex items-center gap-2 bg-neutral-50 rounded-xl p-1 border border-neutral-200">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-neutral-700" />
                    </button>
                    <span className="font-bold text-lg w-10 text-center text-neutral-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-lg hover:bg-white transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4 text-neutral-700" />
                    </button>
                  </div>

                  {/* Ціна та видалення */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-neutral-500">
                        ₴{(item.price / 100).toFixed(0)} × {item.quantity}
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-red-600">
                        ₴{((item.price * item.quantity) / 100).toFixed(0)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      title="Видалити"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total and Checkout */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-neutral-100">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Підсумок замовлення</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-neutral-600">
            <span>Товари ({cartItems.length} шт)</span>
            <span className="font-semibold">₴{(getTotalPrice() / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Доставка</span>
            <span className="font-semibold text-accent-600">Безкоштовно</span>
          </div>
          <div className="border-t-2 border-neutral-200 pt-3 flex justify-between items-center">
            <span className="text-xl font-bold text-neutral-900">Разом:</span>
            <span className="text-3xl font-bold text-red-600">
              ₴{(getTotalPrice() / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          >
            Оформити замовлення
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-3 px-6 rounded-xl font-medium hover:bg-neutral-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Продовжити покупки
          </Link>
        </div>
      </div>
    </div>
  );
}

