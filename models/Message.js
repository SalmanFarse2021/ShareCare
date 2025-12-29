import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: String, required: true }, // User UID
    text: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
    mediaUrl: { type: String }, // For images/files
    readBy: [{ type: String }] // List of UIDs who read it
}, { timestamps: true });

MessageSchema.index({ chatId: 1, createdAt: 1 });

// Force recompilation in dev
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Message) {
        delete mongoose.models.Message;
    }
}

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
