const jobService = require('../services/job.service');
const fetch = require('node-fetch');

exports.createJob = async (req, res) => {
  try {
    const { taskName, payload, priority } = req.body;
    if (!taskName || !priority) {
      return res.status(400).json({ error: 'taskName and priority are required' });
    }

    const job = await jobService.createJob({ taskName, payload: payload || {}, priority });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const jobs = await jobService.getJobs({ status, priority });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getJob = async (req, res) => {
  try {
    const id = req.params.id;
    const job = await jobService.getJobById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.runJob = async (req, res) => {
  try {
    const id = req.params.id;
    const job = await jobService.getJobById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status === 'running') return res.status(400).json({ error: 'Job already running' });
    if (job.status === 'completed') return res.status(400).json({ error: 'Job already completed' });

    // set running
    await jobService.updateJobStatus(id, 'running');

    // respond quickly
    res.json({ message: 'Job started' });

    // simulate background processing
    setTimeout(async () => {
      const completedAt = new Date().toISOString();
      await jobService.completeJob(id, completedAt);

      // trigger webhook if configured
      const webhookUrl = process.env.WEBHOOK_URL || null;
      const completedJob = await jobService.getJobById(id);
      const payload = {
        jobId: completedJob.id,
        taskName: completedJob.taskName,
        priority: completedJob.priority,
        payload: JSON.parse(completedJob.payload || '{}'),
        completedAt
      };

      if (webhookUrl) {
        try {
          const resp = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const text = await resp.text();
          console.log('Webhook response:', resp.status, text);
        } catch (err) {
          console.error('Webhook error', err.message);
        }
      } else {
        console.log('No WEBHOOK_URL configured, webhook payload:', payload);
      }
    }, 3000);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.webhookTest = async (req, res) => {
  console.log('Received webhook test payload:', req.body);
  res.json({ received: true, body: req.body });
};
