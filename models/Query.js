import mongoose from 'mongoose';

const QuerySchema = new mongoose.Schema({
  personName: { type: String, required: true, trim: true },
  contactInfo: { type: String, trim: true }, // Phone or email
  location: { type: String, required: true, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
  category: { 
    type: String, 
    enum: ['Infrastructure', 'Health', 'Education', 'Agriculture', 'Water', 'Electricity', 'Transportation', 'Communication', 'Other'], 
    required: true 
  },
  problemTitle: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  urgency: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  adminNotes: { type: String, trim: true },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who collected this
  status: { type: String, enum: ['collected', 'reviewed', 'in-progress', 'resolved'], default: 'collected' },
}, { timestamps: true });

// Hardened model registration for Next.js hot reload
delete mongoose.connection.models['Query'];
let Query;
try {
  Query = mongoose.model('Query');
} catch (e) {
  Query = mongoose.model('Query', QuerySchema);
}

export default Query;

