const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  clientID: {
    type: String,
    required: ["Client id is required"],
  },
});

module.exports = ResetToken = mongoose.model("resetToken", ResetTokenSchema);
