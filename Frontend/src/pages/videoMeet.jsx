import React from "react";

const server_url="http://localhost:8080";

var connections={};

const peerConficConnections={
    "iceServers" : [
        { "urls": "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeet(){

    var socketRef=useRef();
    let socketIdRef= useRef();
    let localVideoRef= useRef();

    let[videoAvailable,setVideoAvailable]=useState(true);
    let[audioAvailable,setAudioAvailable]=useState(true);

    let [video,setVideo]=useState();

    let [audio,setAudio]=useState();

    let [screen,setScreen]=useState();

    let[showModel,setShowModel]=useState();

    let [screenAvailable,setScreenAvailable]=useState();

    let[messages,setMessages]=useState([]);

    let[message,setMessage]=useState("");

    let[newMessage,setNewMessage]=useState(0);

    let[askForUsername,setAskForUsername]=useState(true);

    let[username,setUsername]=useState("");

    const videoRef=useRef([])

    let [videos,setVideos]=useState([]);

    // if(isChrome()===false){

    // }

    return (
        <div>
            {askForUsername ===true?
            <div>
                
            </div>:<></>
            }
        </div>
    )
}