const express = require("express");
const router = express.Router();
const Category = require('../models/category')

router.post("/add", (req, res) => {
  Category.create({ name: req.body.name })
    .then((category) => {
      res.json({ success: true, category })
    }).catch(err => {
      console.log(err);
      res.json({ success: false, err })
    })
});

router.get("/allCategories", (req, res) => {
  Category.find({}).then(cats => {
    res.json({ success: true, categories: cats })

  }).catch(err => {
    console.log(err);
    res.json({ success: false, err })
  })
});

router.post("/delete", (req, res) => {
  Category.findByIdAndDelete(req.body.catID).then((cats) => {
    res.json({ success: true, categories: cats })
  }).catch(err => {
    console.log(err);
    res.json({ success: false })
  })
});




module.exports = router;