import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Review } from '../types';
import { Trash2, Star, TrendingUp, MessageCircle } from 'lucide-react';
import Card from '../components/ui/Card';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/');
      setReviews(response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reviews Management</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution.reverse();
  };

  const filteredReviews = ratingFilter
    ? reviews.filter((review) => review.rating === ratingFilter)
    : reviews;

  const distribution = getRatingDistribution();
  const avgRating = calculateAverageRating();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
        {ratingFilter && (
          <button
            onClick={() => setRatingFilter(null)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <span>Скинути фільтр</span>
            <span className="text-red-600">✕</span>
          </button>
        )}
      </div>

      {/* Stats Overview */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Average Rating Card */}
          <Card padding="md" className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Середній рейтинг</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
                  <span className="text-gray-500 text-lg">/ 5</span>
                </div>
              </div>
              <Star className="w-12 h-12 fill-yellow-400 text-yellow-400" />
            </div>
          </Card>

          {/* Total Reviews */}
          <Card padding="md" className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Всього відгуків</p>
                <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
              </div>
              <MessageCircle className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          {/* Positive Reviews */}
          <Card padding="md" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Позитивні</p>
                <div className="text-3xl font-bold text-gray-900">
                  {reviews.filter(r => r.rating >= 4).length}
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Ratings Distribution */}
      {reviews.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Фільтрація за рейтингом</h3>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[[5, 4, 3, 2, 1].indexOf(stars)];
                return (
                  <button
                    key={stars}
                    onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      ratingFilter === stars
                        ? 'bg-yellow-400 text-white shadow-md'
                        : count > 0
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={count === 0}
                  >
                    <Star className={`w-4 h-4 ${ratingFilter === stars ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                    <span>{stars}</span>
                    <span className={`text-xs ${ratingFilter === stars ? 'text-white' : 'text-gray-500'}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Star className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-2">Customer reviews will appear here after they rate their delivered orders</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.length === 0 ? (
            <Card padding="lg" className="text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Немає відгуків з вибраним рейтингом</p>
              <button
                onClick={() => setRatingFilter(null)}
                className="mt-4 text-red-600 hover:text-red-700 font-medium"
              >
                Скинути фільтр
              </button>
            </Card>
          ) : (
            filteredReviews.map((review) => {
              const ratingColors = {
                5: 'from-green-50 to-emerald-50 border-green-200',
                4: 'from-blue-50 to-cyan-50 border-blue-200',
                3: 'from-yellow-50 to-orange-50 border-yellow-200',
                2: 'from-orange-50 to-red-50 border-orange-200',
                1: 'from-red-50 to-pink-50 border-red-200',
              };
              const bgColor = ratingColors[review.rating as keyof typeof ratingColors] || 'from-gray-50 to-gray-100 border-gray-200';
              
              return (
                <Card key={review.id} padding="none" className={`overflow-hidden hover:shadow-xl transition-all bg-gradient-to-br ${bgColor}`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">User #{review.user_id}</span>
                          <span>•</span>
                          <span>{new Date(review.created_at).toLocaleDateString('uk-UA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Видалити відгук"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-gray-800 text-base leading-relaxed mb-3 italic">
                      "{review.text}"
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-white px-2 py-1 rounded">📦 Замовлення #{review.order_id}</span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

