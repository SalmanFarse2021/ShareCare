import { Server } from 'socket.io';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import Chat from '@/models/Chat';
import User from '@/models/User';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = async (req, res) => {
    if (!res.socket.server.io) {
        console.log('*First use, starting Socket.IO*');
        const io = new Server(res.socket.server, {
            path: '/api/socket/io',
            addTrailingSlash: false,
        });



        // Track online users globally for this instance
        if (!res.socket.server.onlineUsers) {
            res.socket.server.onlineUsers = new Map(); // socketId -> userId
        }

        io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            socket.on('register_user', (userId) => {
                socket.join(userId);
                res.socket.server.onlineUsers.set(socket.id, userId);

                // Broadcast to everyone that this user is online
                io.emit('user_online', { userId });

                // Send current online users to this user
                const onlineUserIds = Array.from(res.socket.server.onlineUsers.values());
                socket.emit('online_users_list', onlineUserIds);
            });

            socket.on('join_chat', (chatId) => {
                socket.join(chatId);
            });

            socket.on('send_message', async (data) => {
                const { chatId, senderId, text, type, mediaUrl } = data;

                try {
                    await dbConnect();

                    // 1. Save Message to DB
                    const newMessage = await Message.create({
                        chatId,
                        senderId,
                        text: text || (type === 'image' ? 'Sent an image' : ''),
                        type: type || 'text',
                        mediaUrl,
                        readBy: [senderId]
                    });

                    // 2. Update Chat's lastMessage
                    await Chat.findByIdAndUpdate(chatId, {
                        lastMessage: {
                            text: type === 'image' ? 'Sent an image' : text,
                            senderId,
                            createdAt: new Date()
                        },
                        updatedAt: new Date()
                    });

                    // 3. Emit to Room
                    io.to(chatId).emit('receive_message', newMessage);

                } catch (error) {
                    console.error('Socket Send Error:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            socket.on('mark_read', async ({ chatId, userId }) => {
                try {
                    await dbConnect();
                    // Update all unread messages in this chat not read by this user
                    await Message.updateMany(
                        { chatId, readBy: { $ne: userId } },
                        { $addToSet: { readBy: userId } }
                    );

                    // Emit to everyone in the room that messages are read by this user
                    io.to(chatId).emit('messages_read', { chatId, userId });
                } catch (error) {
                    console.error('Mark Read Error:', error);
                }
            });

            socket.on('typing', ({ chatId, userId }) => {
                socket.to(chatId).emit('display_typing', { userId });
            });

            socket.on('stop_typing', ({ chatId, userId }) => {
                socket.to(chatId).emit('hide_typing', { userId });
            });

            socket.on('disconnect', () => {
                const userId = res.socket.server.onlineUsers.get(socket.id);
                if (userId) {
                    res.socket.server.onlineUsers.delete(socket.id);
                    // Check if user has other sockets open? Simplified: emit offline
                    // In production check if User has 0 sockets left
                    const remaining = Array.from(res.socket.server.onlineUsers.values()).filter(id => id === userId);
                    if (remaining.length === 0) {
                        io.emit('user_offline', { userId });
                    }
                }
                console.log('Socket disconnected');
            });
        });

        res.socket.server.io = io;
    } else {
        console.log('Socket.IO already running');
    }
    res.end();
};

export default ioHandler;
