import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Order } from '../types';
import { Clock, Package, Truck, CheckCircle, Eye } from 'lucide-react';
import Badge from './ui/Badge';

interface KanbanBoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: number, newStatus: string) => void;
  onViewDetails: (orderId: number) => void;
}

const columns = [
  { id: 'pending', title: 'Очікує', icon: Clock, color: 'warning' },
  { id: 'accepted', title: 'Прийнято', icon: CheckCircle, color: 'info' },
  { id: 'preparing', title: 'Готується', icon: Package, color: 'primary' },
  { id: 'delivering', title: 'Доставка', icon: Truck, color: 'info' },
  { id: 'delivered', title: 'Доставлено', icon: CheckCircle, color: 'success' },
];

export default function KanbanBoard({ orders, onUpdateStatus, onViewDetails }: KanbanBoardProps) {
  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    
    if (!destination) return;
    
    const orderId = parseInt(draggableId.replace('order-', ''));
    const newStatus = destination.droppableId;
    
    onUpdateStatus(orderId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-2 overflow-x-auto pb-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnOrders = getOrdersByStatus(column.id);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-56">
              <div className="bg-gray-50 rounded-lg p-2.5">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-bold text-gray-900 text-xs">{column.title}</h3>
                  </div>
                  <Badge variant={column.color as any} size="sm">
                    {columnOrders.length}
                  </Badge>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-2 ${
                        snapshot.isDraggingOver ? 'bg-red-50 rounded-lg p-2' : ''
                      }`}
                    >
                      {columnOrders.map((order, index) => (
                        <Draggable
                          key={order.id}
                          draggableId={`order-${order.id}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2 cursor-grab active:cursor-grabbing ${
                                snapshot.isDragging ? 'shadow-2xl ring-2 ring-red-500' : 'hover:shadow-md'
                              } transition-all`}
                            >
                              <div className="flex items-start justify-between mb-1.5">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-xs">#{order.id}</h4>
                                  <p className="text-xs text-gray-500">
                                    User #{order.user_id}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(order.id);
                                  }}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="space-y-1 text-sm">
                                <div className="font-semibold text-gray-900 text-xs">
                                  ₴{(order.total_price / 100).toFixed(2)}
                                </div>
                                
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {order.delivery_address}
                                </div>
                                
                                <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
                                  {new Date(order.created_at).toLocaleString('uk-UA', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {columnOrders.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          Пусто
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}


