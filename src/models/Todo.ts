import mongoose, { Schema, Document } from 'mongoose';

export interface ITodoTask {
    description: string;
    completed: boolean;
    roadmapId?: mongoose.Types.ObjectId;
    phaseId?: mongoose.Types.ObjectId;
    taskId?: mongoose.Types.ObjectId;
    subtaskId?: mongoose.Types.ObjectId;
}

export interface ITodo extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    isSmartTodo: boolean;
    tasks: ITodoTask[];
    createdAt: Date;
    updatedAt: Date;
}

const TodoTaskSchema = new Schema({
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
    phaseId: { type: Schema.Types.ObjectId },
    taskId: { type: Schema.Types.ObjectId },
    subtaskId: { type: Schema.Types.ObjectId }
});

const TodoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    isSmartTodo: { type: Boolean, default: false },
    tasks: [TodoTaskSchema]
}, { timestamps: true });

export default mongoose.model<ITodo>('Todo', TodoSchema);
