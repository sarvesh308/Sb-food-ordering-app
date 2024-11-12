import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../../styles/Profile.css';
import { GeneralContext } from '../../context/GeneralContext';
import axios from 'axios';

const Profile = () => {
  const { logout } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoizing fetchOrders function
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-orders');
      setOrders(response.data.filter((order) => order.userId === userId).reverse());
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  }, [userId]); // Adding userId as dependency since it's used inside fetchOrders

  useEffect(() => {
    fetchOrders(); // Now this will work properly
  }, [fetchOrders]); // Including fetchOrders in the dependency array

  const cancelOrder = async (id) => {
    try {
      await axios.put('http://localhost:6001/cancel-order', { id });
      alert('Order cancelled!');
      fetchOrders();
    } catch (err) {
      alert('Failed to cancel order');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profilePage">
      <div className="profileCard">
        <span>
          <h5>Username: </h5>
          <p>{username}</p>
        </span>
        <span>
          <h5>Email: </h5>
          <p>{email}</p>
        </span>
        <span>
          <h5>Orders: </h5>
          <p>{orders.length}</p>
        </span>
        <button className="btn btn-danger" onClick={() => logout()}>
          Logout
        </button>
      </div>

      <div className="profileOrders-container">
        <h3>Orders</h3>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="profileOrders">
            {orders.map((order) => (
              <div className="profileOrder" key={order._id}>
                <img src={order.foodItemImg} alt={order.foodItemName} />
                <div className="profileOrder-data">
                  <h4>{order.foodItemName}</h4>
                  <p>{order.restaurantName}</p>
                  <div>
                    <span>
                      <p>
                        <b>Quantity: </b> {order.quantity}
                      </p>
                    </span>
                    <span>
                      <p>
                        <b>Total Price: </b>{' '}
                        &#8377;{' '}
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
                        <b>Ordered on: </b>{' '}
                        {new Date(order.orderDate).toLocaleDateString()} at{' '}
                        {new Date(order.orderDate).toLocaleTimeString()}
                      </p>
                    </span>
                    <span>
                      <p>
                        <b>Status: </b> {order.orderStatus}
                      </p>
                    </span>
                  </div>
                  {order.orderStatus === 'order placed' || order.orderStatus === 'In-transit' ? (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
