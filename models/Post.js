import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    type: {
        type: String,
        required: true,
        enum: ['food', 'clothes', 'essentials'],
    },
    condition: {
        type: String,
        required: true,
        enum: ['new', 'good', 'fair'],
    },
    quantity: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    user: {
        uid: { type: String, required: true },
        displayName: String,
        photoURL: String,
    },
    images: [{
        type: String, // Array of image URLs
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        },
        address: String,
    },
    expiryDate: {
        type: Date,
    },
    availabilityDuration: {
        type: String, // e.g. "24h", "2d"
    },
    source: {
        type: String,
        enum: ['individual', 'donation_point', 'walk_in'],
        default: 'individual'
    },
    point: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Point'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'requested', 'completed'],
        default: 'active',
    },
    requester: {
        uid: String,
        displayName: String,
        photoURL: String,
        requestedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indices for Search and Geo-location
// Indices for Search and Geo-location
// PostSchema.index({ 'location.coordinates': '2dsphere' }); // Defined in schema
PostSchema.index({ title: 'text', description: 'text' });
PostSchema.index({ type: 1, status: 1 });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
