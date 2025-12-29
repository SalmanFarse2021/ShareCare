"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, Phone, Video, Info, Image, Plus, ThumbsUp, Smile, MoreVertical, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import styles from '../Messenger.module.css';



export default function ChatRoomPage() {
    const { id: chatId } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [chat, setChat] = useState(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Initial Fetch (Data)
    useEffect(() => {
        if (!user || !chatId) return;

        const fetchData = async () => {
            try {
                // Fetch Chat Metadata
                const chatRes = await fetch(`/api/chats?userId=${user.uid}`);
                const chatData = await chatRes.json();
                if (chatData.success) {
                    const currentChat = chatData.data.find(c => c._id === chatId);
                    if (currentChat) setChat(currentChat);
                }

                // Fetch History
                const msgRes = await fetch(`/api/chats/${chatId}/messages`);
                const msgData = await msgRes.json();
                if (msgData.success) {
                    setMessages(msgData.data);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, chatId]);

    // Socket Connection
    useEffect(() => {
        if (!chatId || !user) return;

        let isMounted = true;
        let socket = null;

        console.log("Initializing socket...");
        fetch('/api/socket/io').finally(() => {
            if (!isMounted) return;
            if (socketRef.current && socketRef.current.connected) return;

            // Create local instance
            socket = io({
                path: '/api/socket/io',
                addTrailingSlash: false,
            });

            // Assign to ref for external access (e.g. handleSend)
            socketRef.current = socket;

            socket.on('connect', () => {
                if (!isMounted) return;
                console.log("Socket Connected:", socket.id);
                setIsConnected(true);
                socket.emit('register_user', user.uid);
                socket.emit('join_chat', chatId);
            });

            socket.on('connect_error', (err) => {
                if (!isMounted) return;
                console.error("Socket Connection Error:", err);
                setIsConnected(false);
            });

            socket.on('receive_message', (message) => {
                if (!isMounted) return;
                console.log("Received message:", message);
                setMessages((prev) => [...prev, message]);
                setIsOtherUserTyping(false); // Stop typing indicator if message received

                // If I am active in this chat, mark it as read immediately
                if (document.visibilityState === 'visible') {
                    socketRef.current.emit('mark_read', { chatId, userId: user.uid });
                }

                if (scrollRef.current) {
                    setTimeout(() => {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }, 100);
                }
            });

            socket.on('messages_read', ({ chatId: eventChatId, userId: readerId }) => {
                if (!isMounted) return;
                console.log("Messages read by:", readerId);
                setMessages(prev => prev.map(msg => {
                    // If already read by this user, return as is
                    if (msg.readBy && msg.readBy.includes(readerId)) return msg;
                    // Otherwise add readerId
                    return { ...msg, readBy: [...(msg.readBy || []), readerId] };
                }));
            });

            socket.on('display_typing', ({ userId }) => {
                if (!isMounted) return;
                if (userId !== user.uid) {
                    setIsOtherUserTyping(true);
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                }
            });

            socket.on('hide_typing', ({ userId }) => {
                if (!isMounted) return;
                if (userId !== user.uid) {
                    setIsOtherUserTyping(false);
                }
            });

            socket.on('disconnect', () => {
                if (!isMounted) return;
                console.log("Socket Disconnected");
                setIsConnected(false);
            });
        });

        return () => {
            isMounted = false;
            // Removed cleanup disconnect to prevent flashing, but for strictness:
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [chatId, user]);

    // Mark as read on initial load
    useEffect(() => {
        if (isConnected && socketRef.current) {
            socketRef.current.emit('mark_read', { chatId, userId: user.uid });
        }
    }, [isConnected, chatId, user]);

    // Scroll effect
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOtherUserTyping]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (!socketRef.current) {
            console.error("Socket not initialized");
            alert("Connection not ready. Please wait.");
            return;
        }

        console.log("Sending message...", inputText);
        socketRef.current.emit('stop_typing', { chatId, userId: user.uid }); // Stop typing immediately on send
        socketRef.current.emit('send_message', {
            chatId,
            senderId: user.uid,
            text: inputText,
            type: 'text'
        });

        setInputText('');
    };

    const handleInput = (e) => {
        setInputText(e.target.value);

        if (!socketRef.current) return;

        // Emit typing event
        socketRef.current.emit('typing', { chatId, userId: user.uid });

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current) {
                socketRef.current.emit('stop_typing', { chatId, userId: user.uid });
            }
        }, 2000);
    };

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Limit size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            alert("File is too large (Max 10MB)");
            e.target.value = ''; // Clear input
            return;
        }

        setIsUploading(true);

        // Upload to server
        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log("Uploading file...");
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                console.log("Upload success:", data.url);
                if (socketRef.current) {
                    socketRef.current.emit('send_message', {
                        chatId,
                        senderId: user.uid,
                        text: 'Sent an image',
                        type: 'image',
                        mediaUrl: data.url
                    });
                }
            } else {
                alert("Upload failed: " + data.message);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error uploading file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <div className={styles.mainChat}><div style={{ padding: '20px' }}>Loading...</div></div>;
    if (!chat) return <div className={styles.mainChat}>Chat not found</div>;

    const otherParticipant = chat.participants.find(p => p.user !== user.uid) || { displayName: 'Unknown' };

    return (
        <div className={styles.mainChat}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <div className={styles.headerUserInfo}>
                    {otherParticipant.photoURL ? (
                        <img src={otherParticipant.photoURL} className={styles.headerAvatar} />
                    ) : (
                        <div className={styles.headerAvatar}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{otherParticipant.displayName.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <div className={styles.headerName}>{otherParticipant.displayName}</div>
                        <div className={styles.headerStatus}>Active now</div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.actionBtn}><Phone size={20} /></button>
                    <button className={styles.actionBtn}><Video size={20} /></button>
                    <button className={styles.actionBtn}><Info size={20} /></button>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesArea} ref={scrollRef}>
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.uid;
                    const prevMsg = messages[idx - 1];
                    const isSequence = prevMsg && prevMsg.senderId === msg.senderId;

                    // Check if this is the last message read by the other person
                    const isLastRead = isMe && msg.readBy && msg.readBy.includes(otherParticipant.user) &&
                        // Ensure no later message is also read by them
                        !messages.slice(idx + 1).some(m => m.readBy && m.readBy.includes(otherParticipant.user));

                    return (
                        <div key={idx} className={`${styles.messageRow} ${isMe ? styles.own : ''} ${isSequence ? styles.sequence : ''}`}>
                            {!isMe && !isSequence && (
                                <div className={styles.msgAvatar}>
                                    {otherParticipant.photoURL ?
                                        <img src={otherParticipant.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                        otherParticipant.displayName.charAt(0)
                                    }
                                </div>
                            )}
                            {!isMe && isSequence && <div style={{ width: '28px' }} />}

                            <div className={styles.bubbleWrapper} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                {msg.type === 'image' && msg.mediaUrl ? (
                                    <img
                                        src={msg.mediaUrl}
                                        alt="Shared"
                                        style={{
                                            maxWidth: '200px', borderRadius: '12px', marginBottom: '4px',
                                            border: '1px solid #e5e5e5'
                                        }}
                                    />
                                ) : (
                                    <div className={styles.bubble}>
                                        {msg.text}
                                    </div>
                                )}
                                {isLastRead && (
                                    <div className={styles.readReceipt}>
                                        {otherParticipant.photoURL ?
                                            <img src={otherParticipant.photoURL} className={styles.seenAvatar} /> :
                                            <div className={styles.seenAvatar}>{otherParticipant.displayName.charAt(0)}</div>
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator Bubble */}
                {isOtherUserTyping && (
                    <div className={`${styles.messageRow}`}>
                        <div className={styles.msgAvatar}>
                            {otherParticipant.photoURL ?
                                <img src={otherParticipant.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                otherParticipant.displayName.charAt(0)
                            }
                        </div>
                        <div className={styles.bubble} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '50px' }}>
                            <div className={styles.typingDot} style={{ animationDelay: '0s' }}></div>
                            <div className={styles.typingDot} style={{ animationDelay: '0.2s' }}></div>
                            <div className={styles.typingDot} style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <button className={styles.iconButton}><Plus size={20} /></button>
                <button className={styles.iconButton} onClick={handleImageClick} disabled={isUploading}>
                    {isUploading ? <Loader2 size={20} className={styles.spin} /> : <Image size={20} />}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <button className={styles.iconButton}><Smile size={20} /></button>

                <div className={styles.inputWrapper}>
                    <input
                        className={styles.messageInput}
                        placeholder="Aa"
                        value={inputText}
                        onChange={handleInput}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                    />
                </div>

                {inputText.trim() ? (
                    <button className={styles.iconButton} onClick={handleSend}><Send size={20} /></button>
                ) : (
                    <button className={styles.iconButton}><ThumbsUp size={20} /></button>
                )}
            </div>
        </div>
    );
}
