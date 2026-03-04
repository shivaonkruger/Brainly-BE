import mongoose, { Schema, Document } from 'mongoose';

export interface ITodoTask {
    description: string;
    completed: boolean;
}

export interface ITodo extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    tasks: ITodoTask[];
    createdAt: Date;
    updatedAt: Date;
}

const TodoTaskSchema = new Schema({
    description: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const TodoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    tasks: [TodoTaskSchema]
}, { timestamps: true });

export default mongoose.model<ITodo>('Todo', TodoSchema);
