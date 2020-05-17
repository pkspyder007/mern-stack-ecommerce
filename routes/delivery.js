const router = require("express").Router();
const Delivery = require("../models/delivery");
// const Product = require('../models/products');

router.post("/newDilevery", (req, res) => {
  let newDelivery = {
    clientID: req.cart.userID,
    shopID: req.cart.shopID,
    products: req.cart.products,
  };

  Delivery.create(newDelievry)
    .then((doc) => res.json({ success: true }))
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

router.get("/allOrders", (req, res) => {
  Delivery.find({ delivered: false })
    .then((orders) => res.json({ success: true, orders }))
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

router.post("/order/:shopID", (req, res) => {
  Delivery.find({ shopID: req.params.shopID })
    .then((orders) => res.json({ success: true, orders }))
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

router.post("/customer/:id", (req, res) => {
  Delivery.find({ _id: req.params.id })
    .then((order) => res.json({ success: true, order }))
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

router.post("/ship", (req, res) => {
  Delivery.findOneAndUpdate({ _id: req.body.id }, { pickedFromShop: true })
    .then((order) => res.json({ success: true }))
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

router.post("/recieve", (req, res) => {
  Delivery.findOneAndUpdate({ _id: req.body.id }, { delivered: true })
    .then((order) => res.json({ success: true }))
    .catch((err) => {
      console.log(err);
      res.json({ success: false });
    });
});

module.exports = router;
