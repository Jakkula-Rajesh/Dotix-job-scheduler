const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jobRoutes = require('./routes/job.routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', jobRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Dotix Job Scheduler Backend' });
});

module.exports = app;
