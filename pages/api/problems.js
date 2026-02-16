import dbConnect from '../../lib/mongodb';
import Problem from '../../models/Problem';
import { getTokenFromRequest, verifyToken } from '../../lib/auth';
import User from '../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get user ID from token
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
        // ignore token errors
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // Fetch problems for this user
      const problems = await Problem.find({ user: userId }).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: problems });
    } catch (error) {
      console.error('Error fetching problems:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, email, anonymous, location, latitude, longitude } = req.body || {};

      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
      }

      if (!location) {
        return res.status(400).json({ success: false, message: 'Location is required' });
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
        location: location.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        user: userId || null
      });

      await problem.save();

      return res.status(201).json({ success: true, data: problem });
    } catch (error) {
      console.error('Error creating problem:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Only GET and POST supported
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
