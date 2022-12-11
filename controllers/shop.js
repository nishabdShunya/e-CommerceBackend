const Product = require('../models/product');
const CartItem = require('../models/cart-item');

/* My Controllers for the E-Commerce Website */
const PRODUCTS_PER_PAGE = 3;

exports.getProducts = async (req, res, next) => {
  let page = +req.query.page || 1;
  if (!page) {
    res.status(400).json({ success: false, message: 'Error: Invalid Request' })
  }
  try {
    const totalProducts = await Product.count();
    const pageProducts = await Product.findAll({
      offset: (page - 1) * PRODUCTS_PER_PAGE,
      limit: 3
    })
    res.status(200).json({
      success: true,
      pageProducts: pageProducts,
      paginationInfo: {
        currentPage: page,
        hasNextPage: page * PRODUCTS_PER_PAGE < totalProducts,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database operation failed, please try again.' });
  }
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  if (!prodId) {
    res.status(400).json({ success: false, message: 'Error: Invalid Request' });
  }
  let newQuantity = 1;
  try {
    const cart = await req.user.getCart()
    const products = await cart.getProducts({ where: { id: prodId } })
    let product;
    if (products.length > 0) {
      product = products[0];
    }
    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      product = product;
    }
    else {
      product = await Product.findOne({ where: { id: prodId } })
    }
    cart.addProduct(product, {
      through: { quantity: newQuantity }
    });
    res.status(201).json({ success: true, message: `Your Product "${req.body.productTitle}" successfully added to the cart.` })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database operation failed, please try again.' });
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await req.user.getCart()
    const products = await cart.getProducts();
    res.status(200).json({ success: true, products: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database operation failed, please try again.' });
  }
};

exports.deleteProductFromCart = async (req, res, next) => {
  const productId = req.params.productId;
  if (!productId) {
    res.status(400).json({ success: false, message: 'Error: Invalid Request' });
  }
  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts({ where: { id: productId } });
    const productToBeDeleted = products[0];
    productToBeDeleted.cartItem.destroy();
    res.json({ success: true, message: `${productToBeDeleted.title} successfully deleted from the cart.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database operation failed, please try again.' });
  }
}

exports.patchQuantity = async (req, res, next) => {
  const productId = +req.params.productId;
  const quantity = +req.body.quantity;
  if (!productId || !quantity) {
    res.status(400).json({ success: false, message: 'Error: Invalid Request' });
  }
  try {
    const result = await CartItem.update(
      { quantity: quantity },
      { where: { productId: productId } }
    )
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database operation failed, please try again.' });
  }
}

exports.postOrder = async (req, res, next) => {
  try {
    const cart = await req.user.getCart()
    const products = await cart.getProducts();
    const order = await req.user.createOrder()
    const orderId = order.id;
    order.addProducts(products.map(product => {
      product.orderItem = { quantity: product.cartItem.quantity };
      return product;
    }))
    cart.setProducts(null);
    res.status(201).json({ success: true, message: `Order successfully placed with order id = ${orderId}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database operation failed, please try again.' });
  }
}

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders({ include: ['products'] })
    res.status(200).json({ success: true, orders: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database operation failed, please try again.' });
  }
};




/* Udemy Trainer's Code */
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findAll({
    where: {
      id: prodId
    }
  })
    .then(result => {
      res.render('shop/product-detail', {
        product: result[0],
        pageTitle: result[0].title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};