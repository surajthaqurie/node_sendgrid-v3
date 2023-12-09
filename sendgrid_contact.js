const client = require("@sendgrid/client");

class SendGridConfig {
  constructor() {
    client.setApiKey(process.env.SENDGRID_CONTACT_API_KEY);
  }

  // Get all marketing contact lists
  async getAllContact() {
    try {
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
  }

  // Create new marketing contact list
  async postContact(name) {
    try {
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
  }

  // Get marketing contact list details
  async getContactBydId(id) {
    try {
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
  }

  // Save email to contact list
  async saveEmailToContact(id, email) {
    try {
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
  }

  // Search email in the contact list
  async searchEmailInContact(id, email) {
    try {
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
  }

  // Validate email address is valid or not
  async validateEmail(email) {
    try {
      // client.setApiKey(process.env.SENDGRID_EMAIL_VALIDATION_API_KEY);

      const data = {
        email,
        source: "signup", // subscriber, contact us
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
  }

  // Main function
  async verifyAndSaveEmailContact(email) {
    const allContactName = "All Contacts";

    // GET All contact lists
    const { data: contactLists } = await this.getAllContact();

    let allContactList = contactLists.find((contact) => contact.name.toLowerCase() === allContactName.toLowerCase());
    if (!allContactList) {
      // create all contact list
      const { data: allContactCreate } = await this.postContact(allContactName);
      if (!allContactCreate) throw new Error("Some thing went wrong, unable to send mail");
      allContactList = allContactCreate;
    }

    let appContactList = contactLists.find((contact) => contact.name.toLowerCase() === process.env.APP_NAME.toLowerCase());
    if (!appContactList) {
      // create App contact list
      const { data: appContactCreate } = await this.postContact(process.env.APP_NAME);
      if (!appContactCreate) throw new Error("Some thing went wrong, unable to send mail");

      appContactList = appContactCreate;
    }

    const { data: emailExitsGlobalContact } = await this.searchEmailInContact(allContactList.id, email);
    if (!emailExitsGlobalContact) {
      // Validate email address
      // const isValidEmail = await validateEmail(email);
      // if (!isValidEmail) throw new Error("Email address is invalid, unable to send mail");

      const globalContactEmailSave = await this.saveEmailToContact(allContactList.id, email);
      if (!globalContactEmailSave) throw new Error("Some thing went wrong, unable to send mail");
    }

    const { data: emailExitsAppContact } = await this.searchEmailInContact(appContactList.id, email);
    if (!emailExitsAppContact) {
      const { data: saveEmail } = await this.saveEmailToContact(allContactList.id, email);
      if (!saveEmail) throw new Error("Unable to save email on contact");
    }

    // Send mail
    return { success: true, message: "email save and mail sent to app contact" };
  }
}

/* 
// Get all marketing contact lists
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

// create new marketing contact list
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

// get marketing contact list details
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

// save email to contact list
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

// search email in the contact list
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

// validate email address is valid or not
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

// main function
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
*/

module.exports = {
  SendGridConfig,
};
