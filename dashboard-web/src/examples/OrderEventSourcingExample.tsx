import React, { useState } from 'react';
import { useEventSourcedOrders } from '../hooks/useEventSourcedOrders';
import { OrderState } from '../aggregates/orderAggregate';

// This is an example component showing how to use the Event Sourcing hooks
export default function OrderEventSourcingExample() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Example restaurant and user IDs
  const exampleRestaurantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const exampleUserId = '550e8400-e29b-41d4-a716-446655440000';
  
  // Use the Event Sourcing hook
  const {
    orders,
    isLoading,
    error,
    createOrder,
    addItemToOrder,
    removeItemFromOrder,
    submitOrder,
    acceptOrder,
    markOrderReady,
    completeOrder,
    cancelOrder,
    getOrderEventHistory
  } = useEventSourcedOrders({
    restaurantId: exampleRestaurantId,
    initialLoad: true,
    subscribeToUpdates: true
  });
  
  // Create a new order
  const handleCreateOrder = async () => {
    try {
      const orderId = await createOrder({
        restaurantId: exampleRestaurantId,
        userId: exampleUserId,
        orderType: 'PICKUP'
      });
      
      setSelectedOrderId(orderId);
      console.log('Order created with ID:', orderId);
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };
  
  // Add an item to the order
  const handleAddItem = async () => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    try {
      await addItemToOrder(selectedOrderId, {
        itemId: '123',
        name: 'Cheeseburger',
        price: 9.99,
        quantity: 1,
        options: [
          { id: 'opt1', name: 'Extra Cheese', price: 1.50 }
        ]
      });
      console.log('Item added to order');
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };
  
  // Remove an item from the order
  const handleRemoveItem = async (itemId: string) => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    try {
      await removeItemFromOrder(selectedOrderId, itemId);
      console.log('Item removed from order');
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };
  
  // Submit the order
  const handleSubmitOrder = async () => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    if (!selectedOrder) return;
    
    try {
      await submitOrder(selectedOrderId, {
        totalAmount: selectedOrder.totalAmount,
        specialInstructions: 'Please make it extra spicy'
      });
      console.log('Order submitted');
    } catch (err) {
      console.error('Error submitting order:', err);
    }
  };
  
  // Accept the order
  const handleAcceptOrder = async () => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    try {
      await acceptOrder(selectedOrderId, {
        estimatedReadyTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
        acceptedBy: 'Restaurant Staff ID'
      });
      console.log('Order accepted');
    } catch (err) {
      console.error('Error accepting order:', err);
    }
  };
  
  // Mark the order as ready
  const handleMarkReady = async () => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    try {
      await markOrderReady(selectedOrderId, {
        preparedBy: 'Chef ID'
      });
      console.log('Order marked as ready');
    } catch (err) {
      console.error('Error marking order as ready:', err);
    }
  };
  
  // Complete the order
  const handleCompleteOrder = async () => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    try {
      await completeOrder(selectedOrderId, {
        completedBy: 'Staff ID',
        rating: 5,
        feedback: 'Great service!'
      });
      console.log('Order completed');
    } catch (err) {
      console.error('Error completing order:', err);
    }
  };
  
  // Cancel the order
  const handleCancelOrder = async () => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    try {
      await cancelOrder(selectedOrderId, {
        reason: 'Customer requested cancellation',
        cancelledBy: exampleUserId
      });
      console.log('Order cancelled');
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };
  
  // View order event history
  const handleViewHistory = async () => {
    if (!selectedOrderId) {
      alert('Please select an order first');
      return;
    }
    
    try {
      const history = await getOrderEventHistory(selectedOrderId);
      setOrderHistory(history);
      setShowHistory(true);
      console.log('Order history:', history);
    } catch (err) {
      console.error('Error fetching order history:', err);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management (Event Sourcing)</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.message}
        </div>
      )}
      
      {/* Order Actions */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-3">Order Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleCreateOrder}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Create New Order
          </button>
          
          <button 
            onClick={handleAddItem}
            disabled={!selectedOrderId}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add Item
          </button>
          
          <button 
            onClick={handleSubmitOrder}
            disabled={!selectedOrderId}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Submit Order
          </button>
          
          <button 
            onClick={handleAcceptOrder}
            disabled={!selectedOrderId}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Accept Order
          </button>
          
          <button 
            onClick={handleMarkReady}
            disabled={!selectedOrderId}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Mark Ready
          </button>
          
          <button 
            onClick={handleCompleteOrder}
            disabled={!selectedOrderId}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Complete Order
          </button>
          
          <button 
            onClick={handleCancelOrder}
            disabled={!selectedOrderId}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Cancel Order
          </button>
          
          <button 
            onClick={handleViewHistory}
            disabled={!selectedOrderId}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            View Event History
          </button>
        </div>
      </div>
      
      {/* Order List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Orders</h2>
        {isLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found. Create one to get started.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order: OrderState) => (
              <div 
                key={order.id}
                className={`border rounded p-4 cursor-pointer transition ${
                  selectedOrderId === order.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">Order #{order.id.substring(0, 8)}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      order.status === 'DRAFT' ? 'bg-gray-200' :
                      order.status === 'SUBMITTED' ? 'bg-yellow-200' :
                      order.status === 'ACCEPTED' ? 'bg-blue-200' :
                      order.status === 'READY' ? 'bg-green-200' :
                      order.status === 'COMPLETED' ? 'bg-teal-200' :
                      order.status === 'CANCELLED' ? 'bg-red-200' :
                      order.status === 'REJECTED' ? 'bg-orange-200' :
                      'bg-gray-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600">Items: {order.items.length}</p>
                  <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                </div>
                
                {/* Items */}
                {order.items.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold mb-1">Items:</h3>
                    <ul className="text-sm space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <div className="flex gap-2">
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                            {order.status === 'DRAFT' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveItem(item.id);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Order Type */}
                <div className="text-sm">
                  <span className={`font-semibold ${
                    order.orderType === 'PICKUP' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {order.orderType}
                  </span>
                  
                  {order.estimatedReadyTime && (
                    <span className="ml-2 text-gray-600">
                      Ready: {new Date(order.estimatedReadyTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Event History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Event History</h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              
              {orderHistory.length === 0 ? (
                <p>No events found for this order.</p>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((event, index) => (
                    <div key={event.id} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">
                          {index + 1}. {event.type}
                        </span>
                        <span className="text-gray-600 text-sm">
                          Version: {event.version}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                      <div className="bg-gray-100 p-3 rounded">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}