require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { sendMail } = require("./sendgrid");
const {
  getSendGridTemplates,
  postSendGridTemplate,
  getSendGridTemplateById,
  deleteSendGridTemplateById,
} = require("./sendgrid_template");

const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

app.post("/api/v1/mail-send", async (req, res) => {
  if (!req.body.email.length) {
    return res.status(400).json({
      success: false,
      message: "Please enter email",
    });
  }
  const { message, content, success } = await sendMail(req.body.email);
  return res.status(400).json({
    success,
    message,
    content,
  });
});

app.get("/api/v1/template", async (req, res, next) => {
  const { templates, success } = await getSendGridTemplates();

  if (!success) {
    return res.json({
      success,
      message,
    });
  }

  return res.json({
    success,
    data: templates,
  });
});

app.post("/api/v1/template", async (req, res, next) => {
  const { template, success, message } = await postSendGridTemplate();

  if (!success) {
    return res.json({
      success,
      message,
    });
  }

  return res.json({
    success,
    data: template,
  });
});

app.get("/api/v1/template/:templateId", async (req, res, next) => {
  const { message, success, template } = await getSendGridTemplateById(
    req.params.templateId
  );

  if (!success) {
    return res.json({
      success,
      message,
    });
  }

  return res.json({
    success,
    data: template,
  });
});
app.delete("/api/v1/template/:templateId", async (req, res, next) => {
  const { message, success, template } = await deleteSendGridTemplateById(
    req.params.templateId
  );

  if (!success) {
    return res.json({
      success,
      message,
    });
  }

  return res.json({
    success,
    data: template,
  });
});

app.listen(PORT, () => {
  console.log(`Server is started on ${process.env.APP_URL}`);
});
