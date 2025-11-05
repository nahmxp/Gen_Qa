# General Q&A — Community Knowledge Platform

<p align="center">
  <img src="public/images/Icon.png" alt="General Q&A Logo" width="120">
</p>

<p align="center">
  <b>A community-driven platform for asking questions and sharing knowledge</b>
</p>

General Q&A is a community-focused platform where users can ask questions, share problems, and help others find answers across various topics.

## 📚 Project Overview

General Q&A provides a simple, user-friendly platform for knowledge sharing:

- **Community-Driven**: Users can ask questions and share problems
- **Problem Sharing**: Dedicated system for sharing and discussing problems
- **Admin Moderation**: Administrators can manage issues and user problems
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
- Role-based access (User/Admin)

### 2. Problem Sharing
- Users can share problems and issues
- Community engagement with problems
- Admin moderation and management

### 3. Admin Dashboard
- User management
- Problem/issue management
- Analytics and reporting

### 4. User Experience
- Clean, intuitive interface
- Dark/Light theme toggle
- Responsive mobile design

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
│   └── withAuth.js        # User route protection HOC
│
├── models/                # MongoDB schemas
│   ├── PickupRequest.js   # Pickup request model
│   ├── Problem.js         # Problem/issue model
│   └── User.js            # User account model
│
├── pages/                 # Application routes and API endpoints
│   ├── _app.js            # Next.js app initialization
│   ├── _document.js       # HTML document customization
│   ├── about.js           # About page
│   ├── contact.js         # Contact information page
│   ├── dashboard.js       # Admin dashboard
│   ├── home.js            # Homepage
│   ├── index.js           # Root route (redirects to home)
│   ├── login.js           # User authentication
│   ├── profile.js          # User profile management
│   ├── signup.js          # New user registration
│   ├── share-problem.js   # Share a problem page
│   ├── pickup-request.js  # Pickup request page
│   ├── my-pickup-requests.js # User's pickup requests
│   ├── all-pickup-requests.js # All pickup requests (admin)
│   │
│   ├── admin/             # Admin pages
│   │   └── issues.js       # Problem management
│   │
│   └── api/               # Backend API routes
│       ├── auth/          # Authentication endpoints
│       ├── admin/         # Admin-only endpoints
│       ├── problems.js    # Problem management endpoints
│       ├── pickup-requests.js # Pickup request endpoints
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
- Share problems and issues
- View community problems
- Submit pickup requests
- View own pickup requests

### Administrator
- All regular user capabilities
- Manage user accounts
- Moderate problems and issues
- Manage pickup requests
- Access admin dashboard
- View platform analytics

## 🔄 Key Features

### Problem Sharing
Users can share problems they're facing, allowing the community to help find solutions.

### Pickup Requests
Users can submit pickup requests for various services.

### Admin Management
Administrators can manage all user-generated content, moderate issues, and oversee platform operations.

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
