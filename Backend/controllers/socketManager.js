import { Server } from "socket.io";

let connections = {};   
let messages = {};      
let timeOnline = {};    
let usernames = {};     

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Save username coming from frontend
        socket.on("set-username", (name) => {
            usernames[socket.id] = name;
        });

        // -------------------------------
        // ✅ NEW: Better room joining logic
        // -------------------------------
        socket.on("join-room", (roomId) => {
            console.log(`Socket ${socket.id} joining room ${roomId}`);

            // Initialize room structures
            if (!connections[roomId]) connections[roomId] = [];
            if (!messages[roomId]) messages[roomId] = [];

            // Save connection
            connections[roomId].push(socket.id);
            timeOnline[socket.id] = Date.now();

            // Join actual Socket.IO room
            socket.join(roomId);

            // Prepare username list for this room
            const roomUsernames = {};
            connections[roomId].forEach(id => {
                roomUsernames[id] = usernames[id] || "User";
            });

            // Send confirmation to the new user
            socket.emit("joined-room", {
                yourId: socket.id,
                clients: [...connections[roomId]],
                usernames: roomUsernames,
                messages: messages[roomId]
            });

            // Notify others in room
            socket.to(roomId).emit(
                "user-joined",
                socket.id,
                [...connections[roomId]],
                roomUsernames
            );
        });

        // --------------------------------
        // OLD SYSTEM: For join-call (keep for compatibility)
        // --------------------------------
        socket.on("join-call", (path) => {
            if (!connections[path]) connections[path] = [];

            connections[path].push(socket.id);
            timeOnline[socket.id] = Date.now();

            // Username list preparation
            const nameMap = {};
            connections[path].forEach(id => {
                nameMap[id] = usernames[id] || "User";
            });

            // Notify all users
            connections[path].forEach((id) => {
                io.to(id).emit(
                    "user-joined",
                    socket.id,
                    [...connections[path]],
                    nameMap
                );
            });

            // Sync old messages
            if (messages[path]) {
                messages[path].forEach((msg) => {
                    io.to(socket.id).emit(
                        "chat-message",
                        msg.data,
                        msg.sender,
                        msg["socket-id-sender"]
                    );
                });
            }
        });

        // Forward WebRTC signals
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // ------------------------
        // Chat message handling
        // ------------------------
        socket.on("chat-message", (data, sender) => {
            let matchingRoom = null;

            // Find the room the user belongs to
            for (const [roomKey, users] of Object.entries(connections)) {
                if (users.includes(socket.id)) {
                    matchingRoom = roomKey;
                    break;
                }
            }

            if (!matchingRoom) return;

            // Save in room history
            messages[matchingRoom].push({
                sender,
                data,
                "socket-id-sender": socket.id
            });

            // Send to all room users
            connections[matchingRoom].forEach((id) => {
                io.to(id).emit("chat-message", data, sender, socket.id);
            });
        });

        // ------------------------
        // Handle disconnect
        // ------------------------
        socket.on("disconnect", () => {
            let roomLeft = null;

            for (const [room, users] of Object.entries(connections)) {
                if (users.includes(socket.id)) {
                    roomLeft = room;

                    const diffTime = Math.abs(timeOnline[socket.id] - Date.now());

                    // Notify others
                    socket.to(room).emit("user-left", socket.id, diffTime);

                    // Remove user
                    connections[room] = users.filter(id => id !== socket.id);

                    if (connections[room].length === 0) {
                        delete connections[room];
                    }
                }
            }

            // Cleanup
            delete usernames[socket.id];
            delete timeOnline[socket.id];
        });
    });
};

export { connectToSocket };
