import React, { useEffect, useState } from 'react';
import '../../styles/RestaurantHome.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantHome = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [restaurant, setRestaurant] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [ItemsCount, setItemsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:6001/fetch-user-details/${userId}`);
        setRestaurant(response.data);
      } catch (err) {
        setError('Failed to fetch user details');
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await axios.get(`http://localhost:6001/fetch-restaurant-details/${userId}`);
        setRestaurantData(response.data);
      } catch (err) {
        setError('Failed to fetch restaurant details');
        setLoading(false);
      }
    };

    if (restaurant) {
      fetchRestaurantData();
    }
  }, [restaurant, userId]);

  // Fetch items and orders once restaurant data is available
  useEffect(() => {
    const fetchCounts = async () => {
      if (restaurantData) {
        try {
          const [itemsResponse, ordersResponse] = await Promise.all([
            axios.get('http://localhost:6001/fetch-items'),
            axios.get('http://localhost:6001/fetch-orders')
          ]);

          const items = itemsResponse.data.filter(item => item.restaurantId === restaurantData._id);
          const orders = ordersResponse.data.filter(item => item.restaurantId === restaurantData._id);

          setItemsCount(items.length);
          setOrdersCount(orders.length);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch items or orders');
          setLoading(false);
        }
      }
    };

    fetchCounts();
  }, [restaurantData]);

  // Render loading or error state
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Render the main UI
  return (
    <div className="restaurantHome-page">
      {restaurant && restaurant.approval === 'pending' ? (
        <div className="restaurant-approval-required">
          <h3>Approval required!!</h3>
          <p>You need to get approval from the admin to make this work. Please be patient!</p>
        </div>
      ) : (
        <div className="restaurant-home-cards">
          <div className="admin-home-card">
            <h5>All Items</h5>
            <p>{ItemsCount}</p>
            <button onClick={() => navigate('/restaurant-menu')}>View all</button>
          </div>

          <div className="admin-home-card">
            <h5>All Orders</h5>
            <p>{ordersCount}</p>
            <button onClick={() => navigate('/restaurant-orders')}>View all</button>
          </div>

          <div className="admin-home-card">
            <h5>Add Item</h5>
            <p>(new)</p>
            <button onClick={() => navigate('/new-product')}>Add now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantHome;
