const router = require("express").Router();
// var Insta = require("instamojo-nodejs");
const Payment = require("../models/payment");
const Delivery = require("../models/delivery");
const Client = require("../models/clients");
const Product = require("../models/products");
const Shop = require("../models/shops");
const msg91 = require("msg91")(process.env.MSG91_AUTH, "LIQRCT", "4");
// Insta.isSandboxMode(true);
// Insta.setKeys(process.env.INSTA_KEY, process.env.INSTA_TOKEN);

let admins = "6398934992";
// let admins = "9634049244";

// router.post("/checkout", (req, res) => {
//   let data = new Insta.PaymentData();
//   data.setRedirectUrl("https://liqrcart.com/payment/redirect");
//   Client.findById(req.body.cart.userID)
//     .then((user) => {
//       data.purpose = "LiqrCart Checkout";
//       data.amount = req.body.amount;
//       data.phone = user.phone;
//       data.buyer_name = user.name;
//       data.email = user.email;

//       Insta.createPayment(data, (err, response) => {
//         let result = JSON.parse(response);
//         console.log(result);

//         if (err) {
//           console.log(err);
//           res.json({ success: false });
//         } else {
//           let del = {
//             from: req.body.cart.from,
//             to: req.body.cart.to,
//             products: req.body.cart.products,
//             clientID: req.body.cart.userID,
//             shopID: req.body.cart.shopID,
//             payment: result.payment_request,
//             payment_request_id: result.payment_request.id,
//           };
//           Delivery.create(del)
//             .then((doc) =>
//               res.json({ success: true, response: JSON.parse(response) })
//             )
//             .catch((err) => {
//               console.log(err);
//               res.json({ success: false });
//             });
//         }
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//  COD IMplementation
router.post("/checkout", (req, res) => {
  Delivery.find({
    $and: [{ clientID: req.body.cart.userID }, { paymentStatus: "pending" }],
  })
    .then((orders) => {
      if (orders.length < 1) {
        Client.findById(req.body.cart.userID)
          .then((user) => {
            let del = {
              from: req.body.cart.from,
              to: req.body.cart.to,
              products: req.body.cart.products,
              clientID: req.body.cart.userID,
              shopID: req.body.cart.shopID,
              paymentStatus: "pending",
              amount: req.body.amount,
            };
            Delivery.create(del)
              .then((doc) => {
                msg91.send(admins, "New Order, Check the dashboard.", function (
                  err,
                  response
                ) {
                  console.log(err);
                  console.log(response);
                });

                // Update stock 
              //commented to stop stock going out of stocl
//                 const { products } = req.body.cart;
//                 products.map((p) => {
//                   Product.findById(p._id, (err, doc) => {
//                     if (err) console.log(err);
//                     else {
//                       console.log(p.no);
//                       if (p.size == "q") {
//                         doc.quantity.q -= p.no;
//                       }
//                       if (p.size == "h") {
//                         doc.quantity.h -= p.no;
//                       }
//                       if (p.size == "f") {
//                         doc.quantity.f -= p.no;
//                       }
//                       Product.findByIdAndUpdate(doc.id, doc).catch(err);
//                     }
//                   });
//                 });

                res.json({ success: true, orderID: doc._id });
              })
              .catch((err) => {
                console.log(err);

                return res.json({ success: false, err: "Server Error" });
              });
          })
          .catch((err) => {
            console.log(err);
            return res.json({ success: false, err: "Server Error" });
          });
      } else {
        return res.json({
          success: false,
          err:
            "You already have an order undelivered. Please wait till it get delivered.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.json({ success: false });
    });
});

router.post("/confirm", (req, res) => {
  Delivery.findByIdAndUpdate(req.body.orderID, { paymentStatus: "credit" })
    .then((del) => {
      res.json({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, err });
    });
});

router.get("/redirect", (req, res) => {
  if (req.query.payment_id !== "" && req.query.payment_status == "Credit") {
    Delivery.find({ payment_request_id: req.query.payment_request_id })
      .then((del) => {
        let newDel = {
          ...del,
          paymentStatus: "Credit",
          payment_id: req.query.payment_id,
        };
        Delivery.findOneAndUpdate(
          { payment_request_id: req.query.payment_request_id },
          { payment_id: req.query.payment_id, paymentStatus: "Credit" }
        )
          .then((newDelev) => {
            msg91.send(admins, "New Order, Check the dashboard.", function (
              err,
              response
            ) {
              console.log(err);
              console.log(response);
            });

            msg91.send(
              newDelev.payment.phone,
              "Your order has been placed. For any enquiry contact our customer care servive."
            );

            Shop.findById(newDelev.shopID)
              .then((shop) => {
                msg91.send(
                  shop.phone,
                  "New order, Please refresh the dashboard.",
                  function (err, response) {
                    console.log(err);
                    console.log(response);
                  }
                );
              })
              .catch((err) => console.log(err));
            // res.redirect(`http://localhost:3000/confirm#${newDelev._id}`);
            res.redirect(`/confirm#${newDelev._id}`);
          })
          .catch((err) => {
            console.log(err);
            res.json({ success: false });
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false });
      });
  }
});

module.exports = router;
