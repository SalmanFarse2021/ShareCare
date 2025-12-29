import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ success: true, data: [] });
    }

    try {
        const regex = new RegExp(query, 'i');
        const users = await User.find({
            $or: [
                { displayName: regex },
                { email: regex }
            ]
        }).select('uid displayName email photoURL').limit(10);

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Search Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
