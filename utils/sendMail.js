const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'yuvrajbhatnagar36@gmail.com',
    pass: 'sbihwblobytdltrc',
  },
});

// Function to send an HTML email
function sendHtmlEmail(userEmail, mailContent, emailSubject) {
  const mailOptions = {
    from: 'yuvrajbhatnagar36@gmail.com',
    to: userEmail,
    subject: emailSubject,
    html: mailContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports = {
  sendHtmlEmail,
};
