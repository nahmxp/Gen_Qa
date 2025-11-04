import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  // Basic info (works for both books and courses)
  title: String,           // Course title or Book title
  author: String,          // Instructor name (courses) or Author (books) - legacy: 'brand'
  instructor: String,      // Course instructor (alias for author)
  price: Number,
  description: String,
  coverImage: String,      // Course thumbnail or Book cover - legacy: 'image'
  category: String,
  
  // Course-specific metadata
  courseCode: String,      // Unique course identifier (replaces ISBN for courses)
  platform: String,        // Platform/Provider (replaces publisher for courses)
  courseStartDate: Date,   // When course starts (for courses)
  duration: {
    value: Number,         // Duration value (e.g., 8)
    unit: {                // Duration unit (e.g., 'weeks', 'months', 'hours')
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'weeks'
    }
  },
  skillLevel: {            // Course difficulty level (replaces ageRange for courses)
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'beginner'
  },
  modules: Number,         // Number of modules in course
  totalVideos: Number,     // Total recorded videos
  liveClasses: Number,     // Number of live classes
  projects: Number,        // Number of projects
  certificate: {
    type: Boolean,
    default: false
  },
  placementSupport: {      // Job placement support
    type: Boolean,
    default: false
  },
  prerequisites: [String], // Course prerequisites
  enrollmentCount: {       // Number of students enrolled
    type: Number,
    default: 0
  },
  
  // Legacy book-specific metadata (keeping for backward compatibility)
  isbn: String,
  publisher: String,
  publishedDate: Date,
  pageCount: Number,
  
  // Language (works for both)
  language: {
    type: String,
    default: 'English'
  },
  
  // Digital content and links (works for both courses and books)
  digitalContent: {
    hasContent: {
      type: Boolean,
      default: false
    },
    contentType: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'epub', 'txt', 'link', 'doi', 'external', 'video', 'course'],
      default: 'pdf'
    },
    contentUrl: String,      // File URL or external link
    fileName: String,        // Original file name
    fileSize: Number,        // File size in bytes
    doiNumber: String,       // For academic papers
    externalLink: String,    // For external resources
    linkDescription: String  // Description of what the link contains
  },
  
  // Target audience (flexible for both books and courses)
  targetAudience: {
    type: String,
    enum: ['kids', 'adults', 'higher-education', 'professionals', 'students', 'all'],
    required: false,         // Made optional for courses
    default: 'all'
  },
  
  // Age range for kids books (legacy - not used for courses)
  ageRange: {
    min: {
      type: Number,
      min: 0,
      max: 18
    },
    max: {
      type: Number,
      min: 0,
      max: 18
    }
  },
  
  // Format availability
  format: [{
    type: String,
    enum: ['digital', 'physical', 'live', 'recorded', 'hybrid'],
    default: 'digital'
  }],
  
  // Free vs paid content
  isFree: {
    type: Boolean,
    default: false
  },
  
  // Legacy rental fields (keeping for backward compatibility)
  isRentable: {
    type: Boolean,
    default: false
  },
  rentalPrice: {
    hourly: {
      type: Number,
      default: 0
    },
    daily: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
