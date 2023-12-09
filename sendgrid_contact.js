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

  let allContactList = contactLists.find((contact) => contact.name.toLowerCase() === allContactName.toLowerCase());
  if (!allContactList) {
    // create all contact list
    const { data: allContactCreate } = await postContact(allContactName);
    if (!allContactCreate) throw new Error("Some thing went wrong, unable to send mail");
    allContactList = allContactCreate;
  }

  let appContactList = contactLists.find((contact) => contact.name.toLowerCase() === process.env.APP_NAME.toLowerCase());
  if (!appContactList) {
    // create App contact list
    const { data: appContactCreate } = await postContact(process.env.APP_NAME);
    if (!appContactCreate) throw new Error("Some thing went wrong, unable to send mail");

    appContactList = appContactCreate;
  }

  const { data: emailExitsGlobalContact } = await searchEmailInContact(allContactList.id, email);
  if (!emailExitsGlobalContact) {
    // Validate email address
    // const isValidEmail = await validateEmail(email);
    // if (!isValidEmail) throw new Error("Email address is invalid, unable to send mail");

    const globalContactEmailSave = await saveEmailToContact(allContactList.id, email);
    if (!globalContactEmailSave) throw new Error("Some thing went wrong, unable to send mail");
  }

  const { data: emailExitsAppContact } = await searchEmailInContact(appContactList.id, email);
  if (!emailExitsAppContact) {
    const { data: saveEmail } = await saveEmailToContact(allContactList.id, email);
    if (!saveEmail) throw new Error("Unable to save email on contact");
  }

  // Send mail
  return { success: true, message: "email save and mail sent to app contact" };
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
