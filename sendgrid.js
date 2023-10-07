const sgMail = require("@sendgrid/mail");

const sendGridConfig = () => {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || null;
  const SENDGRID_SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL || null;

  if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is required !!");
  if (!SENDGRID_SENDER_EMAIL)
    throw new Error("SENDGRID_SENDER_EMAIL is required !!");

  return { SENDGRID_API_KEY, SENDGRID_SENDER_EMAIL };
};

const getPersonalizations = (
  RECIPIENT_EMAILS,
  SENDGRID_SENDER_EMAIL,
  templateData = null
) => {
  let personalizations = [
    {
      to: [
        {
          email: "support@" + SENDGRID_SENDER_EMAIL,
        },
      ],
    },
  ];
  let toSendMails = [];

  for (let i = 0; i < RECIPIENT_EMAILS.length; i++) {
    if (templateData && templateData.templateId) {
      toSendMails = [
        ...toSendMails,
        {
          to: [
            {
              email: RECIPIENT_EMAILS[i],
            },
          ],
          dynamic_template_data: {
            subject: "Testing Templates & Stuff",
            name: 'Some "Testing" One',
            city: `<b>${templateData.data[i]}<b>`,
          },
        },
      ];
    } else {
      toSendMails = [...toSendMails, { email: RECIPIENT_EMAILS[i] }];
    }
  }

  personalizations = [...toSendMails];
  return personalizations;
};

const sendNormalMail = async (mailData) => {
  try {
    const { SENDGRID_API_KEY, SENDGRID_SENDER_EMAIL } = sendGridConfig();

    sgMail.setApiKey(SENDGRID_API_KEY);

    const RECIPIENT_EMAILS = [...new Set([mailData].flat())];
    const personalizations = getPersonalizations(
      RECIPIENT_EMAILS,
      SENDGRID_SENDER_EMAIL
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
          bcc: personalizations,
        },
      ],
      subject: "hello",
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

const sendTemplateMail = async (mailData, templateId = null) => {
  try {
    const { SENDGRID_API_KEY, SENDGRID_SENDER_EMAIL } = sendGridConfig();
    sgMail.setApiKey(SENDGRID_API_KEY);

    const RECIPIENT_EMAILS = [...new Set([mailData].flat())];
    const templateData = {
      data: ["abcd", "efgh"],
      templateId: "d-741bf704Sff4986be5daa66c81be2d",
    };

    const personalizations = getPersonalizations(
      RECIPIENT_EMAILS,
      SENDGRID_SENDER_EMAIL,
      templateData
    );

    const mail = {
      from: `sender@${process.env.SENDGRID_SENDER_EMAIL}`,
      personalizations,
      templateId: templateData.templateId,
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

module.exports = { sendNormalMail, sendTemplateMail, sendGridConfig };
