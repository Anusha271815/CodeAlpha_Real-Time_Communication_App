import React,{useState,useCallback} from "react";
import { useSocket } from "../context/SocketProvider.jsx";

const Lobby = () => {
    const [email,setEmail]=useState("");
    const [room,setRoom]=useState("");

    const socket=useSocket();
    // console.log(socket);

    const handleSubmitForm=useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:join',{email,room});
        // console.log("Email:",email);
        // console.log("Room:",room); 
    },[email,room,socket]);

  return (
    <div>
        <h1> Lobby Screen</h1> 
        <form onSubmit={handleSubmitForm}>
            <label htmlFor="email">E-mail ID</label>
            <input 
                type="email" 
                id="email" 
                name="email" 
                value={email} 
                onChange={(e)=>setEmail(e.target.value)}
            />
            <br/>
            <label htmlFor="room">Room number</label>
            <input 
                type="text" 
                id="room" 
                name="room"
                value={room}
                onChange={(e)=>setRoom(e.target.value)} 
            />
            <br/>
            <button type="submit">Join Room</button>
        </form>
    </div>
  );
}
export default Lobby;
