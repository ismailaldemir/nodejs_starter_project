var express = require("express");
var router = express.Router();
const Constants = require("../db/models/Constants");
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

/* GET constants listing. */
router.get("/", auth.checkRoles("constant_view"), async (req, res, next) => {
  try {
    let constants = await Constants.find({});
    res.json(Response.successResponse(constants));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(Response.errorResponse(error));
  }
});

router.post("/add", auth.checkRoles("constant_add"), async (req, res) => {
  let body = req.body;

  try {
    if (!body.title)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [
          "name"
        ])
      );

    let constant = new Constants({
      title: body.title,
      description:body.description,
      type:body.type,
      is_active: true,
      created_by: req.user.id
    });

    await constant.save();

    //auditlogs kaydı ekleniyor
    AuditLogs.info(req.user.email, "Constants", "Add", constant);
    logger.info(req.user.email, "Constants", "Add", constant);
    
    //yapılan işleme ait bildirim mesajı görüntüleniyor
    emitter.getEmitter("notifications").emit("messages", { message: constant.title + " is added" });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    logger.error(null, "Constants", "Add", error);
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/update", auth.checkRoles("constant_update"), async (req, res) => {
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

    if (body.title) updates.title = body.title;
    if (body.description) updates.description = body.description;
    if (body.type) updates.type = body.type;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Constants.updateOne({ _id: body._id }, updates);

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Constants", "Update", {
      _id: body._id,
      ...updates
    });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", auth.checkRoles("constant_delete"), async (req, res) => {
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

    await Constants.deleteOne({ _id: body._id });

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Constants", "Delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/export", auth.checkRoles("constant_export"), async (req, res) => {
  try {
      let constants = await Constants.find({});


      let excel = excelExport.toExcel(
          ["NAME", "IS ACTIVE?", "USER_ID", "CREATED AT", "UPDATED AT"],
          ["title", "is_active", "created_by", "created_at", "updated_at"],
          constants
      )

      let filePath = __dirname + "/../tmp/constants_excel_" + Date.now() + ".xlsx";

      fs.writeFileSync(filePath, excel, "UTF-8");

      res.download(filePath);

      // fs.unlinkSync(filePath);

  } catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(Response.errorResponse(err));
  }
});

router.post("/import", auth.checkRoles("constant_add"), upload, async (req, res) => {
  try {

      let file = req.file;
      let body = req.body;

      let rows = Import.fromExcel(file.path);

      for (let i = 1; i < rows.length; i++) {
          let [title, is_active, user, created_at, updated_at] = rows[i];
          if (title) {
              await Constants.create({
                  title,
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
