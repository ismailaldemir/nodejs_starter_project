var express = require("express");
var router = express.Router();
const Dwellings = require("../db/models/Dwellings");
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

/* GET dwellings listing. */
router.get("/", auth.checkRoles("dwelling_view"), async (req, res, next) => {
  try {
    let dwellings = await Dwellings.find({});
    res.json(Response.successResponse(dwellings));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(Response.errorResponse(error));
  }
});

router.post("/add", auth.checkRoles("dwelling_add"), async (req, res) => {
  let body = req.body;

  try {
    if (!body.name)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [
          "name"
        ])
      );

    let dwelling = new Dwellings({
      name: body.name,
      dwelling_number:body.dwelling_number,
      water_subscriber_number:body.water_subscriber_number,
      electricity_subscriber_number:body.electricity_subscriber_number,
      is_active: true,
      created_by: req.user.id
    });

    await dwelling.save();

    //auditlogs kaydı ekleniyor
    AuditLogs.info(req.user.email, "Dwellings", "Add", dwelling);
    logger.info(req.user.email, "Dwellings", "Add", dwelling);
    
    //yapılan işleme ait bildirim mesajı görüntüleniyor
    emitter.getEmitter("notifications").emit("messages", { message: dwelling.name + " is added" });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    logger.error(null, "Dwellings", "Add", error);
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/update", auth.checkRoles("dwelling_update"), async (req, res) => {
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

    if (body.name) updates.name = body.name;
    if (body.dwelling_number) updates.dwelling_number = body.dwelling_number;
    if (body.water_subscriber_number) updates.nwater_subscriber_numberame = body.water_subscriber_number;
    if (body.electricity_subscriber_number) updates.electricity_subscriber_number = body.electricity_subscriber_number;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Dwellings.updateOne({ _id: body._id }, updates);

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Dwellings", "Update", {
      _id: body._id,
      ...updates
    });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", auth.checkRoles("dwelling_delete"), async (req, res) => {
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

    await Dwellings.deleteOne({ _id: body._id });

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Dwellings", "Delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/export", auth.checkRoles("dwelling_export"), async (req, res) => {
  try {
      let dwellings = await Dwellings.find({});


      let excel = excelExport.toExcel(
          ["NAME", "IS ACTIVE?", "USER_ID", "CREATED AT", "UPDATED AT"],
          ["name", "is_active", "created_by", "created_at", "updated_at"],
          dwellings
      )

      let filePath = __dirname + "/../tmp/dwellings_excel_" + Date.now() + ".xlsx";

      fs.writeFileSync(filePath, excel, "UTF-8");

      res.download(filePath);

      // fs.unlinkSync(filePath);

  } catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(Response.errorResponse(err));
  }
});

router.post("/import", auth.checkRoles("dwelling_add"), upload, async (req, res) => {
  try {

      let file = req.file;
      let body = req.body;

      let rows = Import.fromExcel(file.path);

      for (let i = 1; i < rows.length; i++) {
          let [name, is_active, user, created_at, updated_at] = rows[i];
          if (name) {
              await Dwellings.create({
                  name,
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
