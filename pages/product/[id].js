import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';

export default function ProductDetail() {
  const router = useRouter();
  const { id, action } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [transaction, setTransaction] = useState(null);
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/product/${id}`);
          
          if (!res.ok) {
            throw new Error('Product not found');
          }
          
          const data = await res.json();
          setProduct(data);

          // Fetch related courses from the same category
          fetchRelatedCourses(data.category);

          // Check if delete action is requested and user is admin
          if (action === 'delete' && isAdmin) {
            setTimeout(() => {
              deleteProduct();
            }, 100);
          }
        } catch (error) {
          console.error('Failed to fetch product', error);
          setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, action, isAdmin]);

  const fetchRelatedCourses = async (category) => {
    try {
      const res = await fetch(`/api/products?category=${category}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        // Filter out the current product
        const filtered = data.filter(course => course._id !== id).slice(0, 3);
        setRelatedCourses(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch related courses', error);
    }
  };

  // Check if user has access to this book
  useEffect(() => {
    if (id && isAuthenticated && user) {
      checkBookAccess();
    }
  }, [id, isAuthenticated, user]);

  const checkBookAccess = async () => {
    if (!id || !isAuthenticated) return;
    
    try {
      setCheckingAccess(true);
      const response = await fetch(`/api/books/${id}/access`);
      
      if (response.ok) {
        const data = await response.json();
        setHasAccess(data.hasAccess);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking book access:', error);
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const deleteProduct = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/product/${id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          router.push('/');
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleBuy = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Redirect to checkout page with product info
    router.push({
      pathname: '/checkout',
      query: {
        productId: product._id,
        productName: product.name,
        price: product.price,
        image: product.image,
        fromSingle: 'true'
      }
    });
  };

  const handleRent = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Redirect to checkout page with rental info
    router.push({
      pathname: '/checkout',
      query: {
        productId: product._id,
        productName: product.name,
        price: product.price,
        image: product.image,
        fromSingle: 'true',
        isRental: 'true',
        rentalPrices: JSON.stringify({
          hourly: product.rentalPrice?.hourly || 0,
          daily: product.rentalPrice?.daily || 0
        })
      }
    });
  };

  const handleAddToCart = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Set loading state
    setAddingToCart(true);
    
    try {
      // Get current cart from database
      const cartResponse = await fetch('/api/user/cart');
      let cart = [];
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        cart = cartData.items || [];
      }
      
      // Check if product already in cart
      const existingProductIndex = cart.findIndex(item => item.productId === product._id);
      
      if (existingProductIndex !== -1) {
        // Update existing product quantity
        cart[existingProductIndex].quantity = (cart[existingProductIndex].quantity || 1) + 1;
      } else {
        // Add new product to cart
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          brand: product.brand,
          category: product.category,
          image: product.image,
          description: product.description,
          isRentable: product.isRentable,
          rentalPrice: product.rentalPrice,
          quantity: 1
        });
      }
      
      // Update cart in database
      await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });
      
      // Also update localStorage as fallback
      const userKey = `cart_${user._id}`;
      localStorage.setItem(userKey, JSON.stringify(cart));
      
      setSuccessMessage(`${product.name} added to cart!`);
      
      // Dispatch custom event to update cart count in header
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { userId: user._id }
      }));
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Set loading state
    setAddingToWishlist(true);
    
    try {
      // Get current wishlist from database
      const wishlistResponse = await fetch('/api/user/wishlist');
      let wishlist = [];
      
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        wishlist = wishlistData.items || [];
      }
      
      // Check if product already in wishlist
      const productExists = wishlist.some(item => item.productId === product._id);
      
      // Only add if it doesn't already exist
      if (!productExists) {
        wishlist.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          brand: product.brand,
          category: product.category,
          image: product.image,
          description: product.description,
          isRentable: product.isRentable,
          rentalPrice: product.rentalPrice
        });
        
        // Update wishlist in database
        await fetch('/api/user/wishlist', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: wishlist }),
        });
        
        // Also update localStorage as fallback
        const userKey = `wishlist_${user._id}`;
        localStorage.setItem(userKey, JSON.stringify(wishlist));
        
        setSuccessMessage(`${product.name} added to wishlist!`);
        
        // Dispatch custom event to update wishlist count in header
        window.dispatchEvent(new CustomEvent('wishlist-updated', { 
          detail: { userId: user._id }
        }));
      } else {
        setSuccessMessage(`${product.name} is already in your wishlist!`);
      }
    } catch (error) {
      console.error('Failed to add to wishlist', error);
      alert('Failed to add product to wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }
  
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Course not found</div>;

  // Mock curriculum data (you can later fetch this from the database)
  const mockCurriculum = [
    {
      week: 0,
      title: "Getting Started",
      subtitle: "Pre-course preparation",
      videos: 15,
      liveClasses: 0,
      quizzes: 0,
      description: "Before the course starts, complete these foundational videos to strengthen your basics."
    },
    {
      week: 1,
      title: "Introduction & Fundamentals",
      subtitle: "Course foundation and core concepts",
      videos: 20,
      liveClasses: 2,
      quizzes: 1,
      description: "Learn the fundamental concepts and get started with your first project. Understand the core principles that will guide you throughout the course."
    },
    {
      week: 2,
      title: "Advanced Concepts",
      subtitle: "Deep dive into advanced topics",
      videos: 18,
      liveClasses: 2,
      quizzes: 1,
      description: "Master advanced techniques and best practices. Build real-world projects and learn industry-standard approaches."
    },
    {
      week: 3,
      title: "Real-World Projects",
      subtitle: "Apply your knowledge",
      videos: 25,
      liveClasses: 2,
      quizzes: 2,
      description: "Work on comprehensive projects that simulate real industry scenarios. Build your portfolio with impressive work."
    }
  ];

  return (
    <div className="course-detail-page">
      {successMessage && (
        <div className="success-banner">
          <div className="container">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="close-btn">×</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="course-hero">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/catalog">Courses</Link>
            <span className="separator">/</span>
            <span>{product.name || product.title}</span>
          </div>

          <div className="hero-content">
            <div className="hero-left">
              <h1 className="course-title">{product.name || product.title}</h1>
              <p className="course-intro">{product.description}</p>
              
              {isAdmin && (
                <div className="admin-controls">
                  <Link href={`/update-product/${product._id}`}>
                    <button className="btn-edit">✏️ Edit Course</button>
                  </Link>
                  <button className="btn-delete" onClick={deleteProduct}>🗑️ Delete</button>
                </div>
              )}
            </div>

            <div className="hero-right">
              <div className="course-card">
                <div className="course-image">
                  <img 
                    src={product.image || product.coverImage || '/images/hero/1-2.png'} 
                    alt={product.name} 
                  />
                  {hasAccess && product.digitalContent?.hasContent && (
                    <div className="play-overlay" onClick={() => router.push(`/reader/${product._id}`)}>
                      <div className="play-button">▶</div>
                      <p>Continue Learning</p>
                    </div>
                  )}
                </div>

                <div className="course-card-content">
                  <div className="price-section">
                    {product.isFree ? (
                      <h2 className="course-price">FREE</h2>
                    ) : (
                      <h2 className="course-price">৳{product.price}</h2>
                    )}
                  </div>

                  <div className="course-stats">
                    {product.liveClasses && (
                      <div className="stat-item">
                        <span className="stat-icon">📹</span>
                        <span className="stat-text">{product.liveClasses} Live Classes</span>
                      </div>
                    )}
                    {product.projects && (
                      <div className="stat-item">
                        <span className="stat-icon">💼</span>
                        <span className="stat-text">{product.projects} Projects</span>
                      </div>
                    )}
                    {product.totalVideos && (
                      <div className="stat-item">
                        <span className="stat-icon">🎬</span>
                        <span className="stat-text">{product.totalVideos} Pre-recorded Videos</span>
                      </div>
                    )}
                    {product.placementSupport && (
                      <div className="stat-item">
                        <span className="stat-icon">💼</span>
                        <span className="stat-text">Job Placement Support</span>
                      </div>
                    )}
                    {product.certificate && (
                      <div className="stat-item">
                        <span className="stat-icon">🎓</span>
                        <span className="stat-text">Certificate Included</span>
                      </div>
                    )}
                    <div className="stat-item">
                      <span className="stat-icon">⏰</span>
                      <span className="stat-text">Lifetime Access to Recordings</span>
                    </div>
                  </div>

                  <div className="enroll-actions">
                    {hasAccess && product.digitalContent?.hasContent ? (
                      <button 
                        className="btn-primary-large" 
                        onClick={() => router.push(`/reader/${product._id}`)}
                      >
                        🎓 Continue Learning
                      </button>
                    ) : (
                      <button 
                        className="btn-primary-large" 
                        onClick={handleBuy}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : '🚀 Enroll Now'}
                      </button>
                    )}
                    
                    <div className="secondary-actions">
                      <button 
                        className="btn-secondary" 
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                      >
                        {addingToCart ? '...' : '🛒 Add to Cart'}
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={handleAddToWishlist}
                        disabled={addingToWishlist}
                      >
                        {addingToWishlist ? '...' : '❤️ Wishlist'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Timeline Info */}
              <div className="timeline-info">
                {product.courseStartDate && (
                  <div className="timeline-item">
                    <h4>📅 Batch Starts</h4>
                    <p>{new Date(product.courseStartDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
                {product.duration && (
                  <div className="timeline-item">
                    <h4>⏱️ Duration</h4>
                    <p>{product.duration.value} {product.duration.unit}</p>
                  </div>
                )}
                {product.enrollmentCount && (
                  <div className="timeline-item">
                    <h4>👥 Students Enrolled</h4>
                    <p>{product.enrollmentCount} students</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Instructor Section */}
      <section className="section-instructor">
        <div className="container">
          <div className="instructor-card">
            <div className="instructor-avatar">
              <img src="/images/icon.png" alt="Instructor" />
            </div>
            <div className="instructor-info">
              <h3>Course Instructor</h3>
              <h2>{product.brand || product.author || product.instructor || 'Expert Instructor'}</h2>
              {product.category && <p className="instructor-category">Specialist in {product.category}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get Section */}
      <section className="section-features">
        <div className="container">
          <h2 className="section-title">What You'll Get in This Course</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3>Live Interactive Classes</h3>
              <p>Attend live sessions with expert instructors and get your questions answered in real-time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Comprehensive Curriculum</h3>
              <p>Learn from a well-structured curriculum covering everything from basics to advanced concepts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Real-World Projects</h3>
              <p>Build industry-standard projects to add to your portfolio and impress employers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Certificate of Completion</h3>
              <p>Earn a certificate upon completion to showcase your achievement and skills.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Lifetime Support</h3>
              <p>Get continuous support even after course completion through our community.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Lifetime Access</h3>
              <p>Access all course materials and recordings anytime, anywhere, forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="section-curriculum">
        <div className="container">
          <div className="curriculum-header">
            <h2 className="section-title">Course Curriculum</h2>
            <div className="curriculum-stats">
              <span className="stat">{product.modules || mockCurriculum.length} Modules</span>
              <span className="stat">{product.liveClasses || 0} Live Classes</span>
              <span className="stat">{product.totalVideos || 0} Videos</span>
            </div>
          </div>

          <div className="curriculum-list">
            {mockCurriculum.map((module, index) => (
              <div 
                key={index} 
                className={`curriculum-item ${expandedModule === index ? 'expanded' : ''}`}
              >
                <div 
                  className="curriculum-header-row"
                  onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                >
                  <div className="curriculum-title-section">
                    <span className="week-badge">Week {module.week}</span>
                    <div className="curriculum-title-content">
                      <h3>{module.title}</h3>
                      <p className="curriculum-subtitle">{module.subtitle}</p>
                    </div>
                  </div>
                  <div className="curriculum-meta">
                    {module.videos > 0 && <span className="meta-tag">{module.videos} videos</span>}
                    {module.liveClasses > 0 && <span className="meta-tag">{module.liveClasses} live</span>}
                    {module.quizzes > 0 && <span className="meta-tag">{module.quizzes} quiz</span>}
                    <span className="expand-icon">{expandedModule === index ? '−' : '+'}</span>
                  </div>
                </div>
                {expandedModule === index && (
                  <div className="curriculum-content">
                    <p>{module.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {product.projects && product.projects > 0 && (
        <section className="section-projects">
          <div className="container">
            <h2 className="section-title">Projects You'll Build</h2>
            <p className="section-subtitle">Build these portfolio-worthy projects during the course</p>
            
            <div className="projects-grid">
              {[1, 2, 3].slice(0, product.projects || 3).map((item, index) => (
                <div key={index} className="project-card">
                  <div className="project-image">
                    <img 
                      src={['/images/hero/2-3.png', '/images/hero/3-3.png', '/images/hero/4-3.png'][index] || '/images/hero/1-2.png'} 
                      alt={`Project ${item}`} 
                    />
                  </div>
                  <div className="project-info">
                    <h3>Project {item}</h3>
                    <p>Build a comprehensive real-world project applying all the concepts learned in the course.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who This Course Is For */}
      <section className="section-target-audience">
        <div className="container">
          <h2 className="section-title">Who This Course Is For</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">🎓</div>
              <h3>Students</h3>
              <p>Perfect for students looking to build a strong foundation and start their career.</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">💼</div>
              <h3>Professionals</h3>
              <p>Ideal for professionals wanting to upgrade their skills and advance their career.</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">🚀</div>
              <h3>Beginners</h3>
              <p>Great for beginners with no prior experience who want to learn from scratch.</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">🔄</div>
              <h3>Career Switchers</h3>
              <p>Excellent for those looking to switch to a more rewarding career path.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section-reviews">
        <div className="container">
          <h2 className="section-title">Student Reviews</h2>
          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">👨‍💼</div>
                  <div>
                    <h4>John Doe</h4>
                    <div className="rating">⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
              </div>
              <p className="review-text">"Excellent course! The instructor explains complex concepts in a very simple way. Highly recommended!"</p>
            </div>
            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">👩‍💻</div>
                  <div>
                    <h4>Jane Smith</h4>
                    <div className="rating">⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
              </div>
              <p className="review-text">"This course helped me land my dream job! The projects were industry-relevant and the support was amazing."</p>
            </div>
            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">👨‍🎓</div>
                  <div>
                    <h4>Mike Johnson</h4>
                    <div className="rating">⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
              </div>
              <p className="review-text">"Best investment in my career! The curriculum is up-to-date and the live classes are very interactive."</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What are the prerequisites for this course?</h3>
              <p>No prior experience required! This course is designed for beginners and will take you from zero to hero.</p>
            </div>
            <div className="faq-item">
              <h3>How long do I have access to the course?</h3>
              <p>You get lifetime access to all course materials, including future updates and new content.</p>
            </div>
            <div className="faq-item">
              <h3>Will I get a certificate?</h3>
              <p>Yes! Upon successful completion, you'll receive a certificate that you can share on LinkedIn and your resume.</p>
            </div>
            <div className="faq-item">
              <h3>What if I miss a live class?</h3>
              <p>Don't worry! All live classes are recorded and available for you to watch anytime.</p>
            </div>
            <div className="faq-item">
              <h3>Do you provide job placement support?</h3>
              <p>Yes! We provide comprehensive job placement support including resume review, interview preparation, and job referrals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses Section */}
      {relatedCourses.length > 0 && (
        <section className="section-related">
          <div className="container">
            <h2 className="section-title">You May Also Like</h2>
            <div className="related-courses-grid">
              {relatedCourses.map((course) => (
                <Link href={`/product/${course._id}`} key={course._id}>
                  <div className="related-course-card">
                    <div className="related-course-image">
                      <img 
                        src={course.image || course.coverImage || '/images/hero/background.png'} 
                        alt={course.name || course.title} 
                      />
                    </div>
                    <div className="related-course-info">
                      <h3>{course.name || course.title}</h3>
                      <p className="course-instructor">
                        {course.brand || course.author || course.instructor}
                      </p>
                      <div className="course-footer">
                        <span className="course-price">৳{course.price}</span>
                        {course.enrollmentCount && (
                          <span className="course-students">{course.enrollmentCount} students</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        .course-detail-page {
          background: var(--bg-color);
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Success Banner */
        .success-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 0;
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .success-banner .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .success-banner .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0 12px;
          border-radius: 4px;
          transition: all 0.3s;
        }

        .success-banner .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Hero Section */
        .course-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 0 60px;
          margin-bottom: 60px;
        }

        .breadcrumbs {
          font-size: 14px;
          margin-bottom: 30px;
          opacity: 0.9;
        }

        .breadcrumbs a {
          color: white;
          text-decoration: none;
          transition: opacity 0.3s;
        }

        .breadcrumbs a:hover {
          opacity: 0.8;
        }

        .separator {
          margin: 0 10px;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 450px;
          gap: 60px;
          align-items: start;
        }

        .course-title {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 20px;
        }

        .course-intro {
          font-size: 18px;
          line-height: 1.6;
          opacity: 0.95;
          margin-bottom: 20px;
        }

        .admin-controls {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-edit,
        .btn-delete {
          padding: 10px 20px;
          border: 2px solid white;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-edit:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-delete:hover {
          background: rgba(255, 0, 0, 0.3);
          border-color: #ff4444;
        }

        /* Course Card */
        .course-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 100px;
        }

        .course-image {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
        }

        .course-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .play-overlay:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .play-button {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #667eea;
          margin-bottom: 10px;
        }

        .play-overlay p {
          color: white;
          font-weight: 600;
        }

        .course-card-content {
          padding: 30px;
        }

        .price-section {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
          margin-bottom: 20px;
        }

        .course-price {
          font-size: 48px;
          font-weight: 700;
          color: #667eea;
          margin: 0;
        }

        .course-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-color);
          font-size: 14px;
        }

        .stat-icon {
          font-size: 20px;
        }

        .stat-text {
          flex: 1;
        }

        .enroll-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-primary-large {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary-large:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .btn-primary-large:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn-secondary {
          padding: 12px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Timeline Info */
        .timeline-info {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .timeline-item {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .timeline-item:last-child {
          border-bottom: none;
        }

        .timeline-item h4 {
          font-size: 14px;
          color: #666;
          margin-bottom: 6px;
        }

        .timeline-item p {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
        }

        /* Sections */
        section {
          padding: 60px 0;
        }

        .section-title {
          font-size: 36px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 40px;
          color: var(--text-color);
        }

        .section-subtitle {
          text-align: center;
          font-size: 18px;
          color: #666;
          margin-top: -30px;
          margin-bottom: 40px;
        }

        /* Instructor Section */
        .section-instructor {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .instructor-card {
          display: flex;
          align-items: center;
          gap: 30px;
          max-width: 800px;
          margin: 0 auto;
        }

        .instructor-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .instructor-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .instructor-info h3 {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .instructor-info h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .instructor-category {
          font-size: 16px;
          opacity: 0.9;
        }

        /* Features Section */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .feature-card {
          background: var(--card-bg);
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-color);
        }

        .feature-card p {
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          margin: 0;
        }

        /* Curriculum Section */
        .section-curriculum {
          background: var(--card-bg);
        }

        .curriculum-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .curriculum-stats {
          display: flex;
          gap: 20px;
        }

        .curriculum-stats .stat {
          background: #667eea;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .curriculum-list {
          max-width: 900px;
          margin: 0 auto;
        }

        .curriculum-item {
          background: white;
          border-radius: 12px;
          margin-bottom: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .curriculum-item:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .curriculum-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .curriculum-header-row:hover {
          background: #f8f9fa;
        }

        .curriculum-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .week-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .curriculum-title-content h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--text-color);
        }

        .curriculum-subtitle {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .curriculum-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .meta-tag {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #666;
        }

        .expand-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #667eea;
          color: white;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 700;
        }

        .curriculum-content {
          padding: 0 24px 24px 24px;
          color: #666;
          line-height: 1.6;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Projects Section */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .project-card {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .project-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .project-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .project-info {
          padding: 20px;
        }

        .project-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--text-color);
        }

        .project-info p {
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          margin: 0;
        }

        /* Target Audience Section */
        .section-target-audience {
          background: var(--card-bg);
        }

        .audience-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .audience-card {
          background: white;
          padding: 30px 20px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .audience-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .audience-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .audience-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .audience-card p {
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .audience-card:hover h3,
        .audience-card:hover p {
          color: white;
        }

        /* Reviews Section */
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .review-card {
          background: var(--card-bg);
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .review-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .review-header {
          margin-bottom: 20px;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .reviewer-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .reviewer-info h4 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--text-color);
        }

        .rating {
          font-size: 14px;
        }

        .review-text {
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          font-style: italic;
          margin: 0;
        }

        /* FAQ Section */
        .section-faq {
          background: var(--card-bg);
        }

        .faq-list {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .faq-item:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .faq-item h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-color);
        }

        .faq-item p {
          font-size: 15px;
          line-height: 1.6;
          color: #666;
          margin: 0;
        }

        /* Related Courses Section */
        .section-related {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .section-related .section-title {
          color: white;
        }

        .related-courses-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .related-course-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .related-course-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }

        .related-course-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .related-course-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .related-course-card:hover .related-course-image img {
          transform: scale(1.1);
        }

        .related-course-info {
          padding: 20px;
        }

        .related-course-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--text-color);
        }

        .course-instructor {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
        }

        .course-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .course-price {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
        }

        .course-students {
          font-size: 12px;
          color: #999;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .course-card {
            position: static;
          }

          .features-grid,
          .projects-grid,
          .reviews-grid,
          .related-courses-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .audience-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .course-title {
            font-size: 32px;
          }

          .section-title {
            font-size: 28px;
          }

          .features-grid,
          .projects-grid,
          .reviews-grid,
          .related-courses-grid,
          .audience-grid {
            grid-template-columns: 1fr;
          }

          .curriculum-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .curriculum-stats {
            flex-wrap: wrap;
          }

          .curriculum-title-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .curriculum-meta {
            flex-wrap: wrap;
          }
        }

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Error Message */
        .error-message {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #e74c3c;
        }
      `}</style>
    </div>
  );
}
