import React, { useRef, useState, useEffect } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const server_url = "http://localhost:8080";
const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

// keep connections as a plain object (socketId -> RTCPeerConnection)
var connections = {};

export default function VideoMeet({  roomName, username: initialUsername }) {
  // socket & ids
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);

  // video refs for DOM nodes of remote participants
  const remoteVideoRefs = useRef({}); // { socketId: videoElement }

  // single optional main local video ref (not reused for multiple DOM nodes)
  const mainLocalVideoRef = useRef(null);

  // React state
  const [localStream, setLocalStream] = useState(null);
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState(initialUsername || "");

  const [videos, setVideos] = useState([]); // { socketId, stream, username? }
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [usernames, setUsernames] = useState({}); // map socketId -> username
  const { roomId } = useParams();
  const [joinRoomId, setJoinRoomId] = useState("");


  // ---------- media helpers ----------
  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  // Toggle mic/cam - operate on localStream state
  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideo(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudio(audioTrack.enabled);
    }
  };

  // Setup audio-level detection for active speaker (local)
  const setupAudioDetection = (stream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      microphone.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detectAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (average > 30) {
          setActiveSpeaker(socketIdRef.current);
          socketRef.current?.emit('speaking', socketIdRef.current);
        }
        requestAnimationFrame(detectAudio);
      };
      detectAudio();
    } catch (e) {
      // audio context might be blocked until user interaction
      console.warn("Audio detection unavailable:", e);
    }
  };

  // get user media (camera + mic)
  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoAvailable(true);
      setAudioAvailable(true);
      window.localStream = stream; // compatibility
      setLocalStream(stream);
      if (mainLocalVideoRef.current) mainLocalVideoRef.current.srcObject = stream;
      setupAudioDetection(stream);
    } catch (err) {
      console.log("Media permission denied or partial:", err);
      // try video only
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoAvailable(true);
        setAudioAvailable(false);
        window.localStream = videoStream;
        setLocalStream(videoStream);
        if (mainLocalVideoRef.current) mainLocalVideoRef.current.srcObject = videoStream;
      } catch (videoErr) {
        console.log("Video permission also denied:", videoErr);
        setVideoAvailable(false);
        setAudioAvailable(false);
      }
    }

    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    }
  };

  // helper to stop and clear local stream
  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
      window.localStream = null;
    }
  };

  // ---------- Peer Connection creation ----------
  const createPeerConnection = (remoteSocketId) => {
    const pc = new RTCPeerConnection(peerConfigConnections);

    // ICE candidate -> send to remote
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        try {
          socketRef.current.emit("signal", remoteSocketId, JSON.stringify({ ice: event.candidate }));
        } catch (e) {
          console.log("Emit ice error:", e);
        }
      }
    };

    // Use ontrack (modern) to receive remote streams
    pc.ontrack = (event) => {
      const remoteStream = (event.streams && event.streams[0]) || new MediaStream();
      // attach the remote stream into state (create or update)
      setVideos(prev => {
        const exists = prev.find(v => v.socketId === remoteSocketId);
        if (exists) {
          return prev.map(v => v.socketId === remoteSocketId ? { ...v, stream: remoteStream } : v);
        } else {
          return [...prev, { socketId: remoteSocketId, stream: remoteStream, username: (usernames[remoteSocketId] || "User") }];
        }
      });

      // if we already have a DOM ref for that id, set it immediately
      const el = remoteVideoRefs.current[remoteSocketId];
      if (el && el.srcObject !== remoteStream) el.srcObject = remoteStream;
    };

    // track connection state for cleanup
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed" || pc.connectionState === "disconnected") {
        // optionally handle
      }
    };

    // add local tracks if present
    if (localStream) {
      try {
        localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
      } catch (e) {
        console.warn("addTrack failed, falling back to addStream if available", e);
        if (pc.addStream && localStream) pc.addStream(localStream);
      }
    } else {
      // if no local stream, send black + silence as placeholder
      const placeholder = new MediaStream([black(), silence()]);
      try {
        placeholder.getTracks().forEach(t => pc.addTrack(t, placeholder));
      } catch (e) {
        if (pc.addStream) pc.addStream(placeholder);
      }
    }

    return pc;
  };

  // ---------- Signaling message handler ----------
  const gotMessageFromServer = async (fromId, message) => {
    if (!message) return;
    let signal;
    try {
      signal = JSON.parse(message);
    } catch (e) {
      console.error("Failed to parse signal message:", e, message);
      return;
    }

    // ignore messages from self
    if (fromId === socketIdRef.current) return;

    // ensure a connection object exists
    if (!connections[fromId]) {
      connections[fromId] = createPeerConnection(fromId);
    }

    const pc = connections[fromId];

    try {
      if (signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: pc.localDescription }));
        }
      } else if (signal.ice) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    } catch (e) {
      console.error("Error processing signal:", e);
    }
  };

  // ---------- Connect to socket server ----------
  const connectToSocketServer = () => {
    if (socketRef.current && socketRef.current.connected) return;
  
    socketRef.current = io.connect(server_url, { secure: false });
  
    socketRef.current.on('signal', (fromId, message) => gotMessageFromServer(fromId, message));
  
    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
  
      // decide the room id (URL param or typed input)
      const finalRoomId = joinRoomId?.trim() || roomId?.trim();
      if (!finalRoomId) {
        console.warn("No roomId provided on connect; not joining any room yet.");
        return;
      }
  
      // tell server our username (server stores it in usernames map)
      socketRef.current.emit("set-username", username);
  
      // join the chosen room
      socketRef.current.emit("join-call", finalRoomId, username);
  
      // set local mapping for display
      setUsernames(prev => ({ ...prev, [socketIdRef.current]: username }));
  
      // setup listeners that depend on being connected
      socketRef.current.on("user-left", (id) => {
        setVideos(vs => vs.filter(v => v.socketId !== id));
        setUsernames(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        try { if (connections[id]) { connections[id].close(); delete connections[id]; } } catch(e){}
      });
  
      socketRef.current.on("speaking", (speakerId) => {
        setActiveSpeaker(speakerId);
        setTimeout(() => setActiveSpeaker(null), 1000);
      });
  
      socketRef.current.on("user-joined", (id, clients, names) => {
        if (names) {
          setUsernames(prev => {
            const updated = { ...prev, ...names };
            updated[socketIdRef.current] = username;
            return updated;
          });
        }
  
        setVideos(prev =>
          prev.map(v => ({
            ...v,
            username: names?.[v.socketId] || v.username || "User"
          }))
        );
  
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;
          if (!connections[socketListId]) connections[socketListId] = createPeerConnection(socketListId);
          if (localStream) {
            try {
              localStream.getTracks().forEach(t => {
                const already = connections[socketListId].getSenders().some(s => s.track && s.track.id === t.id);
                if (!already) connections[socketListId].addTrack(t, localStream);
              });
            } catch (e) { /* ignore */ }
          }
        });
  
        // if server indicates "you joined", create offers
        if (id === socketIdRef.current) {
          for (const id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            const pc = connections[id2];
            pc.createOffer().then(desc => pc.setLocalDescription(desc))
              .then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ sdp: pc.localDescription }));
              }).catch(e => console.log("offer error:", e));
          }
        }
      });
  
    });
  };
  

  // call to join (button)
  const handleConnect = () => {
    const finalRoomId = (joinRoomId?.trim() || roomId?.trim());
  
    if (!finalRoomId) {
      alert("Please enter or provide a valid Room ID");
      return;
    }
  
    if (!username.trim()) {
      alert("Please enter your name!");
      return;
    }
  
    // show video UI
    setAskForUsername(false);
  
    // if socket already exists and is connected, just emit join immediately
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("set-username", username);
      socketRef.current.emit("join-call", finalRoomId, username);
      setUsernames(prev => ({ ...prev, [socketRef.current.id]: username }));
      socketIdRef.current = socketRef.current.id;
      return;
    }
  
    // otherwise create/connect socket — connectToSocketServer will join the room on connect
    connectToSocketServer();
  };
  

  // leave & cleanup
  const handleLeave = () => {
    try {
      // stop local stream
      stopLocalStream();

      // close peer connections
      for (const id in connections) {
        try {
          connections[id].close();
        } catch (e) { }
        delete connections[id];
      }

      // disconnect socket
      socketRef.current?.disconnect();
      socketRef.current = null;
      socketIdRef.current = null;

      // navigate away
      window.location.href = '/';
    } catch (e) {
      console.error("Error leaving:", e);
    }
  };

  // ---------- lifecycle ----------
  useEffect(() => {
    getPermissions();

    // cleanup on unmount
    return () => {
      stopLocalStream();
      try {
        for (const id in connections) {
          connections[id]?.close();
          delete connections[id];
        }
      } catch (e) { }
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep mainLocalVideoRef attached to localStream
  useEffect(() => {
    if (mainLocalVideoRef.current) {
      mainLocalVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  // helper subcomponent for local video (safe to render multiple times)
  function LocalVideo({ style, muted = true, objectFit = 'cover' }) {
    const ref = useRef();
    useEffect(() => {
      if (ref.current) ref.current.srcObject = localStream || null;
    }, [localStream]);
    return (
      <video
        ref={ref}
        autoPlay
        muted={muted}
        playsInline
        style={{ width: '100%', height: '100%', objectFit, ...style }}
      />
    );
  }

  // find active speaker's video object
  const activeSpeakerVideo = videos.find(v => v.socketId === activeSpeaker);
  const otherVideos = videos.filter(v => v.socketId !== activeSpeaker);


  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f7fa",
    }}>
      {askForUsername ? (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "20px"
        }}>
          <div style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: "1200px",
            width: "100%"
          }}>
            {/* Video Preview Section */}
            <div style={{
              position: "relative",
              width: "640px",
              height: "480px",
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              border: "3px solid rgba(255,255,255,0.2)"
            }}>
              <video
                ref={mainLocalVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
    
              {/* Audio/Video Controls Overlay */}
              <div style={{
                position: "absolute",
                bottom: "30px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "15px",
                backgroundColor: "rgba(255,255,255,0.95)",
                padding: "12px 20px",
                borderRadius: "50px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)"
              }}>
                <IconButton
                  onClick={toggleAudio}
                  style={{
                    backgroundColor: audio ? "#e8f5e9" : "#ffebee",
                    color: audio ? "#2e7d32" : "#c62828",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    transition: "all 0.3s ease",
                    border: audio ? "2px solid #4caf50" : "2px solid #f44336"
                  }}
                >
                  {audio ? <Mic size={22} /> : <MicOff size={22} />}
                </IconButton>
    
                <IconButton
                  onClick={toggleVideo}
                  style={{
                    backgroundColor: video ? "#e3f2fd" : "#ffebee",
                    color: video ? "#1565c0" : "#c62828",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    transition: "all 0.3s ease",
                    border: video ? "2px solid #2196f3" : "2px solid #f44336"
                  }}
                >
                  {video ? <Video size={22} /> : <VideoOff size={22} />}
                </IconButton>
              </div>
            </div>
    
            {/* Join Form Section */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "25px",
              width: "400px",
              backgroundColor: "rgba(255,255,255,0.98)",
              padding: "50px 40px",
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <h1 style={{
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "8px"
                }}>
                  Join Meeting
                </h1>
                <p style={{
                  color: "#64748b",
                  fontSize: "0.95rem",
                  margin: 0
                }}>
                  Enter your details to get started
                </p>
              </div>
    
              <TextField
                label="Room ID"
                variant="outlined"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                InputProps={{ 
                  style: { 
                    color: "#1e293b",
                    fontSize: "1rem"
                  } 
                }}
                InputLabelProps={{ 
                  style: { 
                    color: "#64748b",
                    fontSize: "0.95rem"
                  } 
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    "& fieldset": { 
                      borderColor: "#e2e8f0",
                      borderWidth: "2px"
                    },
                    "&:hover fieldset": { 
                      borderColor: "#cbd5e1"
                    },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#667eea",
                      borderWidth: "2px"
                    }
                  },
                  width: "100%"
                }}
              />
    
              <TextField
                label="Your Name"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleConnect()}
                InputProps={{ 
                  style: { 
                    color: "#1e293b",
                    fontSize: "1rem"
                  } 
                }}
                InputLabelProps={{ 
                  style: { 
                    color: "#64748b",
                    fontSize: "0.95rem"
                  } 
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    "& fieldset": { 
                      borderColor: "#e2e8f0",
                      borderWidth: "2px"
                    },
                    "&:hover fieldset": { 
                      borderColor: "#cbd5e1"
                    },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#667eea",
                      borderWidth: "2px"
                    }
                  },
                  width: "100%"
                }}
              />
    
              <Button
                variant="contained"
                onClick={handleConnect}
                size="large"
                style={{
                  width: "100%",
                  padding: "16px 0",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  textTransform: "none",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 24px rgba(102,126,234,0.4)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(102,126,234,0.5)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(102,126,234,0.4)";
                }}
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "calc(100vh - 40px)",
          maxWidth: "1600px",
          backgroundColor: "#ffffffff",
          margin: "0 auto"
        }}>
          {/* Active Speaker - Large View (shows local user by default, remote user when they speak) */}
          <div style={{
            flex: 1,
            marginBottom: "20px",
            position: "relative",
            background: "linear-gradient(135deg, #000000ff 0%, #000000ff 100%)",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "2px solid #e2e8f0"
          }}>
            {(() => {
              // Show remote user if they are the active speaker
              if (activeSpeaker && activeSpeaker !== socketIdRef.current) {
                const remoteSpeaker = otherVideos.find(v => v.socketId === activeSpeaker);
                if (remoteSpeaker) {
                  return (
                    <>
                      <video
                        ref={el => {
                          if (!el) return;
                          remoteVideoRefs.current[remoteSpeaker.socketId] = el;
                          if (remoteSpeaker.stream && el.srcObject !== remoteSpeaker.stream) {
                            el.srcObject = remoteSpeaker.stream;
                          }
                        }}
                        autoPlay
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain"
                        }}
                      />
                      <div style={{
                        position: "absolute",
                        bottom: "24px",
                        left: "24px",
                        backgroundColor: "rgba(255,255,255,0.98)",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        fontSize: "1.1rem",
                        border: "2px solid #3b82f6",
                        color: "#1e293b",
                        fontWeight: "600",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span style={{fontSize: "1.3rem"}}>🎤</span>
                        {usernames[activeSpeaker] || remoteSpeaker.username || "User"}
                      </div>
                    </>
                  );
                }
              }
              
              // Default: show local user
              return (
                <>
                  <LocalVideo objectFit="contain" />
                  <div style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "24px",
                    backgroundColor: "rgba(255,255,255,0.98)",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    border: activeSpeaker === socketIdRef.current ? "2px solid #99bbf3ff" : "2px solid #e2e8f0",
                    color: "#1e293b",
                    fontWeight: "600",
                    boxShadow: activeSpeaker === socketIdRef.current ? "0 4px 16px rgba(160, 181, 216, 0.2)" : "0 4px 16px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    {activeSpeaker === socketIdRef.current && <span style={{fontSize: "1.3rem"}}>🎤</span>}
                    {usernames[socketIdRef.current] || username} (You)
                  </div>
                </>
              );
            })()}</div>
    
          {/* Grid of Participants */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            maxHeight: "220px",
            overflowY: "auto"
          }}>
            {/* Show local user in grid only when someone else is speaking */}
            {activeSpeaker && activeSpeaker !== socketIdRef.current && (
              <div style={{ 
                position: "relative", 
                backgroundColor: "#eebabaff", 
                borderRadius: "16px", 
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                border: "2px solid #e2e8f0",
                height: "220px"
              }}>
                <LocalVideo objectFit="cover" />
                <div style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  color: "#1e293b",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  {usernames[socketIdRef.current] || username} (You)
                </div>
              </div>
            )}
    
            {otherVideos.map((videoObj) => {
              // Don't show the remote user in grid if they are the active speaker (shown large)
              if (activeSpeaker && activeSpeaker === videoObj.socketId) {
                return null;
              }
              
              return (
                <div key={videoObj.socketId} style={{ 
                  position: "relative", 
                  backgroundColor: "#ffffff",
                  borderRadius: "16px", 
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  border: "2px solid #e2e8f0",
                  height: "220px"
                }}>
                  <video
                    ref={el => {
                      if (!el) return;
                      remoteVideoRefs.current[videoObj.socketId] = el;
                      if (videoObj.stream && el.srcObject !== videoObj.stream) {
                        el.srcObject = videoObj.stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    color: "#1e293b",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    {usernames[videoObj.socketId] || videoObj.username || "User"}
                  </div>
                </div>
              );
            })}
          </div>
    
          {/* Control Bar */}
          <div style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ffffff",
            padding: "16px 32px",
            borderRadius: "60px",
            display: "flex",
            gap: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "2px solid #e2e8f0"
          }}>
            <IconButton
              onClick={toggleAudio}
              style={{
                backgroundColor: audio ? "#e8f5e9" : "#ffebee",
                color: audio ? "#2e7d32" : "#c62828",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                border: audio ? "2px solid #4caf50" : "2px solid #f44336"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {audio ? <Mic size={24} /> : <MicOff size={24} />}
            </IconButton>
    
            <IconButton
              onClick={toggleVideo}
              style={{
                backgroundColor: video ? "#e3f2fd" : "#ffebee",
                color: video ? "#1565c0" : "#c62828",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                border: video ? "2px solid #2196f3" : "2px solid #f44336"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {video ? <Video size={24} /> : <VideoOff size={24} />}
            </IconButton>
    
            <IconButton
              onClick={handleLeave}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                border: "2px solid #b91c1c"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#b91c1c";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#dc2626";
              }}
            >
              <PhoneOff size={24} />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
