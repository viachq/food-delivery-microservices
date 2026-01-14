import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { Order } from '../types';
import { Package, Clock, CheckCircle, XCircle, Truck, Star, MapPin, Calendar, CreditCard, Filter } from 'lucide-react';
import { showSuccess, showError } from '../utils/notifications';

const statusIcons: Record<string, any> = {
  pending: Clock,
  accepted: CheckCircle,
  preparing: Package,
  ready: CheckCircle,
  delivering: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivering: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Очікує підтвердження',
  accepted: 'Прийнято',
  preparing: 'Готується',
  ready: 'Готово',
  delivering: 'Доставляється',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('client_token')) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (orderId: number) => {
    setSelectedOrder(orderId);
    setRating(5);
    setComment('');
    setReviewModal(true);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.post(`/orders/${selectedOrder}/review`, { rating, comment });
      showSuccess('Дякуємо за відгук!');
      setReviewModal(false);
      fetchOrders();
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Помилка при додаванні відгуку');
    }
  };

  // Фільтрація замовлень
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter((o) => o.status === statusFilter);

  // Прогрес-бар для статусу замовлення
  const getProgressPercentage = (status: string) => {
    const progress: Record<string, number> = {
      pending: 14,
      accepted: 28,
      preparing: 42,
      ready: 56,
      delivering: 85,
      delivered: 100,
      cancelled: 0,
    };
    return progress[status] || 0;
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

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-16 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">У вас ще немає замовлень</h2>
          <p className="text-gray-600 mb-6">Замовте щось смачненьке!</p>
          <a
            href="/"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700"
          >
            Переглянути меню
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Мої замовлення</h1>

      {/* Фільтри статусів */}
      <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <Filter className="w-5 h-5 text-neutral-500 flex-shrink-0" />
        {[
          { value: 'all', label: '🔍 Всі', icon: null },
          { value: 'pending', label: 'Очікує', icon: Clock },
          { value: 'preparing', label: 'Готується', icon: Package },
          { value: 'delivering', label: 'Доставка', icon: Truck },
          { value: 'delivered', label: 'Доставлено', icon: CheckCircle },
        ].map((filter) => {
          const FilterIcon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                statusFilter === filter.value
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-red-300'
              }`}
            >
              {FilterIcon && <FilterIcon className="w-4 h-4" />}
              <span>{filter.label}</span>
              {filter.value === 'all' && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  statusFilter === 'all' ? 'bg-white/20' : 'bg-neutral-100'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const StatusIcon = statusIcons[order.status] || Clock;
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Замовлення #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString('uk-UA')}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status]
                  }`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{order.delivery_address}</span>
                </div>
                {order.delivery_time && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Запланована доставка: {new Date(order.delivery_time).toLocaleString('uk-UA')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>Оплата: {order.payment_method === 'card' ? 'Картка' : order.payment_method}</span>
                </div>
              </div>

              {/* Прогрес-бар замовлення */}
              {order.status !== 'cancelled' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
                    <span className="font-medium">Прогрес замовлення</span>
                    <span className="font-bold">{getProgressPercentage(order.status)}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 rounded-full"
                      style={{ width: `${getProgressPercentage(order.status)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <span className="text-2xl font-bold text-red-600">
                  ₴{(order.total_price / 100).toFixed(2)}
                </span>
                {order.status === 'delivered' && (
                  <button
                    onClick={() => openReviewModal(order.id)}
                    className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2.5 rounded-xl hover:bg-yellow-600 font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Star className="w-4 h-4" />
                    Залишити відгук
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={() => setReviewModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Залишити відгук</h2>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Оцінка</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ваш відгук</label>
                  <textarea
                    required
                    minLength={10}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Розкажіть про ваш досвід (мінімум 10 символів)"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Відправити
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

