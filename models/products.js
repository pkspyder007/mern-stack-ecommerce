const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  shopID: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  quantity: {
    type: Object,
    default: { q: 0, h: 0, f: 0 },
  },
  category: {
    type: String,
  },
  price: {
    type: Object,
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = Product = mongoose.model("product", ProductSchema);
