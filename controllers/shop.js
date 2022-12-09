const Product = require('../models/product');
const Cart = require('../models/cart');
const CartItem = require('../models/cart-item');

const PRODUCTS_PER_PAGE = 3;

const CART_PRODUCTS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  let page = +req.query.page || 1;
  let totalProducts;
  Product.count()
    .then(result => {
      totalProducts = result;
      return Product.findAll({
        offset: (page - 1) * PRODUCTS_PER_PAGE,
        limit: 3
      })
    })
    .then(result => {
      res.json({
        pageProducts: result,
        paginationInfo: {
          currentPage: page,
          hasNextPage: page * PRODUCTS_PER_PAGE < totalProducts,
          nextPage: page + 1,
          hasPreviousPage: page > 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
        }
      })
    })
    .catch(err => console.log(err));
};

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

exports.getCart = async (req, res, next) => {
  req.user.getCart()
    .then(cart => {
      return cart.getProducts();
    })
    .then(products => {
      res.json(products);
    })
    .catch(err => console.log(err));

  /* PAGINATION LOGIC NOT WORKING
  const cartPage = +req.query.cartPage || 1;
  let cartPageProducts = [];
  const products = await CartItem.findAll({
    where: { cartId: 1 },
    offset: (cartPage - 1) * CART_PRODUCTS_PER_PAGE,
    limit: 2
  })
  for (let product of products) {
    const result = await Product.findOne({ where: { id: product.productId } })
    console.log(result);
    // const obj = { id: result.dataValues.id, quantity: product.quantity }
    console.log('>>>>>>>>>' + obj);
    // result.quantity = product.quantity;
    cartPageProducts.push(result);
  }
  return cartPageProducts; */
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findOne({ where: { id: prodId } })
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(res.json({ message: `Your Product "${req.body.productTitle}" successfully added to the cart.` }))
    .catch(err => { console.log(err); })
};

exports.deleteProductFromCart = (req, res, next) => {
  const productId = req.params.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then(products => {
      const productToBeDeleted = products[0];
      productToBeDeleted.cartItem.destroy();
      res.json({ message: `${productToBeDeleted.title} successfully deleted from the cart.` });
    })
    .catch(err => console.log(err));
}

exports.patchQuantity = (req, res, next) => {
  const productId = +req.params.productId;
  const quantity = +req.body.quantity;
  CartItem.update(
    { quantity: quantity },
    { where: { productId: productId } }
  )
    .then(result => {
      res.json(result);
    })
    .catch(err => console.log(err))
}

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

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  let orderId;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user.createOrder()
        .then(order => {
          orderId = order.id;
          order.addProducts(products.map(product => {
            product.orderItem = { quantity: product.cartItem.quantity };
            return product;
          }))
        })
        .catch(err => console.log(err));
    })
    .then(result => {
      fetchedCart.setProducts(null);
      res.json({ success: true, message: `Order successfully placed with order id = ${orderId}` });
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({ include: ['products'] })
    .then(orders => {
      res.json(orders);
    })
    .catch(err => console.log(err));
};
