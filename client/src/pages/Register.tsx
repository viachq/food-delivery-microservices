import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { showSuccess } from '../utils/notifications';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Перевірка сили пароля
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Слабкий', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Середній', color: 'bg-yellow-500' };
    return { strength, label: 'Сильний', color: 'bg-green-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (password.length < 6) {
      setError('Пароль має бути не менше 6 символів');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', { username, password });
      
      // Auto-login after registration
      const loginResponse = await api.post('/auth/login', { username, password });
      localStorage.setItem('client_token', loginResponse.data.access_token);
      localStorage.setItem('client_user', JSON.stringify(loginResponse.data.user));
      
      showSuccess(`Вітаємо, ${username}! Реєстрація успішна`);
      setTimeout(() => navigate('/'), 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Реєстрація</h1>
            <p className="text-gray-600">Створіть новий акаунт</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Логін
              </label>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Мінімум 3 символи"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="Мінімум 6 символів"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Індикатор сили пароля */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-600">Сила пароля:</span>
                    <span className={`font-bold ${
                      passwordStrength.strength <= 2 ? 'text-red-600' : 
                      passwordStrength.strength <= 3 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 transition-all duration-300 ${
                          i < passwordStrength.strength ? passwordStrength.color : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Підтвердіть пароль
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="Повторіть пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Індикатор співпадіння паролів */}
              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Паролі співпадають</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600 font-medium">Паролі не співпадають</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              {loading ? 'Реєстрація...' : 'Зареєструватись'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Вже маєте акаунт?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                Увійти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

