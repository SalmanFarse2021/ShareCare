import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Point from '@/models/Point';
import User from '@/models/User';
import { PERMISSIONS } from '@/lib/permissions';

// Helper to generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function GET(req, { params }) {
    await dbConnect();
    const { id } = params;

    try {
        const point = await Point.findById(id).populate('team.user', 'displayName email photoURL');
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        return NextResponse.json({ success: true, team: point.team });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    const { action, email, role, actingUserUid } = body;
    // actingUserUid: firebaseUid of the person making the request

    try {
        const point = await Point.findById(id).populate('team.user');
        if (!point) return NextResponse.json({ error: 'Point not found' }, { status: 404 });

        // Verify Permission
        const actingUser = await User.findOne({ firebaseUid: actingUserUid });
        if (!actingUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Find member in team
        const member = point.team.find(m => m.user && m.user._id.toString() === actingUser._id.toString());
        const userRole = member ? member.role : (point.manager.toString() === actingUser._id.toString() ? 'manager' : null);

        if (!PERMISSIONS.MANAGE_TEAM.includes(userRole)) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        if (action === 'approve') {
            // Check Permission: Member OR Manager can approve
            if (!PERMISSIONS.APPROVE_JOIN.includes(userRole)) {
                return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
            }

            const { memberId } = body;
            const targetMember = point.team.id(memberId);
            if (!targetMember) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

            targetMember.status = 'active';
            await point.save();
            return NextResponse.json({ success: true });
        }

        if (action === 'invite') {
            // Check Permission: Only Manager can send outbound invites (as per plan/common sense, though prompt implies invite option exists)
            // Sticking to MANAGE_TEAM for invited for now, assuming approvals are the main "Member" power
            if (!PERMISSIONS.MANAGE_TEAM.includes(userRole)) {
                return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
            }

            const code = generateCode();
            point.team.push({
                role,
                status: 'invited',
                inviteEmail: email,
                inviteCode: code,
                joinedAt: null
            });
            await point.save();
            return NextResponse.json({ success: true, inviteCode: code });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    await dbConnect();
    const { id } = params;
    const url = new URL(req.url);
    const memberId = url.searchParams.get('memberId');
    const actingUserUid = url.searchParams.get('uid');

    try {
        const point = await Point.findById(id);

        // Verify Permission (Manager Only)
        const actingUser = await User.findOne({ firebaseUid: actingUserUid });
        // Simplified check: is manager?
        if (point.manager.toString() !== actingUser._id.toString()) {
            // Check if another manager in team? For now strict owner/manager check
            const member = point.team.find(m => m.user && m.user._id.toString() === actingUser._id.toString());
            if (!member || member.role !== 'manager') {
                return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
            }
        }

        point.team = point.team.filter(t => t._id.toString() !== memberId);
        await point.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
