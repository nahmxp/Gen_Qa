import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import { useAuth } from '../lib/AuthContext';

export default function Layout({ children }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showCookieWarning, setShowCookieWarning] = useState(false);
  
  console.log('user:', user);
  // Force re-render of navigation when authentication status changes
  const [navKey, setNavKey] = useState(0);
  
  useEffect(() => {
    // Update navigation key when auth state changes
    setNavKey(prevKey => prevKey + 1);
  }, [isAuthenticated, isAdmin, user]);

  // Load wishlist count
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setWishlistCount(0);
      return;
    }

    const fetchWishlistCount = async () => {
      try {
        // Try to fetch wishlist from API first
        const response = await fetch('/api/user/wishlist');
        if (response.ok) {
          const wishlistData = await response.json();
          const items = wishlistData.items || [];
          setWishlistCount(items.length);
          return;
        }
      } catch (error) {
        console.error('Error fetching wishlist from API:', error);
      }

      // Fallback to localStorage if API fails
      try {
        const userKey = `wishlist_${user._id}`;
        const savedWishlist = JSON.parse(localStorage.getItem(userKey) || '[]');
        setWishlistCount(savedWishlist.length);
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
      }
    };

    fetchWishlistCount();
    
    // Custom event for updating wishlist count from within the app
    const handleCustomWishlistUpdate = (event) => {
      // Only update if event is for current user
      if (!event.detail || event.detail.userId === user._id) {
        fetchWishlistCount();
      }
    };
    
    window.addEventListener('wishlist-updated', handleCustomWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlist-updated', handleCustomWishlistUpdate);
    };
  }, [isAuthenticated, user]);

  // Load cart count
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      try {
        // Try to fetch cart from API first
        const response = await fetch('/api/user/cart');
        if (response.ok) {
          const cartData = await response.json();
          const items = cartData.items || [];
          const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(totalItems);
          return;
        }
      } catch (error) {
        console.error('Error fetching cart from API:', error);
      }

      // Fallback to localStorage if API fails
      try {
        const userKey = `cart_${user._id}`;
        const savedCart = JSON.parse(localStorage.getItem(userKey) || '[]');
        const totalItems = savedCart.reduce((total, item) => total + (item.quantity || 1), 0);
        setCartCount(totalItems);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    };

    fetchCartCount();
    
    // Custom event for updating cart count from within the app
    const handleCustomCartUpdate = (event) => {
      // Only update if event is for current user
      if (!event.detail || event.detail.userId === user._id) {
        fetchCartCount();
      }
    };
    
    window.addEventListener('cart-updated', handleCustomCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCustomCartUpdate);
    };
  }, [isAuthenticated, user]);

  // Check if cookies are enabled
  useEffect(() => {
    try {
      document.cookie = 'testcookie=1; SameSite=Strict';
      if (document.cookie.indexOf('testcookie=1') === -1) {
        setShowCookieWarning(true);
      }
      // Clean up test cookie
      document.cookie = 'testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch {
      setShowCookieWarning(true);
    }
  }, []);
  
  // Function to check if a path is active
  const isActive = (path) => {
    return router.pathname === path ? 'active' : '';
  };
  
  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
  // Prevent rendering header navigation before auth state is determined
  if (loading) {
    return (
      <div className="layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    // Close admin dropdown if open
    if (adminDropdownOpen) setAdminDropdownOpen(false);
  };
  
  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
    // Close profile dropdown if open
    if (profileDropdownOpen) setProfileDropdownOpen(false);
  };

  return (
    <div>
      {showCookieWarning && (
        <div className="cookie-warning-modal">
          <div className="cookie-warning-content">
            <h3>Cookies Required</h3>
            <p>
              This site requires cookies to keep you logged in and provide a secure reading experience.<br />
              Please enable cookies in your browser settings and disable any extensions that block cookies.
            </p>
            <button className="btn-primary" onClick={() => setShowCookieWarning(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      <header className="main-header">
        <div className="container">
          <div className="logo">
            <Link href="/home">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src="/images/Icon.png"
                  alt="General Q&A Logo"
                  style={{ height: '40px', marginRight: '10px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                <div className="site-name" style={{ marginLeft: '8px', fontWeight: 700 }}>General Q&amp;A</div>
              </div>
            </Link>
          </div>
          
          {/* <div className="header-search">
            <SearchBar />
          </div> */}
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
          
          <nav key={navKey} className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}> 
            <ul className="nav-links">
              <li className={isActive('/home')}><Link href="/home" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
              <li className={isActive('/about')}><Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link></li>
              <li className={isActive('/catalog')}><Link href="/catalog" onClick={() => setMobileMenuOpen(false)}>Categories</Link></li>
              <li className={isActive('/add-product')}><Link href="/add-product" onClick={() => setMobileMenuOpen(false)}>Ask a Question</Link></li>
              <li className={isActive('/share-problem')}><Link href="/share-problem" onClick={() => setMobileMenuOpen(false)}>Share a Problem</Link></li>
              <li className={isActive('/contact')}><Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
              {/* ...existing code... */}
              {isAuthenticated && isAdmin && (
                <li className={`admin-dropdown ${adminDropdownOpen ? 'open' : ''}`}>
                  <button 
                    onClick={() => {
                      toggleAdminDropdown();
                      setMobileMenuOpen(false);
                    }}
                    className="admin-dropdown-toggle"
                  >
                    <span className="admin-icon">👑</span>
                    Admin Options
                    <span className="dropdown-arrow">{adminDropdownOpen ? '▲' : '▼'}</span>
                  </button>
                  {adminDropdownOpen && (
                    <ul className="admin-dropdown-menu">
                      <li className={isActive('/add-product')}>
                        <Link href="/add-product" onClick={() => {
                          setAdminDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}>
                          Add Product
                        </Link>
                      </li>
                        <li className={isActive('/admin/issues')}>
                          <Link href="/admin/issues" onClick={() => {
                            setAdminDropdownOpen(false);
                            setMobileMenuOpen(false);
                          }}>
                            All Issues
                          </Link>
                        </li>
                      <li className={isActive('/dashboard')}>
                        <Link href="/dashboard" onClick={() => {
                          setAdminDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}>
                          Users Dashboard
                        </Link>
                      </li>
                      <li className={isActive('/all-orders')}>
                        <Link href="/all-orders" onClick={() => {
                          setAdminDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}>
                          All Orders
                        </Link>
                      </li>

                    </ul>
                  )}
                </li>
              )}
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="mobile-auth-buttons">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="login-btn">Log In</button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="login-btn">Sign Up</button>
                  </Link>
                </div>
              )}
            </ul>
          </nav>
          
          <div className="header-actions">
            {isAuthenticated && (
              <>
                <Link href="/wishlist" className="wishlist-icon-link">
                  <div className="wishlist-icon">
                    <span className="wishlist-heart">♥</span>
                    {wishlistCount > 0 && (
                      <span className="wishlist-badge">{wishlistCount}</span>
                    )}
                  </div>
                </Link>
                <Link href="/cart" className="cart-icon-link">
                  <div className="cart-icon">
                    <span className="cart-basket">🛒</span>
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </div>
                </Link>
              </>
            )}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="user-profile">
                <button 
                  className="profile-button" 
                  onClick={toggleProfileDropdown}
                  aria-label="User profile"
                >
                  <span className="user-initial">{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
                  <span className="user-name">{user?.name || user?.username}</span>
                  {isAdmin && <span className="admin-badge" title="Administrator">Admin</span>}
                </button>
                
                {profileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-header">
                      <p className="profile-name">{user?.name}</p>
                      <p className="profile-email">{user?.email}</p>
                      {isAdmin && <p className="profile-role">Administrator</p>}
                    </div>
                    <ul>
                      <li>
                        <Link href="/profile" onClick={() => setProfileDropdownOpen(false)}>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link href="/wishlist" onClick={() => setProfileDropdownOpen(false)}>
                          Wishlist
                        </Link>
                      </li>
                      <li>
                        <Link href="/cart" onClick={() => setProfileDropdownOpen(false)}>
                          Cart
                        </Link>
                      </li>
                      <li>
                        <Link href="/orders" onClick={() => setProfileDropdownOpen(false)}>
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link href="/my-library" onClick={() => setProfileDropdownOpen(false)}>
                          My Courses
                        </Link>
                      </li>

                      {isAdmin && (
                        <li className="admin-section-header">Admin Options</li>
                      )}
                      {isAdmin && (
                        <li>
                          <Link href="/dashboard" onClick={() => setProfileDropdownOpen(false)}>
                            Users Dashboard
                          </Link>
                        </li>
                      )}
                      {isAdmin && (
                        <li>
                          <Link href="/all-orders" onClick={() => setProfileDropdownOpen(false)}>
                            All Orders
                          </Link>
                        </li>
                      )}
                      {isAdmin && (
                        <li>
                          <Link href="/add-product" onClick={() => setProfileDropdownOpen(false)}>
                            Add Product
                          </Link>
                        </li>
                      )}
                      <li>
                        <button onClick={handleLogout}>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/login">
                  <button className="login-btn">Log In</button>
                </Link>
                <Link href="/signup">
                  <button className="login-btn">Sign Up</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
      {profileDropdownOpen && <div className="dropdown-overlay" onClick={toggleProfileDropdown}></div>}
      {adminDropdownOpen && <div className="dropdown-overlay" onClick={toggleAdminDropdown}></div>}
      
      <main className="container">
        {children}
      </main>
      
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col footer-brand">
              <img src="/images/Icon.png" alt="General Q&A Logo" className="footer-logo" />
              <p className="footer-desc">General Q&amp;A is a community-driven platform for asking and answering questions across a wide range of topics. Share knowledge, help others, and learn together.</p>
              <div className="footer-socials">
                <a href="#" aria-label="Twitter" className="footer-social"><span>�</span></a>
                <a href="#" aria-label="Email" className="footer-social"><span>✉️</span></a>
                <a href="#" aria-label="GitHub" className="footer-social"><span>�</span></a>
              </div>
            </div>
            <div className="footer-col footer-links">
              <div className="footer-section">
                <div className="footer-section-title">Explore</div>
                <a href="/catalog" className="footer-link">Browse Categories</a>
                <a href="/home" className="footer-link">Home</a>
                <a href="/about" className="footer-link">About</a>
              </div>
              <div className="footer-section">
                  <div className="footer-section-title">Community</div>
                  <a href="/add-product" className="footer-link">Ask a Question</a>
                  <a href="/share-problem" className="footer-link">Share a Problem</a>
                  <a href="/wishlist" className="footer-link">My Profile</a>
                  <a href="/contact" className="footer-link">Contact Support</a>
              </div>
            </div>
            <div className="footer-col footer-contact">
              <div className="footer-section-title">Contact</div>
              <div className="footer-contact-item"><span className="footer-contact-icon">📞</span> +1 (555) 555-5555</div>
              <div className="footer-contact-item"><span className="footer-contact-icon">✉️</span> support@generalqa.example</div>
              <div className="footer-section-title">Address</div>
              <div className="footer-contact-item"><span className="footer-contact-icon">📍</span> 123 Knowledge Street, Suite 100, Anytown, Country</div>
            </div>
            <div className="footer-col footer-map">
              <iframe
                title="Map Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=90.4000%2C23.7800%2C90.4100%2C23.7900&amp;layer=mapnik"
                style={{ border: 0, width: '100%', height: '180px', borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="footer-bottom">
            <p>&copy; 2025 General Q&amp;A. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .main-footer {
          background: #fff;
          margin-top: 4rem;
          padding: 0;
          border-top: 1px solid #eee;
        }
        .footer-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2.5rem 2rem 0.5rem 2rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 2fr 2fr 2fr;
          gap: 2rem;
          align-items: flex-start;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .footer-brand {
          align-items: flex-start;
        }
        .footer-logo {
          width: 120px;
          height: auto;
          margin-bottom: 1rem;
          border-radius: 12px;
        }
        .footer-desc {
          font-size: 1.05rem;
          color: #444;
          margin-bottom: 1rem;
        }
        .footer-socials {
          display: flex;
          gap: 1.2rem;
        }
        .footer-social {
          font-size: 1.3rem;
          color: #444;
          transition: color 0.2s;
        }
        .footer-social:hover {
          color: #a259e6;
        }
        .footer-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 0.5rem;
        }
        .footer-link {
          color: #444;
          text-decoration: none;
          font-size: 1rem;
          margin-bottom: 0.3rem;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #a259e6;
        }
        .footer-contact-item {
          font-size: 1rem;
          color: #444;
          margin-bottom: 0.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .footer-contact-icon {
          font-size: 1.2rem;
        }
        .footer-map {
          min-width: 180px;
          max-width: 100%;
        }
        .footer-divider {
          border: none;
          border-top: 1px solid #eee;
          margin: 2rem 0 1rem 0;
        }
        .footer-bottom {
          text-align: center;
          font-size: 1rem;
          color: #444;
          margin-bottom: 0.5rem;
        }
        @media (max-width: 1100px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .footer-map {
            margin-top: 2rem;
          }
        }
        @media (max-width: 700px) {
          .footer-container {
            padding: 1.2rem 0.5rem 0.5rem 0.5rem;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.2rem;
          }
          .footer-map {
            margin-top: 1rem;
          }
        }
        .admin-dropdown {
          position: relative;
        }
        
        .admin-dropdown-toggle {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-color);
          font-size: 1rem;
          padding: 10px 15px;
          transition: color 0.2s;
        }
        
        .admin-dropdown-toggle:hover {
          color: var(--primary-color);
        }
        
        .admin-icon {
          margin-right: 5px;
        }
        
        .dropdown-arrow {
          font-size: 0.7rem;
          margin-left: 5px;
        }
        
        .admin-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: var(--card-bg);
          border-radius: 8px;
          box-shadow: 0 5px 15px var(--shadow-color);
          min-width: 180px;
          padding: 5px 0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }
        
        .admin-dropdown-menu li {
          display: block;
          width: 100%;
          margin: 0;
        }
        
        .admin-dropdown-menu a {
          display: block;
          padding: 10px 15px;
          color: var(--text-color);
          text-decoration: none;
          transition: background-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        
        .admin-dropdown-menu a:hover {
          background-color: rgba(var(--accent-rgb), 0.1);
          color: var(--primary-color);
        }
        
        .admin-section-header {
          font-size: 0.8rem;
          font-weight: bold;
          color: var(--text-muted);
          padding: 10px 15px 5px;
          border-top: 1px solid var(--border-color);
          margin-top: 5px;
        }
        
        @media (max-width: 768px) {
          .admin-dropdown-menu {
            position: static;
            box-shadow: none;
            background: transparent;
            padding-left: 15px;
          }
        }
        
        /* LSSI-style Navigation */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          font-weight: 500;
          font-size: 1rem;
          margin-left: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .nav-links li {
          margin: 0;
          position: relative;
        }
        
        .nav-links li a {
          display: block;
          padding: 10px 0;
          font-weight: 500;
          font-size: 1rem;
          color: #333;
          text-decoration: none;
          transition: color 0.2s ease;
          letter-spacing: 0.3px;
        }
        
        .nav-links li a:hover {
          color: var(--primary-color);
        }
        
        .nav-links li.active a {
          color: var(--primary-color);
          font-weight: 600;
        }
        
        .nav-links li.active::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--primary-color);
        }
        
        /* LSSI-style Login Button */
        .login-btn {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          font-weight: 500;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(26, 54, 93, 0.2);
        }
        
        .login-btn:hover {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(26, 54, 93, 0.3);
        }
        
        /* Header styling improvements */
        .main-header {
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .main-header .container {
          padding: 0 2rem;
        }
        
        /* Logo styling to match LSSI */
        .logo .site-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          letter-spacing: 0.5px;
        }
        
        /* Mobile Auth Buttons */
        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 20px;
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        
        .mobile-auth-buttons .login-btn {
          width: 100%;
          text-align: center;
        }
        
        /* Responsive navigation */
        @media (max-width: 768px) {
          .nav-links {
            flex-direction: column;
            gap: 1rem;
            margin-left: 0;
            padding: 20px;
          }
          
          .nav-links li {
            width: 100%;
          }
          
          .nav-links li a {
            padding: 12px 0;
            font-size: 1.1rem;
          }
          
          /* Hide desktop auth buttons in mobile */
          .auth-buttons {
            display: none;
          }
        }
        
        /* Show mobile auth buttons only in mobile */
        @media (min-width: 769px) {
          .mobile-auth-buttons {
            display: none;
          }
        }
      `}</style>
    </div>
  );
} 