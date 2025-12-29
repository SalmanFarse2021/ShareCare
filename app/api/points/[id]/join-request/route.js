import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Point from '@/models/Point';
import User from '@/models/User';

export async function POST(req, { params }) {
    await dbConnect();
    const { id } = params;
    const { firebaseUid, role } = await req.json();

    if (!['member', 'volunteer'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role request' }, { status: 400 });
    }

    try {
        const point = await Point.findById(id);
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        // Get User
        const user = await User.findOne({ firebaseUid });
        if (!user) return NextResponse.json({ error: 'User profile not found. Please login.' }, { status: 404 });

        // Check if already in team
        const existingMember = point.team.find(m => m.user && m.user.toString() === user._id.toString());
        if (existingMember) {
            return NextResponse.json({ error: 'You are already in the team or have a pending request.' }, { status: 400 });
        }

        // Add Request
        point.team.push({
            user: user._id,
            role: role,
            status: 'pending_request',
            joinedAt: new Date()
        });

        await point.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
