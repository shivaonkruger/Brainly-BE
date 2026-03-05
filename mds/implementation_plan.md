# Generate Smart Todo Route (`/smarttodo`)

This plan covers adding the `/smarttodo` route to automatically generate a daily to-do list based on a user's active roadmaps. It also details the bidirectional data flow between the Todo items and the Roadmap items based on the new requirements.

## Core Logic & Associations
**The Goal:** Automatically generate a daily To-Do list by fetching pending items from all of a user's active roadmaps. When a user marks a generated task as completed in the To-Do list, it should automatically mark the corresponding item as completed in the original Roadmap.

**The Solution:**
1. **Granularity (1 Task = 1 Hour):** To make the daily tasks measurable, we will force the AI prompt in `POST /roadmap` to generate roadmaps where tasks are broken down into **Subtasks**, where each subtask is designed to take roughly 1 hour. 
2. **Association Mechanism:** When the `/smarttodo` route pulls a subtask from a Roadmap, it needs a way to link back to it. We will add three reference fields to the `TodoTaskSchema`: 
   - `roadmapId`: The ID of the original roadmap.
   - `phaseId`: The ID of the phase within the roadmap.
   - `subtaskId`: The ID of the specific subtask.
3. **Synchronization Logic (Pseudocode):**
   When `PUT /todo/:id` is called to update a to-do list:
   ```javascript
   // 1. Update the normal Todo list
   const updatedTodo = await Todo.findByIdAndUpdate(todoId, { tasks: updatedTasks });
   
   // 2. Sync back to Roadmap
   for (let task of updatedTasks) {
       if (task.completed && task.roadmapId) {
           // Find the specific roadmap, phase, and subtask, and mark it complete
           await Roadmap.updateOne(
               { 
                   _id: task.roadmapId, 
                   "phases._id": task.phaseId, 
                   "phases.tasks.subtasks._id": task.subtaskId 
               },
               { 
                   $set: { "phases.$[phase].tasks.$[task].subtasks.$[subtask].completed": true } 
               },
               {
                   arrayFilters: [
                       { "phase._id": task.phaseId },
                       { "task.status": "pending" } // Optional safety check
                       { "subtask._id": task.subtaskId }
                   ]
               }
           );
       }
   }
   ```

---

## Proposed Changes

### [MODIFY] Roadmap Model
- Add `hoursPerWeek: { type: Number, required: true }` to `RoadmapSchema`.
- Update `TaskSchema` to include an array of `subtasks`. 
- Create a `SubtaskSchema` with `title`, `description`, and `completed: { type: Boolean, default: false }`.

### [MODIFY] Todo Model
- Update `TodoTaskSchema` (the individual items inside a Todo list) to optionally include tracking fields:
   - `roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' }`
   - `phaseId: { type: Schema.Types.ObjectId }`
   - `subtaskId: { type: Schema.Types.ObjectId }`
- Add `isSmartTodo: { type: Boolean, default: false }` to the main `TodoSchema`.

### [MODIFY] Roadmap Routes
- Update `POST /roadmap`: 
  - Parse the user's string `timeAvailability` to extract an integer for `hoursPerWeek` (e.g., regex `/\d+/`).
  - Update the AI Prompt so it returns `subtasks` for every task, instructing the Gemini model to make each subtask roughly 1 hour long.

### [MODIFY] Todo Routes
- Create `POST /smarttodo`:
  1. Fetch all `Roadmap` documents for the logged-in user.
  2. For each Roadmap, divide `hoursPerWeek / 7` to get the target number of daily subtasks (hours) for that specific roadmap.
  3. Traverse the roadmap's phases, tasks, and subtasks. Extract pending subtasks up to the calculated daily limit.
  4. Attach the exact `roadmapId`, `phaseId`, and `subtaskId` to each extracted item.
  5. Combine items from *all* roadmaps.
  6. Create exactly one Todo list with `isSmartTodo = true` containing all these tasks.
- Update `PUT /todo/:id`:
  - Execute the synchronization logic (pseudocode above) to check if any of the updated tasks have a `roadmapId`. If they do, and they are marked `completed`, update the corresponding subtask in the `Roadmap` collection.

## Verification Plan
1. **Collection Update**: Once implemented, update `postman_collection.json` adding the `POST /smarttodo` route.
2. **Synchronization Test**: Add a specific test to the Postman collection to verify that toggling a "Smart Todo" task to `completed = true` via `PUT /todo/:id` successfully updates the source subtask on the `/roadmap/:id` GET endpoint.
