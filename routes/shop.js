const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

/* My Routes for the E-Commerce Website */
router.get('/products', shopController.getProducts);
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.delete('/cart/:productId', shopController.deleteProductFromCart)
router.patch('/cart/:productId', shopController.patchQuantity)
router.post('/create-order', shopController.postOrder);
router.get('/orders', shopController.getOrders);




/* Udemy Trainer's Code */
router.get('/products/:productId', shopController.getProduct);
router.get('/', shopController.getIndex);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);


/* Exporting the routes */
module.exports = router;