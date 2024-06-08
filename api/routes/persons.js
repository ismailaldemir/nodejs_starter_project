var express = require("express");
var router = express.Router();
const Persons = require("../db/models/Persons");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const AuditLogs = require("../lib/AuditLogs");
const logger = require("../lib/logger/LoggerClass");
const config = require('../config');
const auth = require("../lib/auth")();
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);
const emitter = require("../lib/Emitter");
const excelExport = new (require("../lib/Export"))();
const fs = require("fs");
const multer = require("multer");
const path = require('path');
const Import = new (require("../lib/Import"))();

let multerStorage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null, config.FILE_UPLOAD_PATH)
    },
    filename: (req, file, next) => {
        next(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: multerStorage }).single("pb_file");

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});

/* GET Persons listing. */
router.get("/", auth.checkRoles("person_view"), async (req, res, next) => {
  try {
    let persons = await Persons.find({});
    res.json(Response.successResponse(persons));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(Response.errorResponse(error));
  }
});

router.post("/add", auth.checkRoles("person_add"), async (req, res) => {
  let body = req.body;

  try {
    if (!body.first_name)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [
          "name"
        ])
      );

    let person = new Persons({
      cit_number: body.cit_number,
      first_name: body.first_name,
      last_name: body.last_name,
      birth_place: body.birth_place,
      birth_day: body.birth_day,
      gender: body.gender,
      mname: body.mname,
      fname: body.fname,
      blood_group: body.blood_group,
      education: body.education,
      marital_status: body.marital_status,
      dwelling_id: body.dwelling_id,
      phone_number:body.phone_number,
      gsm:body.gsm,
      address:body.address,
      city:body.city,
      province:body.province,
      email: body.email,
      web_page:body.web_page,
      is_active: true,
      created_by: req.user.id
    });

    await person.save();

    //auditlogs kaydı ekleniyor
    AuditLogs.info(req.user.email, "Persons", "Add", person);
    logger.info(req.user.email, "Persons", "Add", person);
    
    //yapılan işleme ait bildirim mesajı görüntüleniyor
    emitter.getEmitter("notifications").emit("messages", { message: person.first_name + person.last_name + " is added" });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    logger.error(null, "Persons", "Add", error);
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/update", auth.checkRoles("person_update"), async (req, res) => {
  let body = req.body;

  try {
    if (!body._id)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [
          "id"
        ])
      );

    let updates = {};

    if (body.cit_number) updates.cit_number = body.cit_number;
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.birth_place) updates.birth_place = body.birth_place;
    if (body.birth_day) updates.birth_day = body.birth_day;
    if (body.gender) updates.gender = body.gender;
    if (body.mname) updates.mname = body.mname;
    if (body.fname) updates.fname = body.fname;
    if (body.blood_group) updates.blood_group = body.blood_group;
    if (body.education) updates.education = body.education;
    if (body.marital_status) updates.marital_status = body.marital_status;
    if (body.dwelling_id) updates.dwelling_id = body.dwelling_id;
    if (body.phone_number) updates.phone_number = body.phone_number;
    if (body.gsm) updates.gsm = body.gsm;
    if (body.address) updates.address = body.address;
    if (body.city) updates.city = body.city;
    if (body.province) updates.province = body.province;
    if (body.email) updates.email = body.email;
    if (body.web_page) updates.web_page = body.web_page;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Persons.updateOne({ _id: body._id }, updates);

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Persons", "Update", {
      _id: body._id,
      ...updates
    });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", auth.checkRoles("person_delete"), async (req, res) => {
  let body = req.body;
  try {
    if (!body._id)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [
          "id"
        ])
      );

    await Persons.deleteOne({ _id: body._id });

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Persons", "Delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/export", auth.checkRoles("person_export"), async (req, res) => {
  try {
      let Persons = await Persons.find({});


      let excel = excelExport.toExcel(
          ["NAME", "SURNAME","IS ACTIVE?", "USER_ID", "CREATED AT", "UPDATED AT"],
          ["first_name", "last_name","is_active", "created_by", "created_at", "updated_at"],
          Persons
      )

      let filePath = __dirname + "/../tmp/Persons_excel_" + Date.now() + ".xlsx";

      fs.writeFileSync(filePath, excel, "UTF-8");

      res.download(filePath);

      // fs.unlinkSync(filePath);

  } catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(Response.errorResponse(err));
  }
});

router.post("/import", auth.checkRoles("person_add"), upload, async (req, res) => {
  try {

      let file = req.file;
      let body = req.body;

      let rows = Import.fromExcel(file.path);

      for (let i = 1; i < rows.length; i++) {
          let [first_name, last_name, is_active, user, created_at, updated_at] = rows[i];
          if (first_name) {
              await Persons.create({
                  first_name,
                  last_name,
                  is_active,
                  created_by: req.user._id
              });
          }
      }

      res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse(req.body, Enum.HTTP_CODES.CREATED));

  } catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(Response.errorResponse(err));
  }
});

module.exports = router;
