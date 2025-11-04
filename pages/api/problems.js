import dbConnect from '../../lib/mongodb';
import Problem from '../../models/Problem';
import { getTokenFromRequest, verifyToken } from '../../lib/auth';
import User from '../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { title, description, email, anonymous } = req.body || {};

      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
      }

      // Try to attach user if token provided
      let userId = null;
      try {
        const token = await getTokenFromRequest(req);
        if (token) {
          const decoded = verifyToken(token);
          if (decoded && decoded.id) {
            userId = decoded.id;
          }
        }
      } catch (e) {
        // ignore token errors for anonymous submissions
      }

      const problem = new Problem({
        title,
        description,
        email: email || '',
        anonymous: !!anonymous,
        user: userId || null
      });

      await problem.save();

      return res.status(201).json({ success: true, data: problem });
    } catch (error) {
      console.error('Error creating problem:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Only POST supported
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
