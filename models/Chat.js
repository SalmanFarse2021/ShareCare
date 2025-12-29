import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    participants: [{
        user: { type: String, required: true }, // User UID or ObjectId
        role: { type: String, enum: ['requester', 'donor', 'manager', 'volunteer'], required: true },
        identityRevealed: { type: Boolean, default: false },
        identityRequested: { type: Boolean, default: false } // If true, this user WANTS to reveal
    }],
    context: {
        itemId: { type: String }, // Linked Post/Point ID
        referenceId: { type: String }, // Specific Request/Booking ID
        type: { type: String, enum: ['post_request', 'point_request', 'delivery_task', 'direct'], default: 'post_request' }
    },
    status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
    isAnonymous: { type: Boolean, default: true },
    expiresAt: { type: Date },
    lastMessage: {
        text: String,
        senderId: String,
        sentAt: Date
    }
}, { timestamps: true });

// Index for efficient lookup of user's chats
ChatSchema.index({ 'participants.user': 1, status: 1 });

// Force recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Chat) {
        delete mongoose.models.Chat;
    }
}

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
