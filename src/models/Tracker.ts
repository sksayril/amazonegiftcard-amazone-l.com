import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITracker extends Document {
  title: string;
  slug: string; // Unique URL code
  createdAt: Date;
}

const TrackerSchema = new Schema<ITracker>({
  title: {
    type: String,
    required: [true, "Please provide a title for this tracking campaign"],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tracker: Model<ITracker> =
  mongoose.models.Tracker || mongoose.model<ITracker>("Tracker", TrackerSchema);

export default Tracker;
