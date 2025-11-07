import React from 'react';
import './landing.css';
import bg from '../assets/background.jpg';
import { Link } from 'react-router-dom';
function Landing(){
    return (
        <div className='Landing'>
            <div className='nav'>
                <div><h2>Video Conferencing</h2></div>
                <div className='nav-items'>
                    <a>Join as guest</a>
                    <a>Register</a>
                    <a href="/auth">Login</a>
                </div>
            </div>
            <div className='landing-body' style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}>
                <div className='landing-content'>
                    <h1><span style={{color:"blue"}}>Connect</span> Face-to-Face,<br></br>
    Anywhere in the World</h1>
                    <p>Crystal-clear video calls with zero lag.<br></br> Host meetings, webinars, and virtual events effortlessly.</p>
                    <div className='button'>
                        <Link to="/home" style={{color:"white",textDecoration:"none"}}>Get Started</Link>
                    </div>
                </div>
                <div className='landing-image'>
                    <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmlydHVhbCUyMG1lZXRpbmd8ZW58MHx8MHx8fDA%3D&w=1000&q=80" alt="landing pic" height="200px"/>
                </div>
            </div>
            
            
        </div>
    );
}
export default Landing;