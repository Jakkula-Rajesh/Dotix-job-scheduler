import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [payload, setPayload] = useState('{}');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${apiBase}/jobs`);
      const data = await res.json();
      setJobs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const createJob = async (e) => {
    e.preventDefault();
    let parsed = {};
    try {
      parsed = JSON.parse(payload || '{}');
    } catch (err) {
      alert('Payload must be valid JSON');
      return;
    }
    setLoading(true);
    try {
      await fetch(`${apiBase}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName, payload: parsed, priority })
      });
      setTaskName('');
      setPayload('{}');
      setPriority('Medium');
      await fetchJobs();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const runJob = async (id) => {
    try {
      await fetch(`${apiBase}/run-job/${id}`, { method: 'POST' });
      // optimistic refresh
      setTimeout(fetchJobs, 500);
      setTimeout(fetchJobs, 3500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="container">
          <h1>Dotix Job Scheduler</h1>
        </div>
      </header>

      <main className="container">
        <section className="panel">
          <h2>Create Job</h2>
          <form onSubmit={createJob} className="form">
            <label>
              Task Name
              <input value={taskName} onChange={(e) => setTaskName(e.target.value)} required />
            </label>

            <label>
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>

            <label>
              Payload (JSON)
              <textarea rows={6} value={payload} onChange={(e) => setPayload(e.target.value)} />
            </label>

            <div className="actions">
              <button type="submit" className="btn primary" disabled={loading}>Create Job</button>
              <button type="button" className="btn" onClick={() => { setTaskName(''); setPayload('{}'); setPriority('Medium'); }}>Reset</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Jobs</h2>
          <table className="jobs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className={job.status === 'running' ? 'running' : ''}>
                  <td>{job.id}</td>
                  <td>{job.taskName}</td>
                  <td>{job.priority}</td>
                  <td>{job.status}</td>
                  <td>{job.createdAt}</td>
                  <td>
                    {job.status === 'pending' && (
                      <button className="btn small" onClick={() => runJob(job.id)}>Run</button>
                    )}
                    {job.status === 'running' && <span className="badge running">Running</span>}
                    {job.status === 'completed' && <span className="badge success">Completed</span>}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No jobs yet</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      <footer className="footer">
        <div className="container">Dotix Job Scheduler — Demo</div>
      </footer>
    </div>
  );
}

export default App;
