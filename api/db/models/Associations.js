const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: {type: String, required: true},
    phone_number: {type: String, required: true},
    gsm: {type: String, required: true},
    city:{type: String, required: true},
    province:{type: String, required: true},
    address: {type: String, required: true},
    web_page: {type: String},
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.SchemaTypes.ObjectId }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Associations extends mongoose.Model {

}

schema.loadClass(Associations);
module.exports = mongoose.model("associations", schema);