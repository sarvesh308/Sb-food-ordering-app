import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantMenu = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [availableCategories, setAvailableCategories] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);

  const [sortFilter, setSortFilter] = useState('popularity');
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-categories');
      setAvailableCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch Restaurant Details
  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:6001/fetch-restaurant-details/${userId}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
  }, [userId]);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-items');
      setItems(response.data);
      setVisibleItems(response.data);  // Initialize visibleItems with all items
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, []);

  // Run data fetching when the component mounts
  useEffect(() => {
    fetchRestaurant();
    fetchCategories();
    fetchItems();
  }, [fetchRestaurant, fetchCategories, fetchItems]);

  // Handle sorting logic
  const handleSortFilterChange = (e) => {
    const value = e.target.value;
    setSortFilter(value);

    let sortedItems = [...visibleItems];  // Create a new array to avoid mutating state directly

    switch (value) {
      case 'low-price':
        sortedItems.sort((a, b) => a.price - b.price);
        break;
      case 'high-price':
        sortedItems.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        sortedItems.sort((a, b) => b.discount - a.discount);
        break;
      case 'rating':
        sortedItems.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setVisibleItems(sortedItems);
  };

  // Handle category and type filtering logic
  useEffect(() => {
    let filteredItems = items;

    if (categoryFilter.length > 0) {
      filteredItems = filteredItems.filter(item => categoryFilter.includes(item.menuCategory));
    }

    if (typeFilter.length > 0) {
      filteredItems = filteredItems.filter(item => typeFilter.includes(item.category));
    }

    setVisibleItems(filteredItems);
  }, [categoryFilter, typeFilter, items]);

  // Handle checkbox changes for category
  const handleCategoryCheckBox = (e) => {
    const value = e.target.value;
    setCategoryFilter((prev) => (
      e.target.checked ? [...prev, value] : prev.filter((category) => category !== value)
    ));
  };

  // Handle checkbox changes for type
  const handleTypeCheckBox = (e) => {
    const value = e.target.value;
    setTypeFilter((prev) => (
      e.target.checked ? [...prev, value] : prev.filter((type) => type !== value)
    ));
  };

  return (
    <div className="AllRestaurantsPage" style={{ marginTop: '14vh' }}>
      <div className="restaurants-container">
        <div className="restaurants-filter">
          <h4>Filters</h4>
          <div className="restaurant-filters-body">
            <div className="filter-sort">
              <h6>Sort By</h6>
              <div className="filter-sort-body sub-filter-body">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sortFilter"
                    value="popularity"
                    checked={sortFilter === 'popularity'}
                    onChange={handleSortFilterChange}
                  />
                  <label className="form-check-label">Popularity</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sortFilter"
                    value="low-price"
                    onChange={handleSortFilterChange}
                  />
                  <label className="form-check-label">Low Price</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sortFilter"
                    value="high-price"
                    onChange={handleSortFilterChange}
                  />
                  <label className="form-check-label">High Price</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sortFilter"
                    value="discount"
                    onChange={handleSortFilterChange}
                  />
                  <label className="form-check-label">Discount</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sortFilter"
                    value="rating"
                    onChange={handleSortFilterChange}
                  />
                  <label className="form-check-label">Rating</label>
                </div>
              </div>
            </div>

            <div className="filter-categories">
              <h6>Food Type</h6>
              <div className="filter-categories-body sub-filter-body">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value="Veg"
                    checked={typeFilter.includes('Veg')}
                    onChange={handleTypeCheckBox}
                  />
                  <label className="form-check-label">Veg</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value="Non Veg"
                    checked={typeFilter.includes('Non Veg')}
                    onChange={handleTypeCheckBox}
                  />
                  <label className="form-check-label">Non Veg</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value="Beverages"
                    checked={typeFilter.includes('Beverages')}
                    onChange={handleTypeCheckBox}
                  />
                  <label className="form-check-label">Beverages</label>
                </div>
              </div>
            </div>

            <div className="filter-categories">
              <h6>Categories</h6>
              <div className="filter-categories-body sub-filter-body">
                {availableCategories.map((category) => (
                  <div className="form-check" key={category}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={category}
                      checked={categoryFilter.includes(category)}
                      onChange={handleCategoryCheckBox}
                    />
                    <label className="form-check-label">{category}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="restaurants-body">
          <h3>All Items</h3>
          <div className="restaurants">
            {visibleItems
              .filter(item => restaurant && item.restaurantId === restaurant._id)
              .map((item) => (
                <div className="restaurant-item" key={item._id}>
                  <div className="restaurant">
                    <img src={item.itemImg} alt={item.title} />
                    <div className="restaurant-data">
                      <h6>{item.title}</h6>
                      <p>{item.description.slice(0, 25)}...</p>
                      <h6>&#8377; {item.price}</h6>
                      <button className="btn btn-outline-primary" onClick={() => navigate(`/update-product/${item._id}`)}>
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;
