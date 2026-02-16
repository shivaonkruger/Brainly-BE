import mongoose, { Schema, Document } from "mongoose";

export interface IContent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  link: string;
  description: string;
  sourceType: "twitter" | "youtube" | "reddit" | "other";
}

const ContentSchema = new Schema<IContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    link: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

export default mongoose.model<IContent>("Content", ContentSchema);
