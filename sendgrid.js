const sgMail = require("@sendgrid/mail");

exports.sendMail = async (mailData, templateId = null) => {
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

    const data = ["abcd", "efgh"];
    templateId = "d-741bf704dc744986be5dcaa66c81be2d";

    let sendMailAddress = [];

    console.log(
      "🚀 ~ file: sendgrid.jss:32 ~ exports.sendMail= ~ RECIPIENT_EMAILS:",
      RECIPIENT_EMAILS
    );
    for (let i = 0; i < RECIPIENT_EMAILS.length; i++) {
      if (templateId) {
        sendMailAddress.push({
          to: [
            {
              email: RECIPIENT_EMAILS[i],
            },
          ],
          dynamic_template_data: {
            subject: "Testing Templates & Stuff",
            name: 'Some "Testing" One',
            city: `<b>${data[i]}<b>`,
          },
        });
      } else {
        sendMailAddress.push({ email: RECIPIENT_EMAILS[i] });
      }
    }
    console.log(
      "🚀 ~ file: sendgrid.js:47 ~ exports.sendMail= ~ sendMailAddress:",
      sendMailAddress
    );

    const mail = {
      from: `sender@${process.env.SENDGRID_SENDER_EMAIL}`,
      personalizations: [
        {
          to: [
            {
              email: "support@" + SENDGRID_SENDER_EMAIL,
            },
          ],
          ...(templateId ? { sendMailAddress } : { bcc: sendMailAddress }),
        },
      ],
      ...(templateId && { templateId }),
      ...(!templateId && { subject: "hello", html: "<h1>Hello User</h1>" }),
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
