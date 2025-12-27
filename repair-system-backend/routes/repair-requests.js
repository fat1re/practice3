// GET /api/repair-requests/:id/feedback
app.get('/api/repair-requests/:id/feedback', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const feedbacks = await db.query(
      'SELECT * FROM feedback WHERE repair_request_id = ? ORDER BY created_at DESC',
      [id]
    );
    const avg = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : null;
    res.json({ feedbacks, averageRating: avg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/specialists/stats
app.get('/api/users/specialists/stats', authenticate, async (req, res) => {
  try {
    const specs = await db.query(`
      SELECT u.id, u.fio, u.phone, u.role,
             COUNT(rr.id) as completed_requests,
             AVG(f.rating) as average_rating
      FROM users u
      LEFT JOIN repair_requests rr ON u.id = rr.master_id AND rr.status = 'Завершена'
      LEFT JOIN feedback f ON rr.id = f.repair_request_id
      WHERE u.role = 'Specialist'
      GROUP BY u.id
      ORDER BY completed_requests DESC
    `);
    res.json(specs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
