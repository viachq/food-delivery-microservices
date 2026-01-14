import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { CreditCard, MapPin, Calendar, CheckCircle, ShoppingBag } from 'lucide-react';
import { showError } from '../utils/notifications';

export default function Checkout() {
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [useScheduledDelivery, setUseScheduledDelivery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('client_token')) {
      navigate('/login');
      return;
    }
    fetchCartSummary();
  }, [navigate]);

  const fetchCartSummary = async () => {
    try {
      const response = await api.get('/cart/me');
      const total = response.data.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      setCartTotal(total);
      setCartItemsCount(response.data.items.length);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData: any = { address };
      
      if (useScheduledDelivery && deliveryTime) {
        orderData.delivery_time = deliveryTime;
      }

      await api.post('/orders', orderData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/orders`);
      }, 2000);
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Помилка при створенні замовлення');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Замовлення оформлено!</h2>
          <p className="text-gray-600 mb-6">Дякуємо за замовлення. Очікуйте дзвінка для підтвердження.</p>
          <p className="text-sm text-gray-500">Перенаправлення на сторінку замовлень...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформлення замовлення</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Адреса доставки</h2>
          </div>
          <input
            type="text"
            required
            minLength={5}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="наприклад: вул. Хрещатик, 1, кв. 5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <p className="mt-2 text-sm text-gray-500">
            Введіть повну адресу з вулицею, будинком та квартирою
          </p>
        </div>

        {/* Delivery Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Час доставки</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!useScheduledDelivery}
                onChange={() => setUseScheduledDelivery(false)}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-gray-700">Якомога швидше (30-40 хв)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={useScheduledDelivery}
                onChange={() => setUseScheduledDelivery(true)}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-gray-700">Запланувати на конкретний час</span>
            </label>

            {useScheduledDelivery && (
              <div className="ml-7 mt-3">
                <input
                  type="datetime-local"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Оберіть бажаний час доставки (не раніше ніж через 1 годину)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Спосіб оплати</h2>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <CreditCard className="w-6 h-6 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Оплата карткою</p>
              <p className="text-sm text-gray-500">Оплата при отриманні</p>
            </div>
          </div>
        </div>

        {/* Підсумок замовлення */}
        <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl shadow-sm p-6 border-2 border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-neutral-900">Підсумок замовлення</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-neutral-600">
              <span>Товари ({cartItemsCount} шт)</span>
              <span className="font-semibold">₴{(cartTotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Доставка</span>
              <span className="font-semibold text-accent-600">Безкоштовно</span>
            </div>
            <div className="border-t-2 border-neutral-200 pt-3 flex justify-between items-center">
              <span className="text-xl font-bold text-neutral-900">Разом до сплати:</span>
              <span className="text-3xl font-bold text-red-600">
                ₴{(cartTotal / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || cartTotal === 0}
          className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          {loading ? 'Оформлення...' : `Підтвердити замовлення на ₴${(cartTotal / 100).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

