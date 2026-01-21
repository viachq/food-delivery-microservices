import { useEffect, useState } from 'react';
import { MapPin, Phone, Clock, Star, Mail, Users, Package, TrendingUp, Award } from 'lucide-react';
import api from '../api/client';

interface RestaurantInfo {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  opening_hours: string;
}

interface Review {
  id: number;
  user_id: number;
  order_id: number;
  rating: number;
  text: string;
  created_at: string;
}

export default function About() {
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantInfo();
    fetchReviews();
  }, []);

  const fetchRestaurantInfo = async () => {
    try {
      const response = await api.get('/restaurant/info');
      setRestaurantInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurant info:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get('/restaurant/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-red-700 rounded-3xl p-8 md:p-16 text-white mb-12 shadow-2xl">
          {/* Animated Background Patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <Award className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wider">Найкраща доставка міста</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
              {restaurantInfo?.name || 'Food Delivery'}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed font-light">
              {restaurantInfo?.description || 'Ваш надійний партнер у доставці смачної їжі'}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
            <Users className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl md:text-4xl font-bold mb-1">1000+</div>
            <div className="text-sm md:text-base text-blue-100">Задоволених клієнтів</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
            <Package className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl md:text-4xl font-bold mb-1">5000+</div>
            <div className="text-sm md:text-base text-green-100">Доставлено замовлень</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
            <Star className="w-10 h-10 mb-3 opacity-80 fill-white" />
            <div className="text-3xl md:text-4xl font-bold mb-1">{calculateAverageRating()}</div>
            <div className="text-sm md:text-base text-purple-100">Середній рейтинг</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform">
            <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl md:text-4xl font-bold mb-1">30 хв</div>
            <div className="text-sm md:text-base text-orange-100">Середній час доставки</div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12 mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">Контактна інформація</h2>
            <p className="text-gray-600 text-lg">Зв'яжіться з нами будь-яким зручним способом</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="group relative flex items-start gap-5 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-red-200">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-2 text-lg">Адреса</p>
                <p className="text-gray-700 leading-relaxed">
                  {restaurantInfo?.address || 'вул. Прикладна, 1, Київ, 01001'}
                </p>
              </div>
            </div>

            <div className="group relative flex items-start gap-5 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-2 text-lg">Телефон</p>
                <a href={`tel:${restaurantInfo?.phone}`} className="text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium">
                  {restaurantInfo?.phone || '+380 XX XXX XXXX'}
                </a>
              </div>
            </div>

            <div className="group relative flex items-start gap-5 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-2 text-lg">Email</p>
                <a href="mailto:info@fooddelivery.com" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  info@fooddelivery.com
                </a>
              </div>
            </div>

            <div className="group relative flex items-start gap-5 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-200">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-2 text-lg">Години роботи</p>
                <p className="text-gray-700 font-medium">
                  {restaurantInfo?.opening_hours || 'Пн-Нд: 09:00 - 22:00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">Відгуки клієнтів</h2>
            <p className="text-gray-600 text-lg">Що кажуть наші клієнти про нас</p>
          </div>

          {reviews.length > 0 && (
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-4 bg-gradient-to-br from-yellow-400 to-orange-400 px-8 py-4 rounded-2xl shadow-xl">
                <Star className="w-10 h-10 fill-white text-white" />
                <div className="text-white">
                  <div className="text-4xl font-bold">
                    {calculateAverageRating()}
                  </div>
                  <div className="text-sm opacity-90">на основі {reviews.length} відгуків</div>
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
              <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-6">
                <Star className="w-16 h-16 text-gray-300" />
              </div>
              <p className="text-gray-900 text-2xl font-bold mb-3">Поки що немає відгуків</p>
              <p className="text-gray-600 text-lg">
                Станьте першим, хто залишить відгук після замовлення!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review, index) => {
                const colors = [
                  'from-red-50 to-orange-50 border-red-200',
                  'from-blue-50 to-cyan-50 border-blue-200',
                  'from-purple-50 to-pink-50 border-purple-200',
                  'from-green-50 to-emerald-50 border-green-200',
                  'from-yellow-50 to-orange-50 border-yellow-200',
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div
                    key={review.id}
                    className={`relative bg-gradient-to-br ${colorClass} border-2 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-2xl">👤</span>
                    </div>
                    
                    <div className="mb-4">
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-gray-800 leading-relaxed text-base mb-4 italic">
                      "{review.text}"
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600 font-medium">
                        Користувач #{review.user_id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('uk-UA', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

