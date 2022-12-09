const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user.createProduct({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description
  })
    .then(result => {
      // console.log(result);
      res.redirect('/admin/products');
    })
    .catch(err => { console.log(err) });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  };
  const prodId = req.params.productId;
  req.user.getProducts({ where: { id: prodId } })
    .then(products => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: products[0]
      });
    })
    .catch(err => { console.log(err) });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  Product.findOne({ where: { id: prodId } })
    .then(product => {
      product.title = updatedTitle;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save();
    })
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => { console.log(err) });
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  /* METHOD-1
  Product.findAll({ where: { id: prodId } })
    .then(result => {
      result[0].destroy();
      res.redirect('/admin/products')
    })
    .catch(err => console.log(err));
  */
  // METHOD-2
  Product.destroy({ where: { id: prodId } })
    .then(res.redirect('/admin/products'))
    .catch(err => { console.log(err) });
};