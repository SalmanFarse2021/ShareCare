import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Point name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    type: {
        type: String,
        required: true,
        enum: ['ngo_office', 'community_center', 'mosque', 'church', 'temple', 'disaster_camp', 'other']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    publicLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    privateLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    publicAddress: {
        type: String,
        required: true
    },
    privateAddress: {
        type: String,
        required: true
    },
    serviceRadius: {
        type: Number,
        default: 5, // km
        min: 1,
        max: 50
    },
    allowedItems: {
        type: [String],
        enum: ['food', 'clothes', 'essentials', 'medicine', 'other'],
        default: ['food', 'clothes', 'essentials']
    },
    operatingHours: {
        open: String, // e.g., "09:00"
        close: String, // e.g., "17:00"
        days: [String] // e.g., ["Mon", "Tue"...]
    },
    capacity: {
        storageSize: String, // e.g., "Small Room", "Warehouse"
        dailyLimit: Number // items per day
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    team: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['manager', 'member', 'volunteer'],
            default: 'volunteer',
            required: true
        },
        status: {
            type: String,
            enum: ['invited', 'active', 'pending_request'],
            default: 'active'
        },
        inviteEmail: String,
        inviteCode: String,
        schedule: String, // e.g. "Mon-Fri 9-5"
        showContact: {
            type: Boolean,
            default: false
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'pending', 'active', 'closed', 'rejected'],
        default: 'draft'
    },
    urgentNeeds: [{
        item: String,
        urgency: {
            type: String,
            enum: ['critical', 'high', 'normal'],
            default: 'normal'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    subscribers: [{
        type: String // Firebase UID
    }],
    verificationDocs: [String], // Array of URLs
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Point || mongoose.model('Point', PointSchema);
