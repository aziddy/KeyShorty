import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new Database('shortcuts.db');

app.use(cors());
app.use(express.json());

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS shortcuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER,
    key_combination TEXT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id)
  );
`);

// Get all applications
app.get('/api/applications', (req, res) => {
  const applications = db.prepare('SELECT * FROM applications').all();
  res.json(applications);
});

// Add new application
app.post('/api/applications', (req, res) => {
  const { name } = req.body;
  try {
    const result = db.prepare('INSERT INTO applications (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get shortcuts for an application
app.get('/api/applications/:id/shortcuts', (req, res) => {
  const shortcuts = db.prepare('SELECT * FROM shortcuts WHERE application_id = ?').all(req.params.id);
  res.json(shortcuts);
});

// Add new shortcut
app.post('/api/shortcuts', (req, res) => {
  const { application_id, key_combination, description } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO shortcuts (application_id, key_combination, description) VALUES (?, ?, ?)'
    ).run(application_id, key_combination, description);
    res.json({ id: result.lastInsertRowid, application_id, key_combination, description });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an application
app.delete('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  try {
    // First delete all shortcuts associated with the application
    db.prepare('DELETE FROM shortcuts WHERE application_id = ?').run(id);
    // Then delete the application
    const result = db.prepare('DELETE FROM applications WHERE id = ?').run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a shortcut
app.delete('/api/shortcuts/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM shortcuts WHERE id = ?').run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Shortcut not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 