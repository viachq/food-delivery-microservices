import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Category, MenuItem } from '../types';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

interface CategoryStats {
  id: number;
  items_count: number;
  orders_count: number;
  revenue: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu/');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const getCategoryStats = (categoryId: number): CategoryStats => {
    const items = menuItems.filter((item) => item.category_id === categoryId);
    return {
      id: categoryId,
      items_count: items.length,
      orders_count: 0, // Можна додати з backend
      revenue: 0,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/admin/categories', formData);
      }
      fetchCategories();
      setModalOpen(false);
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? All menu items will become uncategorized.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id);
          const categoryIcons: Record<string, string> = {
            'Закуски та Салати': '🥗',
            'Основні страви': '🍖',
            'Десерти': '🍰',
            'Напої': '🥤',
          };
          const icon = categoryIcons[category.name] || '🍴';
          
          return (
            <Card key={category.id} padding="md" className="hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <Badge variant="gray" size="sm" className="mt-1">
                      {stats.items_count} страв
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {category.description || 'Опис відсутній'}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openModal(category)}
                  icon={<Edit className="w-4 h-4" />}
                  className="flex-1"
                >
                  Редагувати
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="flex-1"
                >
                  Видалити
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No categories yet. Add your first category!</p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingCategory ? 'Edit' : 'Add'} Category
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="е.g., Перші страви, Десерти"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
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

