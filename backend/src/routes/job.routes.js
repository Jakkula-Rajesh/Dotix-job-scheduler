const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');

router.post('/jobs', jobController.createJob);
router.get('/jobs', jobController.listJobs);
router.get('/jobs/:id', jobController.getJob);
router.post('/run-job/:id', jobController.runJob);
router.post('/webhook-test', jobController.webhookTest);

module.exports = router;
