import dbConnect from '../../../../lib/mongodb';
import checkAdminAuth from '../../../../lib/checkAdminAuth';
import Query from '../../../../models/Query';

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
      const { status, adminNotes } = req.body || {};
      
      if (status && !['collected', 'reviewed', 'in-progress', 'resolved'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: 'No update data provided' });
      }

      const query = await Query.findByIdAndUpdate(id, updateData, { new: true }).populate('collectedBy', 'name email');
      if (!query) return res.status(404).json({ success: false, message: 'Query not found' });

      return res.status(200).json({ success: true, data: query });
    } catch (err) {
      console.error('Error updating query status', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}

