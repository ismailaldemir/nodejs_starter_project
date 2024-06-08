const mongoose = require("mongoose");

const schema = mongoose.Schema({
    cit_number: {type: Number},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    birth_place: {type: String},
    birth_day: {type: String},
    gender: {type: String, required: true},
    mname: {type: String},
    fname: {type: String},
    blood_group: {type: String},
    education: {type: String},
    marital_status: {type: String, required: true},
    dwelling_id:{type: mongoose.SchemaTypes.ObjectId},
    phone_number: {type: String},
    gsm: {type: String, required: true},
    address: {type: String},
    city:{type: String},
    province:{type: String},
    email: {type: String},
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

class Persons extends mongoose.Model {

}

schema.loadClass(Persons);
module.exports = mongoose.model("persons", schema);