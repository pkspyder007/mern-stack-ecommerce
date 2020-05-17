const router = require("express").Router();
const Shop = require("../models/shops");
const Product = require("../models/products");
const Category = require("../models/category");
const Brand = require("../models/brand");
const authMiddleware = require("../helpers/auth");

router.post("/add", async (req, res) => {
  if (req.body.type === "shop") {
    const brand = await Brand.find({ name: req.body.brand });
    const newProduct = {
      name: req.body.name,
      shopID: req.body.user._id,
      brand: req.body.brand,
      image: brand[0].image,
      quantity: req.body.quantity,
      category: req.body.category,
      price: req.body.price,
    };
    Product.create(newProduct)
      .then((product) => {
        Shop.findById(req.body.user._id)
          .then((shop) => {
            let newStock = [...shop.stock, product._id];
            Shop.findByIdAndUpdate(shop._id, { stock: newStock })
              .then((stock) => {
                res.json({ success: true });
              })
              .catch((err) => {
                console.log(err);
                res.json({ success: false, err });
              });
          })
          .catch((err) => {
            console.log(err);
            res.json({ success: false, err });
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false, err });
      });
  } else {
    res.json({
      success: false,
      err: "You do not have the access to add new product!.",
    });
  }
});

router.post("/delete", (req, res) => {
  if (req.body.type === "shop") {
    Product.findByIdAndRemove(req.body.id)
      .then((product) => {
        if (product) {
          res.json({ success: true });
        } else {
          res.json({
            success: false,
            err: "Could not find the specified product.",
          });
        }
      })
      .catch((err) => {
        res.json({ success: false, err });
      });
  } else {
    res.json({
      success: false,
      err: "You dont have the permission to delete the product.",
    });
  }
});

router.get("/products", (req, res) => {
  Product.find({})
    .then((products) => {
      res.json({
        success: true,
        products,
      });
    })
    .catch((err) => {
      res.json({ success: false, err });
    });
});

router.get("/brand/:name", (req, res) => {
  Product.find({ brand: req.params.name })
    .then((products) => {
      res.json({
        success: true,
        products,
      });
    })
    .catch((err) => {
      res.json({ success: false, err });
    });
});

router.get("/productsByShop", (req, res) => {
  Product.find({ shopID: req.query.shopID })
    .then((products) => {
      res.json({
        success: true,
        products,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        err,
      });
    });
});

router.get("/productsByID/:id", (req, res) => {
  Product.findById(req.params.id)
    .then((product) => {
      res.json({
        success: true,
        product,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        err,
      });
    });
});

router.post("/productsByCategory", (req, res) => {
  Category.findById(req.body.category)
    .then((cat) => {
      Product.find({ category: cat.name })
        .then((products) => {
          res.json({
            success: true,
            products,
          });
        })
        .catch((err) => {
          console.log(err);
          res.json({
            success: false,
            err,
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        err,
      });
    });
});

router.post("/update", (req, res) => {
  if (req.user.type === "shop") {
    Product.findById(req.body.id).then((product) => {
      let newCount =
        req.body.type === "add"
          ? product.quantity + req.body.count
          : product.quantity - req.body.count;
      Product.findByIdAndUpdate(product._id, { quantity: newCount })
        .then((updatedProduct) => {
          res.json({ success: true });
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: true, err });
        });
    });
  } else {
    res.json({
      success: false,
      err: "You dont have the permission to delete the product.",
    });
  }
});

module.exports = router;
