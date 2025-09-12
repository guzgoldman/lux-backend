require('dotenv').config();
const { buildWorker } = require('../queues/connection');
const { EMAIL_QUEUE_NAME } = require('../queues/email.queue');
const { enviarCorreo } = require('../lib/mailer');

buildWorker(EMAIL_QUEUE_NAME, async (job) => {
  const { to, subject, html, text, cc, bcc, attachments } = job.data;
  await enviarCorreo({ to, subject, html, text, cc, bcc, attachments });
}, { concurrency: 10 });
