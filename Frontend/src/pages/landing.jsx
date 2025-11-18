import React from 'react';

function Landing() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2d2d2eff 0%, #d9d8daff 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            {/* Navigation */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 60px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: 'white',
                        letterSpacing: '-0.5px'
                    }}>
                         VideoConnect
                    </h2>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '30px',
                    alignItems: 'center'
                }}>
                    <a href="/guest" style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        padding: '8px 16px',
                        borderRadius: '8px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                        Join as Guest
                    </a>
                    
                    <a href="/auth" style={{
                        color: '#667eea',
                        backgroundColor: 'white',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        padding: '12px 28px',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    }}>
                        Login
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '80px 60px',
                maxWidth: '1400px',
                margin: '0 auto',
                gap: '60px',
                flexWrap: 'wrap'
            }}>
                {/* Left Content */}
                <div style={{
                    flex: '1',
                    minWidth: '450px',
                    color: 'white'
                }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '24px',
                        letterSpacing: '-2px'
                    }}>
                        <span style={{
                            background: 'linear-gradient(90deg, #fff 0%, #e0e7ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Connect</span> Face-to-Face,
                        <br />
                        Anywhere in the World
                    </h1>
                    
                    <p style={{
                        fontSize: '1.3rem',
                        lineHeight: '1.7',
                        marginBottom: '40px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '400'
                    }}>
                        Crystal-clear video calls with zero lag.
                        <br />
                        Host meetings, webinars, and virtual events effortlessly.
                    </p>

                    {/* Features List */}
                    <div style={{
                        display: 'flex',
                        gap: '30px',
                        marginBottom: '40px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{fontSize: '1.5rem'}}>✓</span>
                            <span style={{fontSize: '1rem', fontWeight: '500'}}>HD Video Quality</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{fontSize: '1.5rem'}}>✓</span>
                            <span style={{fontSize: '1rem', fontWeight: '500'}}>Screen Sharing</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{fontSize: '1.5rem'}}>✓</span>
                            <span style={{fontSize: '1rem', fontWeight: '500'}}>Secure & Private</span>
                        </div>
                    </div>
                    
                    <a href="/guest" style={{
                        display: 'inline-block',
                        color: '#667eea',
                        backgroundColor: 'white',
                        textDecoration: 'none',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        padding: '18px 48px',
                        borderRadius: '16px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
                    }}>
                        Get Started Free →
                    </a>

                    <p style={{
                        marginTop: '20px',
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                        No credit card required • Free forever
                    </p>
                </div>

                {/* Right Image */}
                <div style={{
                    flex: '1',
                    minWidth: '400px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '600px'
                    }}>
                        <img 
                            src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                            alt="Video conferencing" 
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '24px',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                                border: '3px solid rgba(255, 255, 255, 0.2)'
                            }}
                        />
                        
                        {/* Floating Card 1 */}
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '-20px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#1e293b'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: '#22c55e'
                                }}></div>
                                <span style={{fontWeight: '600', fontSize: '0.95rem'}}>Live Now</span>
                            </div>
                        </div>

                        {/* Floating Card 2 */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '-20px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <div style={{color: '#1e293b'}}>
                                <div style={{fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px'}}>50K+</div>
                                <div style={{fontSize: '0.9rem', color: '#64748b', fontWeight: '500'}}>Active Users</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Indicators */}
            <div style={{
                textAlign: 'center',
                padding: '40px 60px',
                maxWidth: '1200px',
                border:"1px 2px 0 0 black",
                margin: '0 auto'
            }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.95rem',
                    marginBottom: '30px',
                    fontWeight: '500'
                }}>
                    TRUSTED BY TEAMS WORLDWIDE
                </p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '60px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {['🏢 Enterprise', '🎓 Education', '🏥 Healthcare', '💼 Startups'].map((item, index) => (
                        <div key={index} style={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            opacity: 0.8
                        }}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Landing;