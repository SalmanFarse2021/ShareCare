import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Point from '@/models/Point';
import User from '@/models/User';

export async function POST(req, { params }) {
    await dbConnect();
    const { id } = params; // pointId
    const { inviteCode, schedule, showContact, firebaseUid } = await req.json();

    try {
        const point = await Point.findById(id);
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        // Find the pending invite
        const memberIndex = point.team.findIndex(m => m.inviteCode === inviteCode && m.status === 'invited');
        if (memberIndex === -1) {
            return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 400 });
        }

        // Get User
        const user = await User.findOne({ firebaseUid });
        if (!user) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });

        // Update Member
        point.team[memberIndex].status = 'active';
        point.team[memberIndex].user = user._id;
        point.team[memberIndex].inviteCode = null; // Clear code
        point.team[memberIndex].joinedAt = new Date();
        point.team[memberIndex].schedule = schedule;
        point.team[memberIndex].showContact = showContact;

        await point.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
