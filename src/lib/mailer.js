const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarCorreo({ to, subject, html, text, cc, bcc, attachments }) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to, cc, bcc,
    subject,
    html,
    text: text ?? (html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : undefined),
    attachments,
  });
}

module.exports = { enviarCorreo, transporter };
