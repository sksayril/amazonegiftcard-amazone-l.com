import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
  trackerId: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy: number;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

const LocationSchema = new Schema<ILocation>({
  trackerId: {
    type: Schema.Types.ObjectId,
    ref: "Tracker",
    required: true,
    index: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  ip: {
    type: String,
    default: "Unknown",
  },
  userAgent: {
    type: String,
    default: "Unknown",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
