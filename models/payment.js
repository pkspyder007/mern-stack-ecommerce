const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  clientID: {
    type: String,
    required: true,
  },
  shopID: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  paymentID: {
    type: String,
    required: true,
  },
});

module.exports = Payment = mongoose.model("payment", PaymentSchema);
