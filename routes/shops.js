const router = require('express').Router();
const bcrypt = require('bcryptjs')
const Shop = require('../models/shops')
const DeliveryPerson = require('../models/deliveryPerson')
const authMiddleware = require('../helpers/auth')
const salt = bcrypt.genSaltSync(10);

router.post("/add", (req, res) => {

  bcrypt.hash(req.body.password, salt, (err, hash) => {
    if (err) throw err;

    const newShop = {
      name: req.body.name,
      admin: req.body.admin,
      email: req.body.email,
      address: req.body.address,
      phone: req.body.phone,
      password: hash
    }

    Shop.find({ $or: [{ email: req.body.email }, { phone: req.body.phone }] })
      .then(existingShop => {
        if (existingShop[0]) {
          res.json({ success: false, err: "Email or phone alredy exists." })
        } else {
          Shop.create(newShop)
            .then(createdShop => {
              res.json({ success: true })
            })
            .catch(err => {
              console.log(err)
              res.json({ success: false, err })
            })
        }

      })
  });
});

router.post("/addDeliveryPerson", authMiddleware, (req, res) => {
  if (req.user.type === "shop") {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (err) throw err
      const newUser = {
        name: req.body.name,
        vehicleNumber: req.body.vehicleNumber,
        address: req.body.address,
        DLNumber: req.body.DLNumber,
        age: req.body.age,
        phone: req.body.phone,
        photo: 'default.jpg',
        password: hash
      }
      DeliveryPerson.find({ vehicleNumber: req.body.vehicleNumber })
        .then(users => {
          if (users[0]) {
            res.json({
              success: false,
              err: "Vehicle already registered."
            })
          } else {
            DeliveryPerson.create(newUser)
              .then(user => {
                res.json({ success: true })
              }).catch(err => res.json({ success: false, err }))
          }
        })
    })
  } else {
    res.json({ success: false, err: "You do not have rights to create a new dilvery person." })
  }
});

router.get("/allShops", (req, res) => {
  Shop.find({})
    .then(shops => {
      let newShops = shops.map(s => {
        s.password = ''
        return s;
      })
      res.json({ success: false, shops: newShops })
    })
    .catch(err => console.log(err))
});


router.get("/shopById/:id", (req, res) => {
  Shop.findById(req.params.id)
    .then(shop => {

      shop.password = ''

      res.json({ success: false, shop: shop })
    })
    .catch(err => console.log(err))
});




module.exports = router;

