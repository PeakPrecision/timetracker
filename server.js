const express = require('express');
const path = require('path');
const { load, save } = require('./db');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Employees ---
app.get('/api/employees', (req, res) => {
  const db = load();
  res.json(db.employees.sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/employees', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const db = load();
  if (db.employees.find(e => e.name.toLowerCase() === name.trim().toLowerCase()))
    return res.status(400).json({ error: 'Employee already exists' });
  const emp = { id: db.nextId.employee++, name: name.trim() };
  db.employees.push(emp);
  save(db);
  res.json(emp);
});

app.delete('/api/employees/:id', (req, res) => {
  const db = load();
  db.employees = db.employees.filter(e => e.id !== parseInt(req.params.id));
  save(db);
  res.json({ ok: true });
});

// --- Jobs ---
app.get('/api/jobs', (req, res) => {
  const db = load();
  res.json(db.jobs.sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/jobs', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const db = load();
  if (db.jobs.find(j => j.name.toLowerCase() === name.trim().toLowerCase()))
    return res.status(400).json({ error: 'Job already exists' });
  const job = { id: db.nextId.job++, name: name.trim() };
  db.jobs.push(job);
  save(db);
  res.json(job);
});

app.delete('/api/jobs/:id', (req, res) => {
  const db = load();
  db.jobs = db.jobs.filter(j => j.id !== parseInt(req.params.id));
  save(db);
  res.json({ ok: true });
});

// --- Clock In ---
app.post('/api/clock-in', (req, res) => {
  const { employee_id, job_id } = req.body;
  if (!employee_id || !job_id) return res.status(400).json({ error: 'Employee and job required' });
  const db = load();

  const empId = parseInt(employee_id);
  const jobId = parseInt(job_id);

  const open = db.entries.find(e => e.employee_id === empId && !e.clock_out);
  if (open) return res.status(400).json({ error: 'Already clocked in' });

  const employee = db.employees.find(e => e.id === empId);
  const job = db.jobs.find(j => j.id === jobId);
  if (!employee || !job) return res.status(400).json({ error: 'Invalid employee or job' });

  const entry = {
    id: db.nextId.entry++,
    employee_id: empId,
    job_id: jobId,
    clock_in: new Date().toISOString(),
    clock_out: null
  };
  db.entries.push(entry);
  save(db);

  res.json({ id: entry.id, clock_in: entry.clock_in, employee: employee.name, job: job.name });
});

// --- Clock Out ---
app.post('/api/clock-out', (req, res) => {
  const { employee_id } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'Employee required' });
  const db = load();

  const empId = parseInt(employee_id);
  const entry = db.entries.find(e => e.employee_id === empId && !e.clock_out);
  if (!entry) return res.status(400).json({ error: 'Not currently clocked in' });

  entry.clock_out = new Date().toISOString();
  save(db);

  const employee = db.employees.find(e => e.id === empId);
  const job = db.jobs.find(j => j.id === entry.job_id);
  const hours = ((new Date(entry.clock_out) - new Date(entry.clock_in)) / 3600000).toFixed(2);

  res.json({ clock_out: entry.clock_out, employee: employee.name, job: job.name, hours });
});

// --- Admin: All entries ---
app.get('/api/entries', (req, res) => {
  const { date } = req.query;
  const db = load();

  let entries = db.entries.map(e => {
    const employee = db.employees.find(emp => emp.id === e.employee_id);
    const job = db.jobs.find(j => j.id === e.job_id);
    return {
      id: e.id,
      employee: employee ? employee.name : 'Unknown',
      job: job ? job.name : 'Unknown',
      clock_in: e.clock_in,
      clock_out: e.clock_out
    };
  });

  if (date) {
    entries = entries.filter(e => e.clock_in.slice(0, 10) === date);
  }

  entries.sort((a, b) => new Date(b.clock_in) - new Date(a.clock_in));
  res.json(entries);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Time tracker running on port ${PORT}`));
