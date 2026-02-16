import dbConnect from '../../../lib/mongodb';
import checkAdminAuth from '../../../lib/checkAdminAuth';
import Problem from '../../../models/Problem';

export default async function handler(req, res) {
  await dbConnect();

  // Check admin auth
  const auth = await checkAdminAuth(req, res);
  if (!auth || !auth.success) {
    return res.status(auth.status || 401).json({ success: false, message: auth.message || 'Not authorized' });
  }

  if (req.method === 'GET') {
    try {
      const problems = await Problem.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: problems });
    } catch (error) {
      console.error('Error fetching problems:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
