const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const SendOtp = require("sendotp");
const jwt = require("jsonwebtoken");
const sendOtp = new SendOtp(process.env.MSG91_AUTH);
const Client = require("../models/clients");
const Shop = require("../models/shops");
const ResetToken = require("../models/resetToken");
const salt = bcrypt.genSaltSync(10);
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post("/login", (req, res) => {
  if (req.body.type === "client") {
    Client.find({
      $or: [
        { email: req.body.email },
        { phone: parseInt(req.body.email) ? parseInt(req.body.email) : 0 },
      ],
    })
      .then((users) => {
        const compare = bcrypt.compareSync(
          req.body.password,
          users[0].password
        );
        const user = users[0];
        user.password = "";
        if (compare) {
          const token = jwt.sign(
            { id: users[0]._id, email: users[0].email, type: user.type },
            process.env.JWT_SECRET
          );
          res.json({ success: true, token, userID: users[0]._id, user });
        } else res.send({ loggedIn: false, token: null });
      })
      .catch((err) => {
        console.log(err);
        res.send({ loggedIn: false, err });
      });
  } else if (req.body.type === "shop") {
    Shop.find({ email: req.body.email })
      .then((users) => {
        const compare = bcrypt.compareSync(
          req.body.password,
          users[0].password
        );

        if (compare) {
          console.log(compare);
          const token = jwt.sign(
            {
              id: users[0]._id,
              email: users[0].email,
              type: "shop",
              user: users[0],
            },
            process.env.JWT_SECRET
          );
          res.json({ loggedIn: true, token, user: users[0] });
        } else res.send({ loggedIn: false });
      })
      .catch((err) => {
        console.log(err);
        res.send({ loggedIn: false, err });
      });
  }
});

// forgot password
router.post("/forgotPassword", (req, res) => {
  // remove this line in production
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  Client.find({ email: req.body.email })
    .then((clients) => {
      if (clients.length < 1) {
        return res.json({
          success: false,
          err: "Email not found. Please check email address.",
        });
      } else {
        let client = clients[0];
        let token = crypto.randomBytes(64).toString("hex");
        ResetToken.create({
          token: token,
          clientID: client._id,
        })
          .then((newResetToken) => {
            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
              },
            });
            const mailOptions = {
              from: process.env.EMAIL, // sender address
              to: client.email, // list of receivers
              subject: "Reset your LIQRCART account password", // Subject line
              html:
                "<p>Paste this token code in the reset section.</p><h3>" +
                newResetToken.token +
                "</h3>", // plain text body
            };
            transporter.sendMail(mailOptions, function (err, info) {
              // handle error in future
              if (err) {
                console.log(err);
                return res.json({
                  success: false,
                  err: "Server Error. Cannot send verification email",
                });
              } else {
                console.log(info);
                return res.json({
                  success: true,
                  token: newResetToken.token,
                  tokenID: newResetToken._id,
                });
              }
            });
          })
          .catch((err) => {
            console.log(err);
            return res.json({ success: false, err: "Server Error." });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.json({ success: false, err: "Server Error." });
    });
});

// reset password
router.post("/resetPassword", (req, res) => {
  ResetToken.find({ token: req.body.token })
    .then((tokens) => {
      if (tokens.length < 1) {
        return res.json({ success: false, err: "Invalid Token 1" });
      } else {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;
          if (tokens[0].token === req.body.token) {
            Client.findByIdAndUpdate(tokens[0].clientID, { password: hash })
              .then((client) => {
                ResetToken.findOneAndDelete({
                  token: req.body.token,
                }).catch((err) => console.log(err));
                return res.json({
                  success: true,
                  err: "Password resetted successfully.",
                });
              })
              .catch((err) => {
                console.log(err);
                return res.json({ success: false, err: "Server Error." });
              });
          } else {
            return res.json({ success: false, err: "Invalid Token." });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.json({ success: false, err: "Server Error." });
    });
});

router.post("/verify", (req, res) => {
  let token = req.body.token;
  // Check for token
  if (!token)
    return res.json({ status: false, msg: "No token, authorizaton denied" });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user from payload
    req.user = decoded;
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

router.post("/verifyShop", (req, res) => {
  let token = req.body.token;
  // Check for token
  if (!token)
    return res.json({ status: false, msg: "No token, authorizaton denied" });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user from
    req.user = decoded;
    if (decoded.type === "shop") res.json({ success: true });
    else res.json({ success: false });
  } catch (e) {
    res.json({ success: false });
  }
});

router.post("/verifyAdmin", (req, res) => {
  let token = req.body.token;
  // Check for token
  if (!token)
    return res.json({ status: false, msg: "No token, authorizaton denied" });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Add user from
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user from
    req.user = decoded;
    if (decoded.type === "admin") res.json({ success: true });
    else res.json({ success: false });
  } catch (e) {
    res.json({ success: false });
  }
});

// router.post("/verify", (req, res) => {
//   sendOtp.verify(`91${req.body.phone}`, req.body.otp, function (error, data) {
//     if (data.type == 'success') {
//       if (req.body.type === 'client') {
//         Client.find({ phone: req.body.phone })
//           .then(user => {
//             Client.findByIdAndUpdate(user._id, { validated: true })
//               .then(updatedUser => {
//                 res.json({ success: true })
//               }).catch(err => {
//                 console.log(err)
//                 res.json({ success: false })
//               })
//           }).catch(err => console.log(err))
//       } else if (req.body.type === 'shop') {
//         Shop.find({ phone: req.body.phone })
//           .then(user => {
//             Shop.findByIdAndUpdate(user._id, { validated: true })
//               .then(updatedUser => {
//                 res.json({ success: true })
//               }).catch(err => {
//                 console.log(err)
//                 res.json({ success: false })
//               })
//           }).catch(err => console.log(err))
//       }
//     }
//     if (data.type == 'error') {
//       if (data.message = 'already_verified') {
//         res.json({ success: true })
//       } else {
//         res.json({ success: false, err: 'OTP verification failed' })
//       }
//     }
//   });
// });

router.post("/sendotp", (req, res) => {
  sendOtp.send(req.body.phone, "LiQRCT", (err, data) => {
    if (err) {
      res.json({ success: false, message: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

router.post("/resendotp", (req, res) => {
  sendOtp.retry(req.body.phone, false, (err, data) => {
    if (err) {
      res.json({ success: false, message: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

router.post("/verifyotp", (req, res) => {
  sendOtp.verify(req.body.phone, req.body.otp, (err, data) => {
    if (err) {
      res.json({ success: false, message: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;
