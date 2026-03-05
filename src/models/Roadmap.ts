import mongoose, { Schema, Document } from 'mongoose';

export interface ISubtask {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    completed: boolean;
}

export interface ITask {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    resources: string[]; // URLs or text
    status: 'pending' | 'completed';
    subtasks: ISubtask[];
}

export interface IPhase {
    _id?: mongoose.Types.ObjectId;
    title: string;
    tasks: ITask[];
}

export interface IRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
    goal: string;
    hoursPerWeek: number;
    phases: IPhase[];
    createdAt: Date;
    updatedAt: Date;
}

const SubtaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const TaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    resources: [{ type: String }],
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    subtasks: [SubtaskSchema]
});

const PhaseSchema = new Schema({
    title: { type: String, required: true },
    tasks: [TaskSchema]
});

const RoadmapSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: String, required: true },
    hoursPerWeek: { type: Number, required: true },
    phases: [PhaseSchema]
}, { timestamps: true });

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
