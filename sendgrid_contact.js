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
    console.log("🚀 ~ file: sendgrid_contact.js:44 ~ postContact ~ Response:", Response);

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
      data: Response.body,
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
    client.setApiKey(process.env.SENDGRID_EMAIL_VALIDATION_API_KEY);

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
      data: Response.body.result,
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

  // GET All contact lists
  const { data: contactLists } = await getAllContact();

  // Find the GLOBAL contact list
  const allContact = contactLists.find((contact) => contact.name.toLowerCase() === allContactName.toLowerCase());
  if (allContact) {
    // Search that email on the GLOBAL contact lists
    const { data: emailExitsGlobalContact } = await searchEmailInContact(allContact.id, email);
    // If email exits on GLOBAL contact
    if (emailExitsGlobalContact) {
      // Find the app contact list
      const appContact = contactLists.find((contact) => contact.name.toLowerCase() === process.env.APP_NAME.toLowerCase());
      // If app contact list is available
      if (appContact) {
        // Find the email on APP contact list already exits or not
        const emailExitsAppContact = await searchEmailInContact(appContact.id, email);
        // if not save that email on APP contact list and send mail
        if (!emailExitsAppContact.data) {
          const data = await saveEmailToContact(appContact.id, email);
          if (!data) throw new Error("Unable to save email on contact");

          // Send mail
          return res.json({ success: true, message: "email save and mail sent to app contact", data });
        } else {
          // If already exit send mail
          return res.json({ success: true, message: "email already save and mail sent to app contact" });
        }
      } else {
        // create and save that email and send mail
        const { data: appContactCreate } = await postContact(process.env.APP_NAME);
        if (!appContactCreate) throw new Error("Some thing went wrong, unable to send mail");

        const appContactEmailSave = await saveEmailToContact(appContactCreate.id, email);
        if (!appContactEmailSave) throw new Error("Some thing went wrong, unable to send mail");

        // send mail
        return { success: true, message: "Mail send successfully" };
      }
    } else {
      // Validate email address
      // const isValidEmail = await validateEmail(email);
      // if (!isValidEmail) throw new Error("email is not validate");

      // save on the global and app contact list ans send mail
      const globalContactEmailSave = await saveEmailToContact(allContact.id, email);
      if (!globalContactEmailSave) throw new Error("Some thing went wrong, unable to send mail");
      const appContact = contactLists.find((contact) => contact.name.toLowerCase() === process.env.APP_NAME.toLowerCase());
      // If app contact list is available
      if (appContact) {
        // Find the email on APP contact list already exits or not
        const emailExitsAppContact = await searchEmailInContact(appContact.id, email);
        // if not save that email on APP contact list and send mail
        if (!emailExitsAppContact.data) {
          const data = await saveEmailToContact(appContact.id, email);
          if (!data) throw new Error("Unable to save email on contact");

          // Send mail
          return res.json({ success: true, message: "email save and mail sent to app contact", data });
        } else {
          // If already exit send mail
          return res.json({ success: true, message: "email already save and mail sent to app contact" });
        }
      } else {
        // create and save that email and send mail
        const { data: appContactCreate } = await postContact(process.env.APP_NAME);
        if (!appContactCreate) throw new Error("Some thing went wrong, unable to send mail");

        const appContactEmailSave = await saveEmailToContact(appContactCreate.id, email);
        if (!appContactEmailSave) throw new Error("Some thing went wrong, unable to send mail");

        // send mail
        return { success: true, message: "Mail send successfully" };
      }
    }
  } else {
    // const isValidEmail = await validateEmail(email);
    // if (!isValidEmail) throw new Error("email is not validate");

    // create Global contact list and APP contact list
    const { data: allContactCreate } = await postContact(allContactName);
    if (!allContactCreate) throw new Error("Some thing went wrong, unable to send mail");

    const { data: appContactCreate } = await postContact(process.env.APP_NAME);
    if (!appContactCreate) throw new Error("Some thing went wrong, unable to send mail");

    // save on the global and app contact list ans send mail
    const globalContactEmailSave = await saveEmailToContact(allContactCreate.id, email);
    if (!globalContactEmailSave) throw new Error("Some thing went wrong, unable to send mail");

    const appContactEmailSave = await saveEmailToContact(appContactCreate.id, email);
    if (!appContactEmailSave) throw new Error("Some thing went wrong, unable to send mail");

    // send mail
    return { success: true, message: "Mail send successfully" };
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
