import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/NewProducts.css';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = localStorage.getItem('userId');

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productMainImg, setProductMainImg] = useState('');
  const [productMenuCategory, setProductMenuCategory] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productNewCategory, setProductNewCategory] = useState('');
  const [productPrice, setProductPrice] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);
  const [AvailableCategories, setAvailableCategories] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the fetchCategories function
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-categories');
      setAvailableCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  }, []);

  // Memoize the fetchRestaurant function
  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:6001/fetch-restaurant-details/${userId}`);
      setRestaurant(response.data);
    } catch (err) {
      setError('Failed to fetch restaurant details');
    }
  }, [userId]);

  // Memoize the fetchItem function
  const fetchItem = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:6001/fetch-item-details/${id}`);
      const data = response.data;
      setProductName(data.title);
      setProductDescription(data.description);
      setProductMainImg(data.itemImg);
      setProductCategory(data.category);
      setProductMenuCategory(data.menuCategory);
      setProductPrice(data.price);
      setProductDiscount(data.discount);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch product details');
      setLoading(false);
    }
  }, [id]);

  // Add useEffect with memoized dependencies
  useEffect(() => {
    fetchCategories();
    fetchRestaurant();
    fetchItem();
  }, [fetchCategories, fetchRestaurant, fetchItem]);

  const handleUpdateItem = async () => {
    if (!productName || !productDescription || !productPrice || !productCategory || !productMenuCategory) {
      alert('Please fill in all the required fields');
      return;
    }

    try {
      await axios.put(`http://localhost:6001/update-product/${id}`, {
        restaurantId: restaurant._id,
        productName,
        productDescription,
        productMainImg,
        productCategory,
        productMenuCategory,
        productNewCategory,
        productPrice,
        productDiscount,
      });
      alert('Product updated successfully');
      navigate('/restaurant-menu');
    } catch (err) {
      alert('Failed to update product');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="new-product-page">
      <div className="new-product-container">
        <h3>Update Item</h3>

        <div className="new-product-body">
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="floatingNewProduct1"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <label htmlFor="floatingNewProduct1">Product name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="floatingNewProduct2"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
            <label htmlFor="floatingNewProduct2">Product Description</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="floatingNewProduct1"
              value={productMainImg}
              onChange={(e) => setProductMainImg(e.target.value)}
            />
            <label htmlFor="floatingNewProduct1">Thumbnail Img URL</label>
          </div>

          <section>
            <h4>Type</h4>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="productCategory"
                value="Veg"
                id="flexRadioDefault1"
                checked={productCategory === 'Veg'}
                onChange={(e) => setProductCategory(e.target.value)}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault1">
                Veg
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="productCategory"
                value="Non Veg"
                id="flexRadioDefault2"
                checked={productCategory === 'Non Veg'}
                onChange={(e) => setProductCategory(e.target.value)}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                Non Veg
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="productCategory"
                value="Beverages"
                id="flexRadioDefault3"
                checked={productCategory === 'Beverages'}
                onChange={(e) => setProductCategory(e.target.value)}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault3">
                Beverages
              </label>
            </div>
          </section>

          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="floatingNewProduct5"
              value={productMenuCategory}
              onChange={(e) => setProductMenuCategory(e.target.value)}
            >
              <option value="">Choose Product Category</option>
              {AvailableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new category">New category</option>
            </select>
            <label htmlFor="floatingNewProduct5">Category</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="number"
              className="form-control"
              id="floatingNewProduct6"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
            <label htmlFor="floatingNewProduct6">Price</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="number"
              className="form-control"
              id="floatingNewProduct7"
              value={productDiscount}
              onChange={(e) => setProductDiscount(e.target.value)}
            />
            <label htmlFor="floatingNewProduct7">Discount (%)</label>
          </div>

          {productMenuCategory === 'new category' && (
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="floatingNewProduct8"
                value={productNewCategory}
                onChange={(e) => setProductNewCategory(e.target.value)}
              />
              <label htmlFor="floatingNewProduct8">New Category</label>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={handleUpdateItem}>
          Update
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
