import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Order, OrderDetails } from '../types';
import { Eye, Package, Clock, CheckCircle, XCircle, Truck, LayoutGrid, Table as TableIcon } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivering: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  accepted: CheckCircle,
  preparing: Package,
  ready: CheckCircle,
  delivering: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    delivering: orders.filter((o) => o.status === 'delivering').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, null, {
        params: { status: newStatus },
      });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders Management</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Таблиця</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
        </div>
      </div>

      {/* Status Filters - only for table view */}
      {viewMode === 'table' && (
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            statusFilter === null
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Orders
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-opacity-20 bg-white">
            {statusCounts.all}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            statusFilter === 'pending'
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-1" />
          Pending
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-opacity-20 bg-white">
            {statusCounts.pending}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('preparing')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            statusFilter === 'preparing'
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Package className="w-4 h-4 inline mr-1" />
          Preparing
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-opacity-20 bg-white">
            {statusCounts.preparing}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('delivering')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            statusFilter === 'delivering'
              ? 'bg-indigo-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Truck className="w-4 h-4 inline mr-1" />
          Delivering
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-opacity-20 bg-white">
            {statusCounts.delivering}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('delivered')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            statusFilter === 'delivered'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Delivered
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-opacity-20 bg-white">
            {statusCounts.delivered}
          </span>
        </button>
      </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          orders={orders}
          onUpdateStatus={updateOrderStatus}
          onViewDetails={fetchOrderDetails}
        />
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No orders found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {statusFilter
                          ? 'Try selecting a different status filter'
                          : 'Orders will appear here once customers place them'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      User #{order.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₴{(order.total_price / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Order Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order #{selectedOrder.id}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
                  <p className="text-gray-900">{selectedOrder.delivery_address}</p>
                </div>
                
                {selectedOrder.delivery_time && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Delivery Time</h3>
                    <p className="text-gray-900">{new Date(selectedOrder.delivery_time).toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Change Status</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivering">Delivering</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.menu_item_name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity} × ₴{(item.price / 100).toFixed(2)}</p>
                        </div>
                        <p className="font-medium text-gray-900">₴{(item.subtotal / 100).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-gray-50 font-bold">
                      <span>Total</span>
                      <span className="text-red-600">₴{(selectedOrder.total_price / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

