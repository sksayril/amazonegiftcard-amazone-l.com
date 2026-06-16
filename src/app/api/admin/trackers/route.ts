import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Tracker from "@/models/Tracker";
import { verifyAdmin } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Aggregate trackers with location record count
    const trackers = await Tracker.aggregate([
      {
        $lookup: {
          from: "locations", // mongoose model is Location, so collection is locations
          localField: "_id",
          foreignField: "trackerId",
          as: "logs",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          createdAt: 1,
          logsCount: { $size: "$logs" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return NextResponse.json({ trackers });
  } catch (error) {
    console.error("Error fetching trackers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate unique random alphanumeric slug
    let slug = "";
    let isUnique = false;
    
    while (!isUnique) {
      slug = crypto.randomBytes(6).toString("hex"); // e.g. "a1b2c3d4e5f6"
      const existing = await Tracker.findOne({ slug });
      if (!existing) {
        isUnique = true;
      }
    }

    const newTracker = new Tracker({
      title: title.trim(),
      slug,
    });

    await newTracker.save();

    return NextResponse.json({ success: true, tracker: newTracker }, { status: 201 });
  } catch (error) {
    console.error("Error creating tracker:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
