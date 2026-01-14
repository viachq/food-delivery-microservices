import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Stats } from '../types';
import { DollarSign, ShoppingBag, Star, Clock, Receipt } from 'lucide-react';
import Card from '../components/ui/Card';
import OrdersChart from '../components/OrdersChart';
import RatingsSummary from '../components/RatingsSummary';

interface OrdersData {
  date: string;
  orders: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchOrdersData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersData = async () => {
    try {
      const response = await api.get('/admin/stats/orders-by-day');
      setOrdersData(response.data);
    } catch (error) {
      console.error('Failed to fetch orders data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Orders',
      value: stats?.orders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Revenue',
      value: `₴${((stats?.revenue || 0) / 100).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Average Order',
      value: `₴${((stats?.average_order || 0) / 100).toFixed(0)}`,
      icon: Receipt,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Orders',
      value: stats?.active_orders || 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Menu Items',
      value: stats?.menu_items_count || 0,
      icon: Star,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} padding="md" className="hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-xl shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1 uppercase tracking-wide">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card padding="md">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Замовлення за 7 днів</h2>
            <p className="text-sm text-gray-500 mt-1">Динаміка замовлень за останній тиждень</p>
          </div>
          <OrdersChart data={ordersData} />
        </Card>

        {/* Ratings Summary */}
        <div>
          <RatingsSummary />
        </div>
      </div>

      {/* Top Items */}
      <Card padding="md">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Топ страви</h2>
          <p className="text-sm text-gray-500 mt-1">Найпопулярніші страви по кількості замовлень</p>
        </div>
        {stats?.top_items && stats.top_items.length > 0 ? (
          <div className="space-y-3">
            {stats.top_items.map((item, index) => {
              return (
              <div
                key={item.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-red-200"
              >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl font-bold text-xl shadow-lg">
                    {index + 1}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">
                        📦 <span className="font-semibold">{item.orders}</span> замовлень
                      </span>
                      <span className="text-sm text-gray-600">
                        🍽️ <span className="font-semibold">{item.sold}</span> продано
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Поки що немає замовлень</p>
          </div>
        )}
      </Card>
    </div>
  );
}

