const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeliverySchema = new Schema({
  products: {
    type: Array,
    required: true,
  },
  deliveryPerson: {
    type: Object,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  pickedFromShop: {
    type: Boolean,
    default: false,
  },
  customerReview: {
    type: String,
  },
  shopID: {
    type: String,
    required: true,
  },
  clientID: {
    type: String,
    required: true,
  },
  to: {
    type: String,
  },
  from: {
    type: String,
  },
  shopOTP: {
    type: Number,
    default: 0000,
  },
  clientOTP: {
    type: Number,
    default: 0000,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  payment: {
    type: Object,
    default: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_id: {
    type: String,
    default: "",
  },
  payment_request_id: {
    type: String,
    default: "",
  },
  paymentStatus: {
    type: String,
    drfault: "pending",
  },
});

module.exports = Delivery = mongoose.model("delivery", DeliverySchema);
