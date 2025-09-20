const { buildQueue } = require('./connection');

const EMAIL_QUEUE_NAME = 'lux-emails';
const emailQueue = buildQueue(EMAIL_QUEUE_NAME);

async function enqueueEmail(payload, options = {}) {
  return emailQueue.add('sendEmail', payload, {
    attempts: options.attempts ?? 5,
    backoff: options.backoff ?? { type: 'exponential', delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 1000,
    priority: options.priority ?? 3,
    delay: options.delay ?? 0,
  });
}

module.exports = { emailQueue, enqueueEmail, EMAIL_QUEUE_NAME };
