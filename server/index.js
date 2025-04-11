const express = require('express');
const app = express();
const PORT = 4000;
const mongoose = require('mongoose');

const http = require('http').Server(app);
const cors = require('cors');
mongoose.connect('mongodb://localhost:27017/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('💾 MongoDB connected'))
.catch(err => console.error(err));
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const User = require('./src/models/User');
const Message = require('./src/models/Message');
app.use(cors());

socketIO.on('connection', (socket) => {
     console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('message', async(data) => {
      const message = new Message({
        sender: data.sender,
        text: data.text,
    });
    await message.save();
    socketIO.emit('messageResponse', data);
      });
      socket.on("typing", data => (
        socket.broadcast.emit("typingResponse", data)
      ))
      socket.on('newUser', async(data) => {
        const newUser = new User({
          username: data.username,
          socketID: socket.id
      });
      await newUser.save();
      const users = await User.find();
      socketIO.emit('newUserResponse', users);
      });
      socket.on('disconnect', async () => {
        console.log('🔥: A user disconnected');
        await User.deleteOne({ socketID: socket.id });
        const users = await User.find();
        socketIO.emit('newUserResponse', users);
        socket.disconnect();
    });
});
app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});