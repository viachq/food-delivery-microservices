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

export interface CartItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  price: number;
  menu_item?: MenuItem;
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

