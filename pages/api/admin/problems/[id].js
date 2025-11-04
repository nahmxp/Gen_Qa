import dbConnect from '../../../../lib/mongodb';
import checkAdminAuth from '../../../../lib/checkAdminAuth';
import Problem from '../../../../models/Problem';

export default async function handler(req, res) {
  await dbConnect();

  const auth = await checkAdminAuth(req, res);
  if (!auth || !auth.success) {
    return res.status(auth.status || 401).json({ success: false, message: auth.message || 'Not authorized' });
  }

  const {
    query: { id },
    method,
  } = req;

  if (method === 'PATCH') {
    try {
      const { status } = req.body || {};
      if (!status || !['open','in-progress','closed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const problem = await Problem.findById(id);
      if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

      problem.status = status;
      await problem.save();

      return res.status(200).json({ success: true, data: problem });
    } catch (err) {
      console.error('Error updating problem status', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
