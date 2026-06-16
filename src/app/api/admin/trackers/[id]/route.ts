import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Tracker from "@/models/Tracker";
import Location from "@/models/Location";
import { verifyAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const tracker = await Tracker.findById(id);
    if (!tracker) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    const locations = await Location.find({ trackerId: id }).sort({
      timestamp: -1,
    });

    return NextResponse.json({ tracker, locations });
  } catch (error) {
    console.error("Error fetching tracker details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const tracker = await Tracker.findByIdAndDelete(id);
    if (!tracker) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    // Delete all location logs associated with this tracker
    await Location.deleteMany({ trackerId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tracker:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
