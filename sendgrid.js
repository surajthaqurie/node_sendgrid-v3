const sgMail = require("@sendgrid/mail");

exports.sendMail = async (mailData) => {
  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || null;
    const SENDGRID_SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL || null;

    if (!SENDGRID_API_KEY) {
      return {
        success: false,
        message: "Sendgrid API key not set",
      };
    }

    if (!SENDGRID_SENDER_EMAIL) {
      return {
        success: false,
        message: "Sendgrid sender email address not set",
      };
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    const RECIPIENT_EMAILS = [...new Set([mailData].flat())];
    let bcc = [];
    if (RECIPIENT_EMAILS.length > 1) {
      for (let i = 1; i < RECIPIENT_EMAILS.length; i++) {
        bcc.push({ email: RECIPIENT_EMAILS[i] });
      }
    }

    const mail = {
      from: `sender@${process.env.SENDGRID_SENDER_EMAIL}`,
      personalizations: [
        {
          to: [
            {
              email: RECIPIENT_EMAILS[0],
            },
          ],
          bcc,
        },
      ],
      subject: "hello ",
      html: "<h1>Hello User</h1>",
    };

    const mail_response = await sgMail.send(mail, true);
    return {
      success: true,
      message: "Mail sent successfully",
      content: mail_response[0],
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: err.message,
    };
  }
};
