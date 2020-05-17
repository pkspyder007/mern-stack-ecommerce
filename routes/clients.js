const router = require('express').Router();
const bcrypt = require('bcryptjs')
const Client = require('../models/clients')
const salt = bcrypt.genSaltSync(10);


router.post("/add", async (req, res) => {
  bcrypt.hash(req.body.password, salt, (err, hash) => {
    if (err) throw err;

    const newUser = {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.number,
      email: req.body.email,
      address: req.body.address,
      phone: req.body.phone,
      password: hash
    }

    Client.find({ $or: [{ email: req.body.email }, { phone: req.body.phone }] })
      .then(existingUser => {
        if (existingUser[0]) {
          res.json({ success: false, err: "Email or phone alredy exists." })
        } else {
          Client.create(newUser)
            .then(createdUser => {
              res.json({
                success: true, user: {
                  _id: createdUser._id
                }
              })
            })
            .catch(err => {
              console.log(err)
              res.json({ success: false })
            })
        }
      }).catch(err => {
        console.log(err)
        res.json({ success: false })
      })

  });

});


router.post("/getById", (req, res) => {
  Client.findById(req.body.id)
    .then(client => {
      res.json({ success: true, client })
    })
    .catch(err => {
      console.log(err);
      res.json({ success: false, err })
    })
});


module.exports = router;