import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/AllOrders.css';
import axios from 'axios';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [updateStatus, setUpdateStatus] = useState('');
  const username = localStorage.getItem('username');

  // Memoized fetchOrders function to avoid re-creation on each render
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-orders');
      const filteredOrders = response.data
        .filter((order) => order.restaurantName === username)
        .reverse();
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, [username]); // Only depends on username

  useEffect(() => {
    fetchOrders(); // Fetch orders when component mounts
  }, [fetchOrders]); // Correctly adding fetchOrders to the dependency array

  const cancelOrder = async (id) => {
    try {
      await axios.put('http://localhost:6001/cancel-order', { id });
      alert('Order cancelled!');
      fetchOrders(); // Refresh orders after cancel
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const updateOrderStatus = async (id) => {
    try {
      await axios.put('http://localhost:6001/update-order-status', {
        id,
        updateStatus,
      });
      alert('Order status updated!');
      setUpdateStatus(''); // Clear the selected status
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      alert('Order update failed!');
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <div className="all-orders-page">
      <h3>Orders</h3>

      <div className="all-orders">
        {orders.map((order) => (
          <div className="all-orders-order" key={order._id}>
            <img src={order.foodItemImg} alt="" />
            <div className="all-orders-order-data">
              <h4>{order.foodItemName}</h4>
              <p>{order.restaurantName}</p>
              <div>
                <span>
                  <p>
                    <b>UserId: </b> {order.userId}
                  </p>
                </span>
                <span>
                  <p>
                    <b>Name: </b> {order.name}
                  </p>
                </span>
                <span>
                  <p>
                    <b>Mobile: </b> {order.mobile}
                  </p>
                </span>
                <span>
                  <p>
                    <b>Email: </b> {order.email}
                  </p>
                </span>
              </div>
              <div>
                <span>
                  <p>
                    <b>Quantity: </b> {order.quantity}
                  </p>
                </span>
                <span>
                  <p>
                    <b>Total Price: </b> &#8377;
                    {parseInt(order.price - (order.price * order.discount) / 100) *
                      order.quantity}{' '}
                    <s>&#8377; {order.price * order.quantity}</s>
                  </p>
                </span>
                <span>
                  <p>
                    <b>Payment mode: </b> {order.paymentMethod}
                  </p>
                </span>
              </div>
              <div>
                <span>
                  <p>
                    <b>Address: </b> {order.address}
                  </p>
                </span>
                <span>
                  <p>
                    <b>Pincode: </b> {order.pincode}
                  </p>
                </span>
                <span>
                  <p>
                    <b>Ordered on: </b> {order.orderDate.slice(0, 10)} Time: {order.orderDate.slice(11, 16)}
                  </p>
                </span>
              </div>
              <div>
                <span>
                  <p>
                    <b>Status: </b> {order.orderStatus}
                  </p>
                </span>
              </div>

              {order.orderStatus === 'order placed' || order.orderStatus === 'In-transit' ? (
                <div>
                  <span>
                    <div>
                      <select
                        className="form-select form-select-sm"
                        id="flotingSelect-allOrders"
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                      >
                        <option value="" disabled>
                          Update order status
                        </option>
                        <option value="order placed">Order Accepted</option>
                        <option value="In-transit">In-transit</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => updateOrderStatus(order._id)}
                    >
                      Update
                    </button>
                  </span>

                  <button
                    className="btn btn-outline-danger"
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantOrders;
