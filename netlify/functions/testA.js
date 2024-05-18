const client = require("@sendgrid/mail");

function sendEmail(client, message, senderEmail, senderName, email, subject, attachment, filename) {
    return new Promise((fulfill, reject) => {
        const data = {
            from: {
                email: senderEmail,
                name: senderName
            },
            subject: `New Submission: ${message} Dismissal Form`,
            to: email,
            html: `You have received a new submission from: ${message}'s Parent/Guardian.`,
            attachments: [
                {
                    content: attachment, // Attach the file content
                    filename: filename, // Use the provided filename
                    type: "application/pdf", // Specify the MIME type
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

    // Check if required environment variables are provided
    if (!SENDGRID_API_KEY || !SENDGRID_SENDER_EMAIL || !SENDGRID_SENDER_NAME) {
        return callback("Required environment variables are missing.", null);
    }

    // Parse request body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return callback("Malformed request body.", null);
    }

    // Extract required fields from request body
    const { message, email, subject, attachment, filename } = body;

    // Check if all required fields are provided
    if (!message || !email || !subject || !attachment || !filename) {
        return callback("Required fields are missing in the request body.", null);
    }

    client.setApiKey(SENDGRID_API_KEY);

    sendEmail(
        client,
        message,
        SENDGRID_SENDER_EMAIL,
        SENDGRID_SENDER_NAME,
        email,
        subject,
        attachment,
        filename // Pass the filename
    )
    .then(response => callback(null, { statusCode: response.statusCode }))
    .catch(err => callback(err, null));
};
