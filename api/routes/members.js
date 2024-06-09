var express = require("express");
var router = express.Router();
const Members = require("../db/models/Members");
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

/* GET members listing. */
router.get("/", auth.checkRoles("member_view"), async (req, res, next) => {
  try {
    let members = await Members.find({});
    res.json(Response.successResponse(members));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(Response.errorResponse(error));
  }
});

router.post("/add", auth.checkRoles("member_add"), async (req, res) => {
  let body = req.body;

  try {
    if (!body.member_number)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [
          "member_number"
        ])
      );
      if (!body.association_id)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [
          "association_id"
        ])
      );

    let member = new Members({
      association_id: body.association_id,
      memtype_id: body.memtype_id,
      person_id: body.person_id,
      dec_date: body.dec_date,
      dec_number: body.dec_number,
      member_number: body.member_number,
      entry_date: body.entry_date,
      term_date: body.term_date,
      is_active: true,
      created_by: req.user.id
    });

    await member.save();

    //auditlogs kaydı ekleniyor
    AuditLogs.info(req.user.email, "Members", "Add", member);
    logger.info(req.user.email, "Members", "Add", member);
    
    //yapılan işleme ait bildirim mesajı görüntüleniyor
    emitter.getEmitter("notifications").emit("messages", { message: member.member_number + " is added" });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    logger.error(null, "Members", "Add", error);
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/update", auth.checkRoles("member_update"), async (req, res) => {
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

    if (body.association_id) updates.association_id = body.association_id;
    if (body.memtype_id) updates.memtype_id = body.memtype_id;
    if (body.person_id) updates.person_id = body.person_id;
    if (body.dec_date) updates.dec_date = body.dec_date;
    if (body.dec_number) updates.dec_number = body.dec_number;
    if (body.member_number) updates.member_number = body.member_number;
    if (body.entry_date) updates.entry_date = body.entry_date;
    if (body.term_date) updates.term_date = body.term_date;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Members.updateOne({ _id: body._id }, updates);

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Members", "Update", {
      _id: body._id,
      ...updates
    });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", auth.checkRoles("member_delete"), async (req, res) => {
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

    await Members.deleteOne({ _id: body._id });

    //auditlogs kaydı ekleniyor
    AuditLogs.info(null, "Members", "Delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/export", auth.checkRoles("member_export"), async (req, res) => {
  try {
      let members = await Members.find({});


      let excel = excelExport.toExcel(
          ["MEMBER NUMBER", "IS ACTIVE?", "USER_ID", "CREATED AT", "UPDATED AT"],
          ["member_number", "is_active", "created_by", "created_at", "updated_at"],
          members
      )

      let filePath = __dirname + "/../tmp/members_excel_" + Date.now() + ".xlsx";

      fs.writeFileSync(filePath, excel, "UTF-8");

      res.download(filePath);

      // fs.unlinkSync(filePath);

  } catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(Response.errorResponse(err));
  }
});

router.post("/import", auth.checkRoles("member_add"), upload, async (req, res) => {
  try {

      let file = req.file;
      let body = req.body;

      let rows = Import.fromExcel(file.path);

      for (let i = 1; i < rows.length; i++) {
          let [member_number, is_active, user, created_at, updated_at] = rows[i];
          if (member_number) {
              await Members.create({
                  member_number,
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
