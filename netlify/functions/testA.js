const client = require("@sendgrid/mail");
const multiparty = require("multiparty");

function sendEmail(client, message, senderEmail, senderName, email, subject, attachment) {
    return new Promise((fulfill, reject) => {
        const data = {
            from: {
                email: senderEmail,
                name: senderName
            },
            subject: subject,
            to: email,
            html: `New form submission<br/> ${message}`,
            attachments: [
                {
                    content: attachment, // Attach the file content
                    filename: "filenameTest.pdf", // Specify the filename
                    type: "application/pdf" // Specify the MIME type
                }
            ]
        };

        client
            .send(data)
            .then(([response, body]) => {
                fulfill(response);
            })
            .catch(error => reject(error));
    });
}

exports.handler = function(event, context, callback) {
    const {
        SENDGRID_API_KEY,
        SENDGRID_SENDER_EMAIL,
        SENDGRID_SENDER_NAME
    } = process.env;

    const form = new multiparty.Form();

    form.parse(event, (error, fields, files) => {
        if (error) {
            callback(error, null);
            return;
        }

        const message = fields.message[0];
        const email = fields.email[0];
        const subject = fields.subject[0]; // Retrieve subject from the form data
        const attachment = files.file[0].path; // Get the file path

        client.setApiKey(SENDGRID_API_KEY);

        sendEmail(
            client,
            message,
            SENDGRID_SENDER_EMAIL,
            SENDGRID_SENDER_NAME,
            email,
            subject, // Pass subject to the sendEmail function
            attachment
        )
        .then(response => callback(null, { statusCode: response.statusCode }))
        .catch(err => callback(err, null));
    });
};
