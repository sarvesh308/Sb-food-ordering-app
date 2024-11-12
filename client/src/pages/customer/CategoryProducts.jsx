import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import '../../styles/CategoryProducts.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CategoryProducts = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:6001/fetch-restaurants');
        const filteredRestaurants = response.data.filter(restaurant =>
          restaurant.menu.includes(category)
        );
        setRestaurants(filteredRestaurants);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();  // Call fetchRestaurants function inside useEffect
  }, [category]); // Added 'category' as a dependency to refetch data when category changes

  if (loading) {
    return <div className="loading">Loading restaurants...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="categoryProducts-page">
      <h2>Restaurants Serving {category}</h2>

      <div className="restaurants-container">
        {restaurants.length === 0 ? (
          <p>No restaurants found for {category}</p>
        ) : (
          <div className="restaurants-body">
            <div className="restaurants">
              {restaurants.map((restaurant) => (
                <div className="restaurant-item" key={restaurant._id}>
                  <div
                    className="restaurant"
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  >
                    <img src={restaurant.mainImg} alt={restaurant.title} />
                    <div className="restaurant-data">
                      <h6>{restaurant.title}</h6>
                      <p>{restaurant.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryProducts;
