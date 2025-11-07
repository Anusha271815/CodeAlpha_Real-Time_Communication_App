import React, { useState,useContext } from 'react';
import { Lock } from 'lucide-react';
import './authentication.css';
import Button from '@mui/material/Button';
import { AuthContext } from '../context/authContext';
import Snackbar from '@mui/material/Snackbar';

function Authentication() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name,setName]=useState(" ");
    const [error,setError]=useState('');
    const [message,setMessage]=useState(' ');

    const [formState,setFormState]=useState(0); //0 -> Login , 1->Register.

    const[open,SetOpen]=useState(false);

    const {handleRegister,handleLogin}=useContext(AuthContext);

    const handleAuth= (async ()=>{
        try{
            if(formState===0){
                let result=await handleLogin(username,password);
                console.log(result);
            }
            if(formState===1){
                let result=await handleRegister(name,username,password);
                console.log(result);
                setMessage(result);
                SetOpen(true);
                setError(" ");
                setFormState(0);
                setPassword("");
            }
        }catch (error) {
            console.log(error)
            const message = error.response?.data?.message ;
            setError(message);
            setUsername("")
          }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { username, password });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-icon">
                        <Lock size={28} />
                    </div>
                    <h2 className="auth-title">Welcome Back</h2>
                
                <div className="sign">
                {/* Submit Button */}
                <Button 
                    onClick={()=>{setFormState(0)}}
                    variant={formState === 0 ? "contained" : ""}
                    >
                    Sign In
                </Button>
                <Button 
                    onClick={()=>{setFormState(1)}}
                    // className="submit-button"
                    variant={formState === 1 ? "contained" : ""}
                    >
                    Sign Up
                </Button>
                </div>
            </div>
                {/* Form */}
                <div className="auth-form">
                    {/* Full Name */}
                    {formState==1?
                        <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="form-input"
                        />
                    </div>
                    :""}
                    
                    {/* Username Field */}
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="form-input"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="form-input"
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="form-options">
                        <label className="checkbox-label">
                            <input type="checkbox" className="form-checkbox" />
                            <span>Remember me</span>
                        </label>
                        <button className="link-button">Forgot password?</button>
                    </div>
                    <p style={{color:"red", textAlign:"center" , fontWeight:600}}>
                        {error}
                    </p>
                    <button onClick={handleAuth} className="submit-button">
                    {formState===0?"Login":"Register"}
                    </button>
                </div>

                {/* Sign Up Link */}
                <p className="signup-text">
                    Don't have an account?{' '}
                    <button className="link-button-primary"
                    onClick={()=>{setFormState(1)}}
                    >Sign up now</button>
                </p>
            </div>

            {/* Footer */}
            <p className="footer-text">
                By signing in, you agree to our{' '}
                <button className="footer-link">Terms of Service</button>
                {' '}and{' '}
                <button className="footer-link">Privacy Policy</button>
            </p>

            <Snackbar
            open={open}
            autoHideDuration={4000}
            message={message}
            />
        </div>
    );
}

export default Authentication;