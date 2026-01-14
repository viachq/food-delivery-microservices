import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Categories from './pages/Categories';
import Restaurant from './pages/Restaurant';
import Reviews from './pages/Reviews';
import Users from './pages/Users';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user_role');
  
  // Перевірка наявності токену
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Перевірка ролі - тільки адміністратори
  if (userRole === 'client') {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Layout>
                <Orders />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <PrivateRoute>
              <Layout>
                <Menu />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Layout>
                <Categories />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/restaurant"
          element={
            <PrivateRoute>
              <Layout>
                <Restaurant />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <PrivateRoute>
              <Layout>
                <Reviews />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
