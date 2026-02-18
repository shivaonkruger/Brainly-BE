import mongoose, { Schema, Document } from 'mongoose';

export interface ITask {
    title: string;
    description: string;
    resources: string[]; // URLs or text
    status: 'pending' | 'completed';
}

export interface IPhase {
    title: string;
    tasks: ITask[];
}

export interface IRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
    goal: string;
    phases: IPhase[];
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    resources: [{ type: String }],
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

const PhaseSchema = new Schema({
    title: { type: String, required: true },
    tasks: [TaskSchema]
});

const RoadmapSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: String, required: true },
    phases: [PhaseSchema]
}, { timestamps: true });

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
