import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { generateToken, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Prevent caching on Vercel
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  
  await dbConnect();
  
  const { username, password } = req.body;
  // Accept either username or email
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Email/Username and password are required' });
  }
  // Try to find user by username or email
  const user = await User.findOne({
    $or: [
      { username: username },
      { email: username }
    ]
  }).select('+password');
  // Check if user exists
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  // Set cookie with token
  setTokenCookie(res, token);
  
  // Return user data (without password)
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin || user.role === 'admin',
      role: user.role || (user.isAdmin ? 'admin' : 'user')
    }
  });
} 