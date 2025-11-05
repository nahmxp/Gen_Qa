import dbConnect from '../../lib/mongodb';
import Query from '../../models/Query';
import { getTokenFromRequest, verifyToken } from '../../lib/auth';
import User from '../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { personName, contactInfo, location, latitude, longitude, category, problemTitle, description, urgency, adminNotes } = req.body || {};

      // Validation
      if (!personName || !location || !category || !problemTitle || !description) {
        return res.status(400).json({ 
          success: false, 
          message: 'Person name, location, category, title, and description are required' 
        });
      }

      // Get enumerator/admin user ID from token
      let collectorId = null;
      try {
        const token = await getTokenFromRequest(req);
        if (token) {
          const decoded = verifyToken(token);
          if (decoded && decoded.id) {
            // Verify user is enumerator or admin
            const user = await User.findById(decoded.id);
            if (!user) {
              return res.status(403).json({ success: false, message: 'User not found' });
            }
            const userRole = user.role || (user.isAdmin ? 'admin' : 'user');
            if (userRole !== 'enumerator' && userRole !== 'admin') {
              return res.status(403).json({ success: false, message: 'Enumerator or admin access required' });
            }
            collectorId = decoded.id;
          }
        }
      } catch (e) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (!collectorId) {
        return res.status(401).json({ success: false, message: 'Enumerator or admin authentication required' });
      }

      const query = new Query({
        personName: personName.trim(),
        contactInfo: contactInfo ? contactInfo.trim() : '',
        location: location.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        category,
        problemTitle: problemTitle.trim(),
        description: description.trim(),
        urgency: urgency || 'Medium',
        adminNotes: adminNotes ? adminNotes.trim() : '',
        collectedBy: collectorId,
        status: 'collected'
      });

      await query.save();

      return res.status(201).json({ success: true, data: query });
    } catch (error) {
      console.error('Error creating query:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      // Check if this is a request for user's own queries
      const isMyQueries = req.query.my === 'true';
      
      // Get user ID from token
      let userId = null;
      try {
        const token = await getTokenFromRequest(req);
        if (token) {
          const decoded = verifyToken(token);
          if (decoded && decoded.id) {
            const user = await User.findById(decoded.id);
            if (!user) {
              return res.status(403).json({ success: false, message: 'User not found' });
            }
            
            if (isMyQueries) {
              // For "my queries", verify user is enumerator or admin
              const userRole = user.role || (user.isAdmin ? 'admin' : 'user');
              if (userRole !== 'enumerator' && userRole !== 'admin') {
                return res.status(403).json({ success: false, message: 'Enumerator or admin access required' });
              }
              userId = decoded.id;
            } else {
              // For all queries, verify user is admin
              if (!user.isAdmin && user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Admin access required' });
              }
              userId = decoded.id;
            }
          }
        }
      } catch (e) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // Fetch queries based on request type
      let queries;
      if (isMyQueries) {
        // Fetch queries collected by this user
        queries = await Query.find({ collectedBy: userId })
          .sort({ createdAt: -1 })
          .populate('collectedBy', 'name email')
          .lean();
      } else {
        // Fetch all queries (admin only)
        queries = await Query.find()
          .sort({ createdAt: -1 })
          .populate('collectedBy', 'name email')
          .lean();
      }
      
      return res.status(200).json({ success: true, data: queries });
    } catch (error) {
      console.error('Error fetching queries:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

