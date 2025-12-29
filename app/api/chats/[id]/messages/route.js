import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import Chat from '@/models/Chat';
import { checkMessageSafety } from '@/lib/safety';

export async function GET(req, { params }) {
    await dbConnect();
    const { id } = await params; // Chat ID

    try {
        const messages = await Message.find({ chatId: id })
            .sort({ createdAt: 1 }); // Oldest first
        return NextResponse.json({ success: true, data: messages });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    await dbConnect();
    const { id } = await params; // Chat ID
    const body = await req.json();
    const { senderId, text, type = 'text' } = body;

    // 1. Safety Check (if text message)
    if (type === 'text') {
        const safety = checkMessageSafety(text);
        if (!safety.isSafe) {
            return NextResponse.json({
                success: false,
                error: 'Message Blocked',
                reason: safety.reason,
                violations: safety.violations
            }, { status: 400 });
        }
    }

    try {
        // 2. Verify Chat exists & User is participant
        const chat = await Chat.findById(id);
        if (!chat) return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });

        if (chat.status === 'expired') {
            return NextResponse.json({ success: false, error: 'Chat has expired' }, { status: 403 });
        }

        const isParticipant = chat.participants.some(p => p.user === senderId);
        if (!isParticipant) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        // 3. Create Message
        const message = await Message.create({
            chatId: id,
            senderId,
            text,
            type
        });

        // 4. Update Chat Metadata (Last Message)
        chat.lastMessage = {
            text: type === 'text' ? text : '[System Message]',
            senderId,
            sentAt: new Date()
        };
        await chat.save();

        return NextResponse.json({ success: true, data: message });

    } catch (error) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
