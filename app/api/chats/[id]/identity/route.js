import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Message from '@/models/Message';

export async function POST(req, { params }) {
    await dbConnect();
    const { id } = await params; // Chat ID
    const body = await req.json();
    const { userId, action } = body;
    // action: 'request' (I want to reveal) OR 'approve' (I accept your reveal? No, mutual means we both agree)

    // Simpler Flow:
    // 1. User A clicks "Reveal Identity". Status becomes "Requested".
    // 2. User B sees "User A wants to share identity".
    // 3. User B clicks "Accept/Share Mine Too".
    // 4. Both identities are revealed.

    try {
        const chat = await Chat.findById(id);
        if (!chat) return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });

        // Find participant index
        const pIndex = chat.participants.findIndex(p => p.user === userId);
        if (pIndex === -1) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

        if (action === 'request') {
            // Check if ALREADY revealed
            if (chat.participants[pIndex].identityRevealed) {
                return NextResponse.json({ success: false, error: 'Already revealed' });
            }

            // Set Requested = true
            chat.participants[pIndex].identityRequested = true;

            // Check if OTHER person has ALSO requested (Mutual Consent!)
            const other = chat.participants.find(p => p.user !== userId);

            if (other && other.identityRequested) {
                // Both have requested! REVEAL BOTH!
                chat.participants.forEach(p => {
                    p.identityRevealed = true;
                    p.identityRequested = false; // Reset request state
                });
                chat.isAnonymous = false; // Chat is no longer fully anonymous

                // System Message: Mutual Reveal
                await Message.create({
                    chatId: id,
                    senderId: 'SYSTEM',
                    text: 'Identity revealed by mutual consent. You can now see each other\'s names.',
                    type: 'system'
                });
            } else {
                // Only I requested so far. Is this a "Request to show MINE" or "Request to see YOURS"?
                // The spec says: "Mutual Consent". Usually means "I am willing to show mine if you show yours".

                // System Message: Notify
                await Message.create({
                    chatId: id,
                    senderId: 'SYSTEM',
                    text: 'User has requested to share identities. Waiting for mutual consent.',
                    type: 'system'
                });
            }

            await chat.save();
            return NextResponse.json({ success: true, data: chat });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Identity Reveal Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
