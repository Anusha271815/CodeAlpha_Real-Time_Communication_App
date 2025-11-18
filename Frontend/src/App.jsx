import { useState } from 'react'
import {BrowserRouter,Route,Routes,Router} from "react-router-dom";
import './App.css'
// import Demo from "./demo.jsx";
// import Lobby from "./screen/lobby.jsx";
// import Comment from './comment.jsx';
import Landing from './pages/landing.jsx';
import Authentication from './pages/Authentication.jsx';
import { AuthProvider } from './context/authContext.jsx';
import VideoMeet from './pages/videoMeet.jsx';
import Dashboard from './pages/dashboard.jsx';
import Guest from './pages/guest.jsx';
function App() {

  return (
    <>
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/meet/:roomId' element={<VideoMeet />} />
        <Route path="/guest" element={<Guest />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
    
    </>
  )
}

export default App;
