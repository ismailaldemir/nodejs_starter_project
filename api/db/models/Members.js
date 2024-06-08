const mongoose = require("mongoose");
const Associations = require("./Associations");
const Persons = require("./Persons");

const schema = mongoose.Schema({
    association_id: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: Associations },
    memtype_id: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: Membertypes },//üye tür id TODO:üyelik türleri endpointi oluşturulacak
    persons_id: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: Persons },
    member_number: { type: String, required: true},
    dec_date: { type: Date, required: true},//decission date karar tarihi
    dec_number: { type: String, required: true},//decission number karar numarası
    member_number: { type: String, required: true},
    term_date: { type: Date, required: true},//termination date üyelik sonlandırma tarihi
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.SchemaTypes.ObjectId }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Members extends mongoose.Model {

}

schema.loadClass(Members);
module.exports = mongoose.model("members", schema);