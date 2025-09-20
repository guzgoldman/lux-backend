const { Queue } = require('bullmq/dist/cjs/classes/queue');
const { Worker } = require('bullmq/dist/cjs/classes/worker');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

function buildQueue(name) {
  const queue = new Queue(name, { connection });
  console.log(`[QUEUE] Cola "${name}" lista`);
  return queue;
}

function buildWorker(name, processor, opts = {}) {
  const worker = new Worker(name, processor, { 
    connection, 
    concurrency: opts.concurrency || 5 
  });
  worker.on('completed', job => console.log(`[QUEUE] OK ${name} jobId=${job.id}`));
  worker.on('failed', (job, err) => console.error(`[QUEUE] FAIL ${name} jobId=${job?.id}:`, err?.message));
  return worker;
}

module.exports = { buildQueue, buildWorker };