import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export async function POST(req, { params }) {
    await dbConnect();
    const { id } = await params;

    try {
        const body = await req.json();
        const { requester } = body; // { uid, displayName, photoURL }

        if (!requester || !requester.uid) {
            return NextResponse.json({ success: false, error: 'Requester information missing' }, { status: 400 });
        }

        // Fetch post to check current status (Auto-lock logic)
        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
        }

        if (post.status !== 'active') {
            return NextResponse.json({ success: false, error: 'Item is no longer available' }, { status: 409 }); // 409 Conflict
        }

        // Prevent owner from booking their own item
        if (post.user.uid === requester.uid) {
            return NextResponse.json({ success: false, error: 'You cannot book your own item' }, { status: 400 });
        }

        // Lock item
        post.status = 'requested';
        post.requester = {
            ...requester,
            requestedAt: new Date()
        };

        await post.save();

        return NextResponse.json({ success: true, data: post });

    } catch (error) {
        console.error("Request Item Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
