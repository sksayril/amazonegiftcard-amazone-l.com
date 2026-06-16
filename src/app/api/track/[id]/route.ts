import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Tracker from "@/models/Tracker";
import Location from "@/models/Location";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await params;

    await dbConnect();

    const tracker = await Tracker.findOne({ slug });
    if (!tracker) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({
      title: tracker.title,
      id: tracker._id,
      slug: tracker.slug,
    });
  } catch (error) {
    console.error("Error retrieving tracking campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await params;
    const { latitude, longitude, accuracy } = await request.json();

    if (latitude == null || longitude == null || accuracy == null) {
      return NextResponse.json(
        { error: "Invalid location payload data" },
        { status: 400 }
      );
    }

    await dbConnect();

    const tracker = await Tracker.findOne({ slug });
    if (!tracker) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Capture User Agent and IP address
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const newLocation = new Location({
      trackerId: tracker._id,
      latitude,
      longitude,
      accuracy,
      ip,
      userAgent,
    });

    await newLocation.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging location payload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
