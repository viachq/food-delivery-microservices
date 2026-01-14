import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';

interface Review {
  id: number;
  rating: number;
}

export default function RatingsSummary() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // for 1-5 stars
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution.reverse(); // 5 stars first
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;
  const avgRating = calculateAverageRating();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Рейтинг ресторану</h3>
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
          <span className="text-gray-500 text-sm">/ 5</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {[5, 4, 3, 2, 1].map((stars, index) => {
          const count = distribution[index];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium text-gray-700 w-3">{stars}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <span className="text-sm font-medium text-gray-600 w-16 text-right">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Всього відгуків: <span className="font-bold text-gray-900">{totalReviews}</span>
        </p>
      </div>
    </div>
  );
}


