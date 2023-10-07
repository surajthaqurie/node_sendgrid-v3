const client = require("@sendgrid/client");
const { dynamic_template } = require("./dynamic_template");
const { sendGridConfig } = require("./sendgrid");

const postSendGridTemplate = async () => {
  try {
    const { SENDGRID_API_KEY } = sendGridConfig();
    client.setApiKey(SENDGRID_API_KEY);

    const mail_request = {
      url: `/v3/templates`,
      method: "POST",
      body: { name: "test_dynamic_template", generation: "dynamic" },
    };

    const [response] = await client.request(mail_request);
    if (response.statusCode == "201") {
      const templateId = response.body.id;
      const versionName = "v1";

      const versionData = {
        name: versionName,
        subject: "{{{subject}}}",
        html_content: dynamic_template,
      };

      const versionResponse = await client.request({
        method: "POST",
        url: `/v3/templates/${templateId}/versions`,
        body: versionData,
      });

      return {
        success: true,
        template: versionResponse.Response,
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getSendGridTemplates = async () => {
  try {
    const { SENDGRID_API_KEY } = sendGridConfig();
    client.setApiKey(SENDGRID_API_KEY);

    const queryParams = {
      generations: "dynamic",
      page_size: 20,
    };

    const mail_request = {
      url: `/v3/templates`,
      method: "GET",
      qs: queryParams,
    };

    const [response] = await client.request(mail_request);

    return {
      success: true,
      templates: response.body.result,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getSendGridTemplateById = async (templateId) => {
  try {
    const { SENDGRID_API_KEY } = sendGridConfig();
    client.setApiKey(SENDGRID_API_KEY);

    const mail_request = {
      url: `/v3/templates/${templateId}`,
      method: "GET",
    };

    const [Response] = await client.request(mail_request);

    return {
      success: true,
      template: Response.body,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const deleteSendGridTemplateById = async (templateId) => {
  try {
    const { SENDGRID_API_KEY } = sendGridConfig();
    client.setApiKey(SENDGRID_API_KEY);

    const mail_request = {
      url: `/v3/templates/${templateId}`,
      method: "DELETE",
    };

    const [response] = await client.request(mail_request);

    return {
      success: true,
      templates: response.body.result,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

module.exports = {
  getSendGridTemplates,
  getSendGridTemplateById,
  deleteSendGridTemplateById,
  postSendGridTemplate,
};
