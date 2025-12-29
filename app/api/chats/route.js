import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';

// Helper to get basic user info for participants (masked or not)
async function populateParticipants(chats, currentUserId) {
    // Identity is now always revealed by default (Feature change)
    return Promise.all(chats.map(async (chat) => {
        const chatObj = chat.toObject();

        // Enhance participants with basic info
        chatObj.participants = await Promise.all(chatObj.participants.map(async (p) => {
            // Fetch real user name
            const u = await User.findOne({ firebaseUid: p.user }).select('displayName photoURL');

            // Always return full details
            return { ...p, displayName: u?.displayName || 'User', photoURL: u?.photoURL };
        }));

        return chatObj;
    }));
}

export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    try {
        const chats = await Chat.find({ 'participants.user': userId })
            .sort({ updatedAt: -1 })
            .limit(20);

        const enrichedChats = await populateParticipants(chats, userId);

        return NextResponse.json({ success: true, data: enrichedChats });
    } catch (error) {
        console.error('Chat List Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    const body = await req.json();
    let { participants, context, targetUserId, currentUserId } = body;

    // Support "Direct Message" shorthand
    if (targetUserId && currentUserId) {
        participants = [
            { user: currentUserId, role: 'requester', identityRequested: false, identityRevealed: true },
            { user: targetUserId, role: 'donor', identityRequested: false, identityRevealed: true } // Default roles for direct DM
        ];
        context = { type: 'direct', itemId: 'direct_inquiry' };
    }

    if (!participants || participants.length < 2) {
        return NextResponse.json({ success: false, error: 'Invalid participants' }, { status: 400 });
    }

    try {
        // Check if chat already exists for these participants
        // For 'direct' chats, we loosen the check to ANY chat between these two, or specific direct one?
        // Let's check for an existing 'direct' chat specifically, OR if context.itemId matches.

        const query = {
            'participants.user': { $all: participants.map(p => p.user) }
        };

        // If it's a specific item context, strict match.
        // If it's direct, maybe we reuse the last active direct chat?
        if (context && context.itemId !== 'direct_inquiry') {
            query['context.itemId'] = context.itemId;
        } else {
            // For direct messages, try to find an active direct chat
            query['context.type'] = 'direct';
        }

        let existing = await Chat.findOne(query);

        if (existing) {
            return NextResponse.json({ success: true, data: existing, message: 'Chat exists' });
        }

        const newChat = await Chat.create({
            participants, // Starts anonymous by default
            context,
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days for direct chats
        });

        return NextResponse.json({ success: true, data: newChat });
    } catch (error) {
        console.error('Chat Create Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
