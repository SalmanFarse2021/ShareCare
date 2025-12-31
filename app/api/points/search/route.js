import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Point from '@/models/Point';

export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const uid = searchParams.get('uid'); // Optional: filter by manager if needed, but requirements imply general search

    if (!query || query.length < 2) {
        return NextResponse.json({ success: true, data: [] });
    }

    try {
        const regex = new RegExp(query, 'i');
        const filter = {
            $or: [
                { name: regex },
                { publicAddress: regex }
            ],
            status: 'active'
        };

        const points = await Point.find(filter)
            .select('name publicAddress publicLocation manager')
            .limit(10);

        return NextResponse.json({ success: true, data: points });
    } catch (error) {
        console.error('Point Search Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
