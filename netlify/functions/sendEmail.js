const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  const { recipientEmail, name, email, message } = JSON.parse(event.body);

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: recipientEmail,
    from: 'jameciamoore16@gmail.com', // Replace with your verified sender
    subject: 'New Message from Your Website',
    text: `You have received a new message from ${name} (${email}):\n\n${message}`,
  };

  try {
    await sgMail.send(msg);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Error sending email:', error.toString());
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};
