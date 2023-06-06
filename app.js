require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { sendMail } = require("./sendgrid");

const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

app.post("/mail-send", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is started on ${process.env.APP_URL}`);
});
