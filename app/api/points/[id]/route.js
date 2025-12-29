import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Point from '@/models/Point';
import User from '@/models/User'; // Ensure model is registered

export async function GET(req, { params }) {
    await dbConnect();
    const { id } = params;

    try {
        const point = await Point.findById(id).populate('manager', 'displayName email photoURL');
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        // Filter valid data if needed, currently sending full object
        // Privacy: privateLocation, privateAddress should ideally be hidden if strictly public,
        // but user requirement implies "everyone can see". 
        // We will send everything for now, frontend decides display.

        return NextResponse.json({ success: true, data: point });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    const { firebaseUid, updates } = body;

    try {
        const point = await Point.findById(id);
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        // Verify Manager (or Team Member with permissions, but for now strict Manager)
        const user = await User.findOne({ firebaseUid });
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (point.manager.toString() !== user._id.toString()) {
            // Also check if admin/team manager? For now strict owner.
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        // Allowed fields
        const allowed = ['name', 'description', 'phone', 'email', 'allowedItems', 'status', 'operatingHours', 'schedule', 'urgentNeeds'];
        allowed.forEach(field => {
            if (updates[field] !== undefined) point[field] = updates[field];
        });

        await point.save();
        return NextResponse.json({ success: true, data: point });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    await dbConnect();
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('uid');

    if (!firebaseUid) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const point = await Point.findById(id);
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        // Verify Manager
        const user = await User.findOne({ firebaseUid });
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (point.manager.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        await Point.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Point deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
