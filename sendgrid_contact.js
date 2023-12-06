const client = require("@sendgrid/client");
const { sendGridConfig } = require("./sendgrid");

const getAllContact = async () => {
  try {
    client.setApiKey(process.env.SENDGRID_CONTACT_API_KEY);
    const queryParams = {
      page_size: 100,
    };

    const request = {
      url: `/v3/marketing/lists`,
      method: "GET",
      qs: queryParams,
    };

    const [Response] = await client.request(request);

    return {
      success: true,
      data: Response.body.result,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const postContact = async (name) => {
  try {
    client.setApiKey(process.env.SENDGRID_CONTACT_API_KEY);
    const data = {
      name: name,
    };
    const request = {
      url: `/v3/marketing/lists`,
      method: "POST",
      body: data,
    };

    const [Response] = await client.request(request);

    return {
      success: true,
      data: Response.body,
    };
  } catch (err) {
    console.log("🚀 ~ file: sendgrid_contact.js:50 ~ postContact ~ err:", err);
    return {
      success: false,
      message: err.message,
    };
  }
};

const getContactBydId = async (id) => {
  try {
    client.setApiKey(process.env.SENDGRID_CONTACT_API_KEY);

    const request = {
      url: `/v3/marketing/lists/${id}`,
      method: "GET",
    };

    const [Response] = await client.request(request);

    return {
      success: true,
      data: Response,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const saveEmailToContact = async (id, email) => {
  try {
    client.setApiKey(process.env.SENDGRID_CONTACT_API_KEY);

    const request = {
      url: `/v3/marketing/contacts`,
      method: "PUT",
      body: {
        list_ids: [id],
        contacts: [{ email }],
      },
    };

    const [Response] = await client.request(request);

    return {
      data: Response,
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const searchEmailInContact = async (id, email) => {
  try {
    client.setApiKey(process.env.SENDGRID_CONTACT_API_KEY);

    const data = {
      query: `email LIKE '${email}%' AND CONTAINS(list_ids, '${id}')`,
    };
    const request = {
      url: `/v3/marketing/contacts/search`,
      method: "POST",
      body: data,
    };

    const [Response] = await client.request(request);
    return {
      data: Response.body.contact_count,
      success: true,
    };
  } catch (err) {
    console.log("🚀 ~ file: sendgrid_contact.js:134 ~ searchEmailInContact ~ err:", err);
    return {
      success: false,
      message: err.message,
    };
  }
};

const validateEmail = async (email) => {
  try {
    const client = require("@sendgrid/client");
    client.setApiKey(process.env.SENDGRID_API_KEY);

    const data = {
      email,
      source: "signup",
    };

    const request = {
      url: `/v3/validations/email`,
      method: "POST",
      body: data,
    };

    const [Response] = await client.request(request);
    return {
      data: Response.body.contact_count,
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const verifyAndSaveEmailContact = async (email) => {
  const allContactName = "All Contacts";

  const contactLists = await getAllContact();
  const allContact = contactLists.data.find((contact) => contact.name.toLowerCase() === allContactName.toLowerCase());
  if (allContact) {
    const emailExitsGlobalContact = await searchEmailInContact(allContact.id, email);
    if (emailExitsGlobalContact.data) {
      const appContact = contactLists.data.find((contact) => {
        return contact.name.toLowerCase() === process.env.APP_NAME.toLowerCase();
      });

      console.log("🚀 ~ file: sendgrid_contact.js:175 ~ appContact ~ appContact:", appContact);

      if (appContact) {
        const emailExitsAppContact = await searchEmailInContact(appContact.id, email);
        if (!emailExitsAppContact.data) {
          const data = await saveEmailToContact(appContact.id, email);
          console.log("🚀 ~ file: app.js:36 ~ app.post ~ data:", data);
          if (!data) throw new Error("Unable to save email on contact");
          return res.json({ success: true, message: "email save and mail sent to app contact", data });
        } else {
          return res.json({ success: true, message: "email already save and mail sent to app contact" });
        }
      } else {
        const appContactCreate = await postContact(process.env.APP_NAME);
        console.log("🚀 ~ file: app.js:40 ~ app.post ~ appContactCreate:", appContactCreate);
      }
    } else {
      const isValidEmail = await validateEmail(email);
      console.log("🚀 ~ file: app.js:53s ~ app.post ~ isValidEmail:", isValidEmail);
      // save on all contact and appContact
    }
  } else {
    const allContactCreate = await postContact(allContactName);
    console.log("🚀 ~ file: app.js:51 ~ app.post ~ allContactCreate:", allContactCreate);
    const isValidEmail = await validateEmail(email);
    console.log("🚀 ~ file: app.js:53 ~ app.post ~ isValidEmail:", isValidEmail);
  }
};
module.exports = {
  getAllContact,
  postContact,
  getContactBydId,
  saveEmailToContact,
  searchEmailInContact,
  validateEmail,
  verifyAndSaveEmailContact,
};
