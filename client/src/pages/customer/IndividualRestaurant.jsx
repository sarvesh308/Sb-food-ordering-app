import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../../styles/IndividualRestaurant.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { GeneralContext } from '../../context/GeneralContext';

const IndividualRestaurant = () => {
  const { fetchCartCount } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState();
  const [items, setItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);  // Used for filtered items
  const [categoryFilter, setCategoryFilter] = useState([]);  // Categories filter state
  const [typeFilter, setTypeFilter] = useState([]);  // Types filter state
  const [quantity, setQuantity] = useState(1);  // Default quantity set to 1
  const [availableCategories, setAvailableCategories] = useState([]);  // Added state for categories

  // Fetch restaurant data
  const fetchRestaurants = useCallback(async () => {
    await axios.get(`http://localhost:6001/fetch-restaurant/${id}`).then(
      (response) => {
        setRestaurant(response.data);
      }
    ).catch((err) => {
      console.log(err);
    });
  }, [id]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    await axios.get('http://localhost:6001/fetch-categories').then(
      (response) => {
        setAvailableCategories(response.data); // Corrected use of setAvailableCategories
      }
    );
  }, []);

  // Fetch items
  const fetchItems = useCallback(async () => {
    await axios.get('http://localhost:6001/fetch-items').then(
      (response) => {
        setItems(response.data);
        setVisibleItems(response.data);  // Set the initial visible items
      }
    );
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchRestaurants();
  }, [fetchCategories, fetchItems, fetchRestaurants]);

  useEffect(() => {
    // Filtering items based on category and type filters
    if (categoryFilter.length > 0 && typeFilter.length > 0) {
      setVisibleItems(items.filter(product => categoryFilter.includes(product.menuCategory) && typeFilter.includes(product.category)));
    } else if (categoryFilter.length === 0 && typeFilter.length > 0) {
      setVisibleItems(items.filter(product => typeFilter.includes(product.category)));
    } else if (categoryFilter.length > 0 && typeFilter.length === 0) {
      setVisibleItems(items.filter(product => categoryFilter.includes(product.menuCategory)));
    } else {
      setVisibleItems(items);
    }
  }, [categoryFilter, typeFilter, items]);

  // Handle adding item to cart
  const handleAddToCart = async (foodItemId, foodItemName, restaurantId, foodItemImg, price, discount) => {
    await axios.post('http://localhost:6001/add-to-cart', { userId, foodItemId, foodItemName, restaurantId, foodItemImg, price, discount, quantity }).then(
      (response) => {
        alert("Product added to cart!");
        setQuantity(1); // Reset quantity after adding
        fetchCartCount();
      }
    ).catch((err) => {
      alert("Operation failed!!");
    });
  };

  // Handle category filter checkbox change
  const handleCategoryCheckBox = (category) => {
    setCategoryFilter(prevFilters =>
      prevFilters.includes(category)
        ? prevFilters.filter(item => item !== category)
        : [...prevFilters, category]
    );
  };

  // Handle type filter checkbox change
  const handleTypeCheckBox = (categoryType) => {
    setTypeFilter(prevFilters =>
      prevFilters.includes(categoryType)
        ? prevFilters.filter(item => item !== categoryType)
        : [...prevFilters, categoryType]
    );
  };

  // Increase quantity
  const increaseQuantity = () => setQuantity(prevQuantity => prevQuantity + 1);

  // Decrease quantity
  const decreaseQuantity = () => setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));

  return (
    <div className="IndividualRestaurant-page">
      {restaurant ? (
        <>
          <h2>{restaurant.title}</h2>
          <p>{restaurant.address}</p>
          <div className="IndividualRestaurant-body">
            {/* Filters Section */}
            <div className="filters">
              <div>
                <h4>Categories</h4>
                {availableCategories.map(category => (
                  <div key={category} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      value={category}
                      onChange={() => handleCategoryCheckBox(category)}  // Using category filter handler
                    />
                    <label className="form-check-label">{category}</label>
                  </div>
                ))}
              </div>
              {/* Type filter UI */}
              <div>
                <h4>Types</h4>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    value="Veg"
                    onChange={() => handleTypeCheckBox('Veg')}  // Using type filter handler
                  />
                  <label className="form-check-label">Veg</label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    value="Non-Veg"
                    onChange={() => handleTypeCheckBox('Non-Veg')}  // Using type filter handler
                  />
                  <label className="form-check-label">Non-Veg</label>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="items">
              {visibleItems.map(item => (
                <div key={item._id} className="item-card">
                  <img src={item.itemImg} alt={item.title} />
                  <h5>{item.title}</h5>
                  <p>{item.description}</p>
                  <p>Price: {item.price} {item.discount > 0 && <span>({item.discount}% off)</span>}</p>
                  <div className="quantity-control">
                    <button onClick={decreaseQuantity}>-</button>
                    <span>{quantity}</span>
                    <button onClick={increaseQuantity}>+</button>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleAddToCart(item._id, item.title, restaurant._id, item.itemImg, item.price, item.discount)}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
};

export default IndividualRestaurant;
