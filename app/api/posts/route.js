import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(req) {
    await dbConnect();

    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const q = url.searchParams.get('q');
        const type = url.searchParams.get('type');
        const status = url.searchParams.get('status') || 'active'; // Default to active
        const source = url.searchParams.get('source');
        const lat = parseFloat(url.searchParams.get('lat'));
        const lng = parseFloat(url.searchParams.get('lng'));
        const radius = parseInt(url.searchParams.get('radius')) || 50; // default 50km
        const sortParam = url.searchParams.get('sort') || 'nearest'; // Default to nearest

        let query = {};

        // ... filters ...

        // 1. Status Filter
        if (status !== 'all') {
            query.status = status;
        }

        // 2. Type Filter
        if (type && type !== 'all') {
            query.type = type;
        }

        // 3. Source Filter
        if (source && source !== 'all') {
            query.source = source;
        }

        const uid = url.searchParams.get('uid');
        if (uid) {
            query['user.uid'] = uid;
        }

        // 4. Text Search
        if (q) {
            query.$text = { $search: q };
        }

        // 5. Geolocation & Sorting
        let sort = {};

        // Helper: Is location valid?
        const hasLocation = !isNaN(lat) && !isNaN(lng);

        if (hasLocation) {
            // If Text Search is ON, we must use $geoWithin (because $text + $near conflict).
            // If Sort is NOT 'nearest', we must use $geoWithin (to allow other sorts).
            // If Sort IS 'nearest' and NO Text Search -> We use $near (which auto-sorts).

            const useGeoWithin = q || sortParam !== 'nearest';

            if (useGeoWithin) {
                // Geo Filtering without forced Distance Sort
                query['location.coordinates'] = {
                    $geoWithin: {
                        $centerSphere: [[lng, lat], radius / 6378.1]
                    }
                };
            } else {
                // Strict "Nearest" Sort using $near
                query['location.coordinates'] = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat]
                        },
                        $maxDistance: radius * 1000 // meters
                    }
                };
            }
        }

        // Apply Explicit Sorts
        if (q) {
            sort = { score: { $meta: "textScore" } }; // Default relevance
        }

        if (sortParam === 'newest') {
            sort = { createdAt: -1 };
        } else if (sortParam === 'urgency') {
            // Assuming we might have an 'urgency' field or just map it to createdAt for now
            sort = { urgency: -1, createdAt: -1 };
        } else if (sortParam === 'nearest' && !hasLocation) {
            // Fallback if no location data
            sort = { createdAt: -1 };
        }

        // Execute Main Query
        const posts = await Post.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Execute Count Query
        // CRITICAL FIX: countDocuments does not support $near used in 'query'. 
        // We must swap $near for $geoWithin in the count query.
        let countQuery = { ...query };
        if (countQuery['location.coordinates'] && countQuery['location.coordinates'].$near) {
            countQuery['location.coordinates'] = {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radius / 6378.1]
                }
            };
        }

        const total = await Post.countDocuments(countQuery);

        return NextResponse.json({
            success: true,
            data: posts,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error("Fetch Posts Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();

        // Sanitize location data
        if (body.location) {
            if (body.location.coordinates && Array.isArray(body.location.coordinates)) {
                body.location.type = 'Point'; // Ensure consistent GeoJSON type
            } else {
                // Remove invalid coordinates to prevent index errors
                delete body.location.coordinates;
                delete body.location.type;
            }
        }

        const post = await Post.create(body);
        return NextResponse.json({ success: true, data: post }, { status: 201 });
    } catch (error) {
        console.error("Create Post Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
