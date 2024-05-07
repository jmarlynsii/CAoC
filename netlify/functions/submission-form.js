const client = require("@sendgrid/mail");

function sendEmail(client, message, senderEmail, senderName, email, pdfData) {
    return new Promise((fulfill, reject) => {
        const data = {
            from: {
                email: senderEmail,
                name: senderName
            },
            subject: 'New Dismissal Submission Form',
            to: email,
            html: `You have received a new submission form for: ${message}`,
            attachments: [
                {
                    content: pdfData.toString('base64'),
                    filename: 'Dismissal_Form.pdf',
                    type: 'application/pdf',
                    disposition: 'attachment'
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

    const body = JSON.parse(event.body);
    const message = body.message;
    const email = body.email;
    const pdfData = body.pdfData; // Retrieve PDF data from request bodysss

    client.setApiKey(SENDGRID_API_KEY);

    sendEmail(
        client,
        message,
        SENDGRID_SENDER_EMAIL,
        SENDGRID_SENDER_NAME,
        email,
        pdfData
    )
    .then(response => callback(null, { statusCode: response.statusCode }))
    .catch(err => callback(err, null));
};
