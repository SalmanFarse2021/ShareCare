import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error('Settings GET Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { uid, displayName, photoURL, bio, location, preferences } = body;

        if (!uid) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        await dbConnect();

        // Update fields
        const updateData = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (photoURL !== undefined) updateData.photoURL = photoURL;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (preferences !== undefined) updateData.preferences = preferences;

        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid: uid },
            { $set: updateData },
            { new: true, upsert: true } // Upsert ensures user exists if sync failed
        );

        return NextResponse.json({ success: true, data: updatedUser });

    } catch (error) {
        console.error('Settings PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
