# General Q&A — Community Knowledge Platform

<p align="center">
  <img src="public/images/icon.png" alt="General Q&A Logo" width="120">
</p>

<p align="center">
  <b>A community-driven platform for asking questions and sharing knowledge</b>
</p>

General Q&A is a community-focused platform where users can ask questions, share problems, and help others find answers across various topics. The platform includes a comprehensive query collection system for enumerators and administrators to manage and track community issues.

## 📚 Project Overview

General Q&A provides a simple, user-friendly platform for knowledge sharing:

- **Community-Driven**: Users can ask questions and share problems
- **Problem Sharing**: Dedicated system for sharing and discussing problems with location tracking
- **Query Collection**: Enumerators can collect queries from the field with detailed information
- **Role-Based Access**: Three-tier role system (User, Enumerator, Admin)
- **Admin Moderation**: Administrators can manage issues, queries, and provide feedback
- **User Tracking**: Users can track their submitted issues and collected queries
- **Admin Remarks**: Administrators can add feedback and remarks on issues and queries
- **User Profiles**: Personal profiles and account management
- **Clean Interface**: Modern, responsive design with dark/light theme support

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: CSS-in-JS with styled-jsx, custom theming system
- **State Management**: React Context API
- **Responsive Design**: Mobile-first approach

### Backend
- **API Framework**: Next.js API routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom JWT implementation with HTTP-only cookies

### Deployment
- **Hosting**: Vercel (recommended)
- **CI/CD**: Automated deployments via GitHub

## 🔍 Core Features

### 1. User Management
- User registration and authentication
- Profile management
- Three-tier role system: User, Enumerator, Admin
- Admin can create users and assign roles
- Role-based access control throughout the platform

### 2. Problem Sharing
- Users can share problems and issues with mandatory location
- Automatic geolocation support with reverse geocoding
- Location tracking with coordinates and map links
- Status tracking (open, in-progress, closed)
- Users can view their submitted issues and status
- Admin remarks/feedback visible to users

### 3. Query Collection System
- Enumerators can collect queries from the field
- Detailed query information: person name, contact, location, category, urgency
- Query status tracking (collected, reviewed, in-progress, resolved)
- Enumerators and admins can view their collected queries
- Location tracking with coordinates and map integration
- Admin remarks/feedback on queries

### 4. Admin Dashboard
- User management with role assignment
- Issue management with status updates and remarks
- Query management with status updates and remarks
- View all issues and queries
- Add admin remarks/feedback on issues and queries

### 5. User Tracking
- **My Submitted Issues**: Users can view their submitted issues with status and admin remarks
- **My Query Submissions**: Enumerators and admins can view their collected queries with status and admin remarks
- Real-time status updates
- Location details with map links

### 6. Admin Remarks System
- Administrators can add optional feedback/remarks on issues
- Administrators can add optional feedback/remarks on queries
- Remarks visible to users on their submitted issues
- Remarks visible to enumerators on their collected queries
- Yellow-highlighted section for easy identification

### 7. User Experience
- Clean, intuitive interface
- Dark/Light theme toggle
- Responsive mobile design
- Location-based features with geolocation API

## 📁 Project Structure

```
Gen_Qa/
├── components/            # Reusable UI components
│   ├── ImageCarousel.js   # Image slideshow component
│   ├── Layout.js          # Main app layout with navigation
│   ├── SearchBar.js       # Search interface
│   └── ThemeToggle.js     # Light/dark mode toggle
│
├── lib/                   # Core utilities and context providers
│   ├── auth.js            # Authentication utilities
│   ├── AuthContext.js     # Auth state management
│   ├── checkAdminAuth.js  # Admin authentication middleware
│   ├── email.js           # Email notification system
│   ├── middleware.js      # Request middleware
│   ├── mongodb.js         # Database connection manager
│   ├── session.js         # Session handling
│   ├── ThemeContext.js    # Theme state management
│   ├── withAdminAuth.js   # Admin route protection HOC
│   ├── withAuth.js        # User route protection HOC
│   └── withEnumeratorAuth.js # Enumerator route protection HOC
│
├── models/                # MongoDB schemas
│   ├── Problem.js         # Problem/issue model with adminNotes
│   ├── Query.js           # Query collection model
│   └── User.js            # User account model with role system
│
├── pages/                 # Application routes and API endpoints
│   ├── _app.js            # Next.js app initialization
│   ├── _document.js       # HTML document customization
│   ├── about.js           # About page
│   ├── contact.js         # Contact information page
│   ├── dashboard.js       # Admin dashboard (user management)
│   ├── home.js            # Homepage
│   ├── index.js           # Root route (redirects to home)
│   ├── login.js           # User authentication
│   ├── profile.js         # User profile management
│   ├── signup.js          # New user registration
│   ├── share-problem.js   # Share a problem page (with location)
│   ├── my-issues.js       # User's submitted issues
│   ├── query-collection.js # Query collection page (enumerator/admin)
│   ├── my-query-submissions.js # My collected queries (enumerator/admin)
│   │
│   ├── admin/             # Admin pages
│   │   ├── issues.js       # All issues management
│   │   └── queries.js      # All queries management
│   │
│   └── api/               # Backend API routes
│       ├── auth/          # Authentication endpoints
│       ├── admin/         # Admin-only endpoints
│       │   ├── problems/  # Admin problem management
│       │   └── queries/   # Admin query management
│       ├── problems.js    # Problem management endpoints (user issues)
│       ├── queries.js     # Query management endpoints
│       └── users.js       # User management endpoints
│
├── public/                # Static assets
│   └── images/            # Image assets
│
└── styles/                # Global styles
    └── globals.css        # Application-wide CSS
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- NPM or Yarn
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nahmxp/general-qa.git
cd general-qa
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Access the application**

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 User Roles & Permissions

### Regular User
- Create account and manage profile
- Share problems and issues with location tracking
- View own submitted issues and status
- View admin remarks on their issues

### Enumerator
- All regular user capabilities
- Collect queries from the field
- Access query collection page
- View own collected queries and status
- View admin remarks on their queries
- Cannot access admin dashboard or view all queries

### Administrator
- All regular user and enumerator capabilities
- Manage user accounts and assign roles
- Create new users with any role
- Moderate problems and issues
- Manage all queries
- Add remarks/feedback on issues and queries
- Access admin dashboard
- View all issues and queries
- View platform analytics

## 🔄 Key Features

### Problem Sharing
- Users can share problems they're facing with mandatory location
- Automatic geolocation detection with reverse geocoding
- Manual location entry option
- Location details with coordinates and map links
- Status tracking (open, in-progress, closed)
- Users can view their submitted issues and admin remarks

### Query Collection System
- Enumerators and admins can collect queries from the field
- Comprehensive query form: person name, contact info, location, category, urgency, description
- Automatic location detection or manual entry
- Query status tracking (collected, reviewed, in-progress, resolved)
- Enumerators can view their collected queries
- Admin remarks visible on queries

### Location Features
- Automatic device geolocation support
- Reverse geocoding using OpenStreetMap Nominatim API
- Manual location entry fallback
- Coordinate tracking (latitude/longitude)
- Google Maps integration for location viewing
- Location displayed in issues and queries

### Admin Remarks System
- Administrators can add optional feedback on issues and queries
- Remarks visible to users on their submitted issues
- Remarks visible to enumerators on their collected queries
- Yellow-highlighted section for easy identification
- Can be updated at any time by admins

### Admin Management
- Administrators can manage all user-generated content
- Moderate issues and queries with status updates
- Add remarks/feedback on issues and queries
- User management with role assignment
- Oversee platform operations

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

Project Owner: [nahmxp](https://github.com/nahmxp)

---

<p align="center">
  General Q&A - Ask, Answer, Discover
</p>
