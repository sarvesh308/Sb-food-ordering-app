import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../../styles/Cart.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GeneralContext } from '../../context/GeneralContext';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const { fetchCartCount } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Memoizing fetchCart using useCallback
  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-cart');
      setCart(response.data.filter(item => item.userId === userId));
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [userId]);

  // Memoizing calculateTotalPrice using useCallback
  const calculateTotalPrice = useCallback(() => {
    const price = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const discount = cart.reduce((sum, product) => sum + ((product.price * product.discount) / 100) * product.quantity, 0);
    setTotalPrice(price);
    setTotalDiscount(Math.floor(discount));
    setDeliveryCharges(price > 1000 || cart.length === 0 ? 0 : 50);
  }, [cart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Fetch cart only when fetchCart changes (dependency: fetchCart)

  useEffect(() => {
    if (cart.length > 0) {
      calculateTotalPrice();
    }
  }, [cart, calculateTotalPrice]); // Recalculate total price when cart or calculateTotalPrice changes

  const removeItem = async (id) => {
    try {
      await axios.put('http://localhost:6001/remove-item', { id });
      fetchCart(); // Re-fetch the cart after item removal
      fetchCartCount(); // Update the cart count in the global context
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const placeOrder = async () => {
    if (cart.length > 0) {
      try {
        await axios.post('http://localhost:6001/place-cart-order', {
          userId,
          name,
          mobile,
          email,
          address,
          pincode,
          paymentMethod,
          orderDate: new Date(),
        });
        alert('Order placed!!');
        resetForm();
        navigate('/profile');
      } catch (error) {
        console.error('Error placing order:', error);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setPincode('');
    setPaymentMethod('');
  };

  return (
    <div className="cartPage">
      <div className="cartContents">
        {cart.length === 0 ? <p>No items in the cart..</p> : null}

        {cart.map((item) => (
          <div className="cartItem" key={item._id}>
            <img src={item.foodItemImg} alt={item.foodItemName} />
            <div className="cartItem-data">
              <h4>{item.foodItemName}</h4>
              <p>{item.restaurantName}</p>
              <div className="cartItem-inputs">
                <div className="cartItem-input">
                  <button className="btn">Quantity: </button>
                  <input
                    type="number"
                    className="form-control quantity-field"
                    value={item.quantity}
                    min="1"
                    disabled
                  />
                </div>
                <h6>
                  Price: &#8377; {parseInt(item.price - (item.price * item.discount) / 100)}{' '}
                  <s> &#8377;{item.price}</s>
                </h6>
              </div>
              <button
                className="btn btn-outline-danger"
                onClick={() => removeItem(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cartPriceBody">
        <h4>Price Details</h4>
        <span>
          <b>Total MRP: </b> <p>&#8377; {totalPrice}</p>
        </span>
        <span>
          <b>Discount on MRP: </b> <p style={{ color: 'rgb(7, 156, 106)' }}> - &#8377; {totalDiscount}</p>
        </span>
        <span>
          <b>Delivery Charges: </b> <p style={{ color: 'red' }}> + &#8377; {deliveryCharges}</p>
        </span>
        <hr />
        <h5>
          <b>Final Price: </b> &#8377; {totalPrice - totalDiscount + deliveryCharges}
        </h5>
        <button data-bs-toggle="modal" data-bs-target="#staticBackdrop">
          Place order
        </button>
      </div>

      {/* Modal for Checkout */}
      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="staticBackdropLabel">
                Checkout
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Form inputs for Checkout */}
              <div className="checkout-address">
                <h4>Checkout details</h4>

                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingInput1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <label htmlFor="floatingInput1">Name</label>
                </div>

                <section>
                  <div className="form-floating mb-3 span-child-2">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInput2"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                    <label htmlFor="floatingInput2">Mobile</label>
                  </div>

                  <div className="form-floating mb-3 span-child-1">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInput3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="floatingInput3">Email</label>
                  </div>
                </section>

                <section>
                  <div className="form-floating mb-3 span-child-1">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInput6"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <label htmlFor="floatingInput6">Address</label>
                  </div>

                  <div className="form-floating mb-3 span-child-2">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInput7"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                    <label htmlFor="floatingInput7">Pincode</label>
                  </div>
                </section>
              </div>

              <div className="checkout-payment-method">
                <h4>Payment method</h4>
                <div className="form-floating mb-3">
                  <select
                    className="form-select form-select-md mb-3"
                    id="floatingInput8"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">Choose payment method</option>
                    <option value="netbanking">Netbanking</option>
                    <option value="card">Card Payments</option>
                    <option value="upi">UPI</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                  <label htmlFor="floatingInput8">Choose Payment method</label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={placeOrder}
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
