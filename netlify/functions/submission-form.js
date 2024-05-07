const client = require("@sendgrid/mail");

function sendEmail(client, message, senderEmail, senderName, email, pdfData) {
    return new Promise((fulfill, reject) => {
        const data = {
            from: {
                email: senderEmail,
                name: senderName
            },
            subject: 'New Dismissal Form Submission',
            to: email, // Set the recipient email dynamically
            html: `You have received a new submission form for: ${message}`,
            attachments: [
                {
                    content: pdfData,
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
    const email = body.email; // Retrieve recipient email from the form data
    const pdfData = body.pdfData; // Retrieve PDF data from the form data

    client.setApiKey(SENDGRID_API_KEY);

    sendEmail(
        client,
        message,
        SENDGRID_SENDER_EMAIL,
        SENDGRID_SENDER_NAME,
        email, // Pass recipient email to the sendEmail function
        pdfData // Pass PDF data to the sendEmail function
    )
    .then(response => callback(null, { statusCode: response.statusCode }))
    .catch(err => callback(err, null));
};
