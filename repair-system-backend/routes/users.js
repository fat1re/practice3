app.post('/api/users', authenticate, authMiddleware(['Manager']), async (req, res) => {
  const { login, password, fio, phone, role } = req.body;
  
  try {
    const result = await db.query(
      'INSERT INTO users (login, password, fio, phone, role) VALUES (?, SHA2(?, 256), ?, ?, ?)',
      [login, password, fio, phone, role]
    );
    res.json({ id: result.insertId, login, fio, role });
  } catch (err) {
    res.status(400).json({ error: 'Пользователь уже существует' });
  }
});

app.delete('/api/users/:id', authenticate, authMiddleware(['Manager']), async (req, res) => {
  const { id } = req.params;
  
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  res.json({ success: true });
});