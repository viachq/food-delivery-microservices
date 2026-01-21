import { useEffect, useState } from 'react';
import api from '../api/client';
import type { MenuItem, Category } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';

interface MenuItemStats {
  id: number;
  orders_count: number;
  total_sold: number;
  revenue: number;
}

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemsStats, setItemsStats] = useState<Record<number, MenuItemStats>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, category_id: null as number | null, image_url: '' });
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchItemsStats();
  }, []);

  const fetchItemsStats = async () => {
    try {
      // Використовуємо top_items з overview для статистики
      const response = await api.get('/admin/stats/overview');
      const statsMap: Record<number, MenuItemStats> = {};
      
      response.data.top_items.forEach((item: any) => {
        statsMap[item.id] = {
          id: item.id,
          orders_count: item.orders,
          total_sold: item.sold,
          revenue: 0, // Можна розрахувати з ціни
        };
      });
      
      setItemsStats(statsMap);
    } catch (error) {
      console.error('Failed to fetch items stats:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get('/menu/');
      setItems(response.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/menu/${editingItem.id}`, formData);
      } else {
        await api.post('/admin/menu', formData);
      }
      fetchItems();
      setModalOpen(false);
      setFormData({ name: '', description: '', price: 0, category_id: null, image_url: '' });
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/menu/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        description: item.description || '', 
        price: item.price, 
        category_id: item.category_id,
        image_url: item.image_url || '' 
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', price: 0, category_id: null, image_url: '' });
    }
    setModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;

  const filteredItems = categoryFilter
    ? items.filter((item) => item.category_id === categoryFilter)
    : items;


  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="w-5 h-5" /> Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фільтр по категорії:
        </label>
        <select
          value={categoryFilter || ''}
          onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">All Categories ({items.length})</option>
          {categories.map((category) => {
            const count = items.filter((item) => item.category_id === category.id).length;
            return (
              <option key={category.id} value={category.id}>
                {category.name} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No menu items found</p>
          <p className="text-gray-400 text-sm mt-2">Try changing the filter or add new items</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stats = itemsStats[item.id];
            
            return (
              <Card key={item.id} padding="none" className="overflow-hidden hover:shadow-xl transition-all">
                {/* Image */}
                <div className="relative">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-48 object-cover" 
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  {/* Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500">Замовлень</div>
                        <div className="text-lg font-bold text-gray-900">{stats.orders_count}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Продано</div>
                        <div className="text-lg font-bold text-gray-900">{stats.total_sold}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-600">₴{(item.price / 100).toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} Menu Item</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={formData.category_id || ''} 
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })} 
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">No category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (in kopiyky)</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input type="text" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">Save</button>
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

