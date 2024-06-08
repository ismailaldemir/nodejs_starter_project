const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: {type: String, required: true},
    dwelling_number: {type: String, required: true},
    water_subscriber_number: {type: String, required: true},
    electricity_subscriber_number: {type: String, required: true},
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.SchemaTypes.ObjectId }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Dwellings extends mongoose.Model {

}

schema.loadClass(Dwellings);
module.exports = mongoose.model("dwellings", schema);