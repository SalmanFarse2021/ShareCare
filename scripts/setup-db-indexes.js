const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

const PostSchema = new mongoose.Schema({
    location: {
        address: String,
        coordinates: [Number]
    },
    title: String,
    description: String
});
// Ensure schema matches what we want to index
PostSchema.index({ location: '2dsphere' });
PostSchema.index({ title: 'text', description: 'text' });
PostSchema.index({ type: 1, status: 1 });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Creating Indexes...');
        await Post.createIndexes();
        console.log('Indexes created successfully');

        const indexes = await Post.listIndexes();
        console.log('Current Indexes:', indexes);

    } catch (error) {
        console.error('Error creating indexes:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
