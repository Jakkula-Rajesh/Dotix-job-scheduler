const db = require('../database/db');

const createTable = `
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskName TEXT NOT NULL,
  payload TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  completedAt TEXT
);
`;

db.run(createTable);

exports.createJob = async ({ taskName, payload, priority }) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO jobs (taskName, payload, priority, status) VALUES (?,?,?,?)',
      [taskName, JSON.stringify(payload || {}), priority, 'pending'],
      function(err) {
        if (err) return reject(err);
        db.get('SELECT * FROM jobs WHERE id = ?', [this.lastID], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      }
    );
  });
};

exports.getJobs = async ({ status, priority }) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    query += ' ORDER BY id DESC';
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
};

exports.getJobById = async (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM jobs WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

exports.updateJobStatus = async (id, status) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE jobs SET status = ?, updatedAt = datetime("now") WHERE id = ?', [status, id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

exports.completeJob = async (id, completedAt) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE jobs SET status = ?, completedAt = ?, updatedAt = datetime("now") WHERE id = ?',
      ['completed', completedAt, id],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};
