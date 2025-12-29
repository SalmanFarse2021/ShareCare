import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Point from '@/models/Point';

export async function GET(req) {
    await dbConnect();
    try {
        const url = new URL(req.url);
        const lat = url.searchParams.get('lat');
        const lng = url.searchParams.get('lng');
        const search = url.searchParams.get('search');
        const managerId = url.searchParams.get('manager');

        let query = {};

        if (managerId) {
            const user = await User.findOne({ firebaseUid: managerId });
            if (user) query.manager = user._id;
            else return NextResponse.json({ success: true, data: [] });
        } else {
            query.status = 'active';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { publicAddress: { $regex: search, $options: 'i' } }
            ];
        }

        if (lat && lng) {
            query.publicLocation = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }
                }
            };
            // sort is handled by $near
            const points = await Point.find(query);
            return NextResponse.json({ success: true, data: points });
        }

        const points = await Point.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: points });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();

        // Sync User: Get or Create MongoDB User from Firebase UID
        const firebaseUid = body.manager; // This comes as a string
        let user = await User.findOne({ firebaseUid });

        if (!user) {
            // Create shadow user
            user = await User.create({
                firebaseUid: firebaseUid,
                email: body.email || 'unknown@example.com', // Fallback, should ensure email is passed
                displayName: body.name || 'Manager',
                role: 'manager'
            });
        }

        // Replace Firebase UID with MongoDB ObjectId
        body.manager = user._id;

        // Handle Team Array
        if (body.team && body.team.length > 0) {
            const updatedTeam = await Promise.all(body.team.map(async (member) => {
                let memberUser = await User.findOne({ firebaseUid: member.user });
                if (!memberUser) {
                    // Attempt to create if we have info, otherwise might fail or skip
                    // For self-assignment (manager is in team), we reuse 'user'
                    if (member.user === firebaseUid) {
                        memberUser = user;
                    } else {
                        // Create basic placeholder if needed, or fail. 
                        // For now assuming team[0] is self.
                        memberUser = await User.create({
                            firebaseUid: member.user,
                            email: 'pending@example.com'
                        });
                    }
                }
                return { ...member, user: memberUser._id };
            }));
            body.team = updatedTeam;
        }

        const point = await Point.create(body);
        return NextResponse.json({ success: true, data: point }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
