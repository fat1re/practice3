import { pool } from '../database';

export interface Feedback {
  id: number;
  repair_request_id: number;
  rating: number;
  comment: string;
  client_name?: string;
  created_at: string;
}

export class FeedbackModel {
  static async getFeedbackByRequestId(requestId: number): Promise<Feedback[]> {
    const result = await pool.query(
      'SELECT * FROM feedback WHERE repair_request_id = $1 ORDER BY created_at DESC',
      [requestId]
    );
    return result.rows;
  }

  static async createFeedback(
    requestId: number,
    rating: number,
    comment: string,
    clientName?: string
  ): Promise<Feedback> {
    const result = await pool.query(
      'INSERT INTO feedback (repair_request_id, rating, comment, client_name, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [requestId, rating, comment, clientName || 'Аноним']
    );
    return result.rows[0];
  }

  static async deleteFeedback(feedbackId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM feedback WHERE id = $1',
      [feedbackId]
    );
    return result.rowCount! > 0;
  }

  static async getAllFeedbacks(): Promise<Feedback[]> {
    const result = await pool.query('SELECT * FROM feedback ORDER BY created_at DESC');
    return result.rows;
  }
}
