import express from 'express';
import {Server} from 'socket.io';
import {createServer} from 'node:http';
import mongoose from 'mongoose';
import cors from 'cors';
import {connectToSocket} from './controllers/socketManager.js';
import userRoutes from './router/user_routes.js';


const app=express();
const port=8080;
const server=createServer(app);
const io=connectToSocket(server);

app.use(cors());
app.use(express.json({limit:'40kb'}));    
app.use(express.urlencoded({extended:true, limit:'40kb'}));
app.use("/api/v1/users",userRoutes);

async function connectDB(){
    try{
        const connectionDb=await mongoose.connect("mongodb+srv://kesarwanianusha58_db_user:anushA.28@cluster0.gvdx0rl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("MongoDB connected: " + connectionDb.connection.host);
    }catch(err){
        console.error("Error connecting to MongoDB: ", err);
        process.exit(1);
    };
}
connectDB();



app.get('/',(req,res)=>{
    res.send('Hello World!');
});

server.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});