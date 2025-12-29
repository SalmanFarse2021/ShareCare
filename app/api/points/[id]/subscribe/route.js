import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Point from '@/models/Point';

export async function POST(req, { params }) {
    await dbConnect();
    const { id } = params;
    const { firebaseUid, action } = await req.json(); // action: 'subscribe' | 'unsubscribe'

    if (!firebaseUid) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const point = await Point.findById(id);
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        if (action === 'subscribe') {
            if (!point.subscribers.includes(firebaseUid)) {
                point.subscribers.push(firebaseUid);
            }
        } else if (action === 'unsubscribe') {
            point.subscribers = point.subscribers.filter(uid => uid !== firebaseUid);
        }

        await point.save();
        return NextResponse.json({ success: true, subscribers: point.subscribers });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
