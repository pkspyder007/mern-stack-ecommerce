
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  type: {
    type: String,
    default: 'client'
  }
});

module.exports = Client = mongoose.model("client", clientSchema);