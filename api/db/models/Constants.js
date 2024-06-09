const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    type: { type: String, required: true},
    is_active: { type: Boolean, default: true },
    created_by: {
      created_by: { type: mongoose.SchemaTypes.ObjectId }
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

class Constants extends mongoose.Model {

}

schema.loadClass(Constants);
module.exports = mongoose.model("Constants", schema);
