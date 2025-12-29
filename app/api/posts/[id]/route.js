import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
export async function GET(req, { params }) {
    await dbConnect();
    const { id } = await params;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Get Post Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
export async function PUT(req, { params }) {
    await dbConnect();
    const { id } = await params;

    try {
        const body = await req.json();
        const { user: requestUser, ...updateData } = body;

        // Fetch existing post to verify ownership
        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
        }

        // Verify ownership OR requester status for lifecycle updates
        const isOwner = post.user.uid === requestUser.uid;
        const isRequester = post.requester?.uid === requestUser.uid;

        if (!isOwner && !isRequester) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        // If requester, ensure they are only updating status
        if (isRequester && !isOwner) {
            // Requester can only change status to 'active' (cancel) or 'completed' (taken)
            if (Object.keys(updateData).some(key => key !== 'status' && key !== 'requester')) {
                return NextResponse.json({ success: false, error: 'Requesters can only update status' }, { status: 403 });
            }
        }

        // Update fields
        const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        return NextResponse.json({ success: true, data: updatedPost });
    } catch (error) {
        console.error("Update Post Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    await dbConnect();
    const { id } = await params;

    try {
        const body = await req.json(); // Expecting { uid: '...' } for verification
        const { uid } = body;

        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
        }

        if (post.user.uid !== uid) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await Post.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error("Delete Post Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
