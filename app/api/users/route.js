import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    await dbConnect();

    try {
        const users = await User.find({})
            .select('displayName email photoURL role createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
