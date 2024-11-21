//IMPORT THE REQUIRED LIBRARIES 

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { Admin, Cart, FoodItem, Orders, Restaurant, User } from './Schema.js';

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = 6001;

mongoose.connect('mongodb+srv://sarveshtraveller:sarvesh123@sbfoods.axox6.mongodb.net/?retryWrites=true&w=majority&appName=Sbfoods', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {

    app.post('/register', async (req, res) => {
        const { username, email, usertype, password, restaurantAddress, restaurantImage } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            if (usertype === 'restaurant') {
                const newUser = new User({
                    username, email, usertype, password: hashedPassword, approval: 'pending'
                });
                const user = await newUser.save();
                console.log(user._id);
                const restaurant = new Restaurant({ ownerId: user._id, title: username, address: restaurantAddress, mainImg: restaurantImage, menu: [] });
                await restaurant.save();

                return res.status(201).json(user);
            } else {
                const newUser = new User({
                    username, email, usertype, password: hashedPassword, approval: 'approved'
                });
                const userCreated = await newUser.save();
                return res.status(201).json(userCreated);
            }
        } catch (error) {
            console.log("Error in /register:", error);
            return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            return res.json(user);
        } catch (error) {
            console.log("Error in /login:", error);
            return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.post('/update-promote-list', async (req, res) => {
        const { promoteList } = req.body;
        try {
            const admin = await Admin.findOne();
            admin.promotedRestaurants = promoteList;
            await admin.save();
            res.json({ message: 'approved' });
        } catch (err) {
            console.log("Error in /update-promote-list:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.post('/approve-user', async (req, res) => {
        const { id } = req.body;
        try {
            const restaurant = await User.findById(id);
            restaurant.approval = 'approved';
            await restaurant.save();
            res.json({ message: 'approved' });
        } catch (err) {
            console.log("Error in /approve-user:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.post('/reject-user', async (req, res) => {
        const { id } = req.body;
        try {
            const restaurant = await User.findById(id);
            restaurant.approval = 'rejected';
            await restaurant.save();
            res.json({ message: 'rejected' });
        } catch (err) {
            console.log("Error in /reject-user:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-user-details/:id', async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            res.json(user);
        } catch (err) {
            console.log("Error in /fetch-user-details:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-users', async (req, res) => {
        try {
            const users = await User.find();
            res.json(users);
        } catch (err) {
            console.log("Error in /fetch-users:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-restaurants', async (req, res) => {
        try {
            const restaurants = await Restaurant.find();
            res.json(restaurants);
        } catch (err) {
            console.log("Error in /fetch-restaurants:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-orders', async (req, res) => {
        try {
            const orders = await Orders.find();
            res.json(orders);
        } catch (err) {
            console.log("Error in /fetch-orders:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-items', async (req, res) => {
        try {
            const items = await FoodItem.find();
            res.json(items);
        } catch (err) {
            console.log("Error in /fetch-items:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-categories', async (req, res) => {
        try {
            const data = await Admin.find();
            if (data.length === 0) {
                const newData = new Admin({ categories: [], promotedRestaurants: [] });
                await newData.save();
                return res.json(newData.categories);
            } else {
                return res.json(data[0].categories);
            }
        } catch (err) {
            console.log("Error in /fetch-categories:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-promoted-list', async (req, res) => {
        try {
            const data = await Admin.find();
            if (data.length === 0) {
                const newData = new Admin({ categories: [], promotedRestaurants: [] });
                await newData.save();
                return res.json(newData.promotedRestaurants);
            } else {
                return res.json(data[0].promotedRestaurants);
            }
        } catch (err) {
            console.log("Error in /fetch-promoted-list:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-restaurant-details/:id', async (req, res) => {
        try {
            const restaurant = await Restaurant.findOne({ ownerId: req.params.id });
            res.json(restaurant);
        } catch (err) {
            console.log("Error in /fetch-restaurant-details:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-restaurant/:id', async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            res.json(restaurant);
        } catch (err) {
            console.log("Error in /fetch-restaurant:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.get('/fetch-item-details/:id', async (req, res) => {
        try {
            const item = await FoodItem.findById(req.params.id);
            res.json(item);
        } catch (err) {
            console.log("Error in /fetch-item-details:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.post('/add-new-product', async (req, res) => {
        const { restaurantId, productName, productDescription, productMainImg, productCategory, productMenuCategory, productNewCategory, productPrice, productDiscount } = req.body;
        try {
            if (productMenuCategory === 'new category') {
                const admin = await Admin.findOne();
                admin.categories.push(productNewCategory);
                await admin.save();

                const newProduct = new FoodItem({ restaurantId, title: productName, description: productDescription, itemImg: productMainImg, category: productCategory, menuCategory: productNewCategory, price: productPrice, discount: productDiscount, rating: 0 });
                await newProduct.save();

                const restaurant = await Restaurant.findById(restaurantId);
                restaurant.menu.push(productNewCategory);
                await restaurant.save();
            } else {
                const newProduct = new FoodItem({ restaurantId, title: productName, description: productDescription, itemImg: productMainImg, category: productCategory, menuCategory: productMenuCategory, price: productPrice, discount: productDiscount, rating: 0 });
                await newProduct.save();
            }
            res.json({ message: 'Product added successfully!' });
        } catch (err) {
            console.log("Error in /add-new-product:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.post('/place-cart-order', async (req, res) => {
        const { userId, cartData } = req.body;
        try {
            const user = await User.findById(userId);
            const newOrder = new Orders({ userId, items: cartData });
            await newOrder.save();

            const cart = await Cart.findOne({ userId });
            await Cart.deleteOne({ userId });

            res.json({ message: 'Order placed successfully' });
        } catch (err) {
            console.log("Error in /place-cart-order:", err);
            res.status(500).json({ message: 'Error occurred' });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

}).catch((err) => {
    console.log("Error in db connection:", err);
});

