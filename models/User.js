import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true
    },
    displayName: {
        type: String
    },
    photoURL: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    preferences: {
        isAnonymous: { type: Boolean, default: false },
        acceptsMessages: { type: Boolean, default: true },
        theme: { type: String, default: 'system' }
    }
});

// Force model recompilation if schema changed (for dev HMR)
if (mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
