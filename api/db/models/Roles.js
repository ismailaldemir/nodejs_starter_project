const mongoose = require("mongoose");

const schema = mongose.schema(
  {
    role_name: { type: String, required: true },
    is_Active: { type: Boolean, default: true },
    created_by: {
      type: mongoose.schemaTypes.ObjectId,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: {
      createdat: "created_at",
      updatedat: "updated_at"
    }
  }
);

class Roles extends mongoose.Model {}

schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema);
