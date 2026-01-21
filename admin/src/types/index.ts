export interface User {
  id: number;
  username: string;
  role: 'client' | 'restaurant_admin' | 'system_admin';
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_price: number;
  delivery_address: string;
  delivery_time: string | null;
  created_at: string;
  payment_method: string;
}

export interface OrderDetails extends Order {
  restaurant_id: number;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  restaurant_id: number;
  category_id: number | null;
  image_url: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  opening_hours: string;
}

export interface Review {
  id: number;
  user_id: number;
  order_id: number;
  rating: number;
  text: string;
  created_at: string;
}

export interface Stats {
  orders: number;
  revenue: number;
  average_order: number;
  active_orders: number;
  menu_items_count: number;
  top_items: { id: number; name: string; orders: number; sold: number }[];
}

