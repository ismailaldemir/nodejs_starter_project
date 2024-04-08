const mongoose = require("mongoose");

const schema = mongose.schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    is_Active: { type: Boolean, default: true },
    first_name: String,
    last_name: String,
    phone_number: String
  },
  {
    timestamps: {
      createdat: "created_at",
      updatedat: "updated_at"
    }
  }
);

class Users extends mongoose.Model {}

schema.loadClass(Users);
module.exports = mongoose.model("users", schema);
