const db = require('../config/db');

exports.getTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const values = [req.user.id];
    let sql =
      'SELECT id, title, due_date AS dueDate, is_completed AS isCompleted, created_at AS createdAt FROM tasks WHERE user_id = ?';

    if (date) {
      sql += ' AND due_date = ?';
      values.push(date);
    }

    sql += ' ORDER BY due_date ASC, created_at DESC';

    const [rows] = await db.query(sql, values);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Le titre et la date sont obligatoires.' });
    }

    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, due_date, is_completed) VALUES (?, ?, ?, false)',
      [req.user.id, title, dueDate]
    );

    const [rows] = await db.query(
      'SELECT id, title, due_date AS dueDate, is_completed AS isCompleted, created_at AS createdAt FROM tasks WHERE id = ? AND user_id = ?',
      [result.insertId, req.user.id]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { title, dueDate, isCompleted } = req.body;

    const [existing] = await db.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [
      taskId,
      req.user.id
    ]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tache introuvable.' });
    }

    await db.query(
      `UPDATE tasks
       SET title = COALESCE(?, title),
           due_date = COALESCE(?, due_date),
           is_completed = COALESCE(?, is_completed)
       WHERE id = ? AND user_id = ?`,
      [title, dueDate, isCompleted, taskId, req.user.id]
    );

    const [rows] = await db.query(
      'SELECT id, title, due_date AS dueDate, is_completed AS isCompleted, created_at AS createdAt FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.user.id]
    );

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [
      taskId,
      req.user.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tache introuvable.' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};