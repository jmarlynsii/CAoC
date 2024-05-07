const client = require("@sendgrid/mail");

function sendEmail(client, message, senderEmail, senderName, recipientEmail) {
    return new Promise((fulfill, reject) => {
        const data = {
            from: {
                email: senderEmail,
                name: senderName
            },
            subject: 'SendGrid Form',
            to: recipientEmail, // Set the recipient email dynamically
            html: `New form submission<br/> ${message}`
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

    const body = JSON.parse(event.body);
    const message = body.message;
    const recipientEmail = body.email; // Retrieve recipient email from the form data

    client.setApiKey(SENDGRID_API_KEY);

    sendEmail(
        client,
        message,
        SENDGRID_SENDER_EMAIL,
        SENDGRID_SENDER_NAME,
        recipientEmail // Pass recipient email to the sendEmail function
    )
    .then(response => callback(null, { statusCode: response.statusCode }))
    .catch(err => callback(err, null));
};
