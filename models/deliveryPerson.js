const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeliveryPersonSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  DLNumber: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = DeliveryPerson = mongoose.model("deliveryPerson", DeliveryPersonSchema);