import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  anonymous: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['open','in-progress','closed'], default: 'open' },
}, { timestamps: true });

// Hardened model registration for Next.js hot reload
delete mongoose.connection.models['Problem'];
let Problem;
try {
  Problem = mongoose.model('Problem');
} catch (e) {
  Problem = mongoose.model('Problem', ProblemSchema);
}

export default Problem;
