# Backend API & Schema Specifications for Frontend

## 1. Mongoose Schemas / Models

### User Model (`User`)
*   **Fields**:
    *   `username` (String) - Optional (no `required` flag in DB, but required in API logic).
    *   `email_id` (String) - Unique.
    *   `password` (String)

### Roadmap Model (`Roadmap`)
*   **Fields**:
    *   `userId` (ObjectId, Ref: `User`) - Required.
    *   `goal` (String) - Required.
    *   `hoursPerWeek` (Number) - Required.
    *   `phases` (Array of Phase Objects).
    *   `createdAt` & `updatedAt` (Dates) - Automatically added.

*   **Nested Phase Object**:
    *   `_id` (ObjectId)
    *   `title` (String) - Required.
    *   `tasks` (Array of Task Objects)

*   **Nested Task Object**:
    *   `_id` (ObjectId)
    *   `title` (String) - Required.
    *   `description` (String) - Required.
    *   `resources` (Array of Strings) - URLs/Text.
    *   `status` (String) - Enum: `['pending', 'completed']`, Default: `'pending'`.
    *   `subtasks` (Array of Subtask Objects)

*   **Nested Subtask Object**:
    *   `_id` (ObjectId)
    *   `title` (String) - Required.
    *   `description` (String) - Required.
    *   `completed` (Boolean) - Default: `false`.

### Todo Model (`Todo`)
*   **Fields**:
    *   `userId` (ObjectId, Ref: `User`) - Required.
    *   `title` (String) - Required.
    *   `isSmartTodo` (Boolean) - Default: `false`.
    *   `tasks` (Array of TodoTask Objects).
    *   `createdAt` & `updatedAt` (Dates) - Automatically added.

*   **Nested TodoTask Object**:
    *   `description` (String) - Required.
    *   `completed` (Boolean) - Default: `false`.
    *   `roadmapId` (ObjectId, Ref: `Roadmap`) - Optional.
    *   `phaseId` (ObjectId) - Optional.
    *   `taskId` (ObjectId) - Optional.
    *   `subtaskId` (ObjectId) - Optional.

### Content Model (`Content`)
*   **Fields**:
    *   `userId` (ObjectId, Ref: `User`) - Required.
    *   `title` (String) - Required, trimmed.
    *   `link` (String) - Required.
    *   `description` (String) - Required.
    *   `sourceType` (String) - Enum (typed in TS as): `"twitter" | "youtube" | "reddit" | "other"`.
    *   `createdAt` & `updatedAt` (Dates) - Automatically added.

---

## 2. API Routes

### Authentication Routes

#### POST `/api/signup`
*   **Purpose**: Register a new user.
*   **Auth Required**: No.
*   **Request Body**:
    *   `username` (String)
    *   `email_id` (String)
    *   `password` (String)
*   **Responses**:
    *   `201 Created`: `{ message: "User created successfully" }`
    *   `400 Bad Request`: `{ message: "Username and password are required" }`
    *   `409 Conflict`: `{ message: "Email already registered" }`

#### POST `/api/signin`
*   **Purpose**: Login and receive JWT.
*   **Auth Required**: No.
*   **Request Body**:
    *   `username` (String)
    *   `password` (String)
*   **Responses**:
    *   `200 OK`: `{ message: "Signin successful", token: "<jwt_token_string>" }`
    *   `400 Bad Request`: `{ message: "Missing credentials" }`
    *   `401 Unauthorized`: `{ message: "Invalid credentials" }`

---

### Content Routes (MyBrain)
**Base path**: `/api/mybrain`

#### GET `/api/mybrain`
*   **Purpose**: Get all tracked content for the currently authenticated user.
*   **Auth Required**: Yes (`Bearer <token>`).
*   **Query Params**: None.
*   **Returns**: `{ message: "Content fetched successfully", contents: [ { _id, title, link, description, sourceType, createdAt, updatedAt } ] }` (Sorted newest first).

#### POST `/api/mybrain`
*   **Purpose**: Create a new content memory.
*   **Auth Required**: Yes.
*   **Request Body**:
    *   `title` (String)
    *   `link` (String)
    *   `description` (String)
    *   `sourceType` (String) - *See Enums*
*   **Returns**: `{ message: "Content added successfully", content: { ...createdObj } }`

#### PUT `/api/mybrain/:id`
*   **Purpose**: Edit an existing content memory.
*   **Auth Required**: Yes.
*   **URL Params**: `id` (Content Document ObjectId).
*   **Request Body**: Same as POST.
*   **Returns**: `{ message: "Content updated successfully", content: { ...updatedObj } }`

#### DELETE `/api/mybrain/:id`
*   **Purpose**: Delete content memory.
*   **Auth Required**: Yes.
*   **URL Params**: `id` (Content Document ObjectId).
*   **Returns**: `{ message: "Content deleted successfully" }`

---

### Roadmap Routes
**Base path**: `/api/roadmap`

#### GET `/api/roadmap`
*   **Purpose**: Get all active roadmaps for the user.
*   **Auth Required**: Yes.
*   **Returns**: `{ roadmaps: [ { _id, goal, hoursPerWeek, phases, createdAt, updatedAt } ] }` (Sorted newest first).

#### GET `/api/roadmap/:id`
*   **Purpose**: Get deep details / full phases of a specific roadmap.
*   **Auth Required**: Yes.
*   **URL Params**: `id` (Roadmap Document ObjectId).
*   **Returns**: `{ roadmap: { ...roadmapObj } }`

#### POST `/api/roadmap`
*   **Purpose**: Generate a brand new AI roadmap via LLM integration. (Note: Can take multiple seconds to execute).
*   **Auth Required**: Yes.
*   **Request Body**:
    *   `goal` (String) - Required.
    *   `category` (String) - Required.
    *   `currentLevel` (String) - Required.
    *   `timeAvailability` (String/Number) - Required. Backend parses string for integer (e.g. "10").
    *   `deadline` (String) - Required.
    *   `learningStyle` (String)
    *   `budget` (String)
*   **Returns**: `{ message: "Roadmap created", roadmap: { ...createdObj } }`

#### PUT `/api/roadmap/:id`
*   **Purpose**: Update roadmap information.
*   **Auth Required**: Yes.
*   **URL Params**: `id`
*   **Request Body**:
    *   `goal` (String)
    *   `phases` (Array of Phase Objects).
*   **Returns**: `{ message: "Roadmap updated", roadmap: { ...updatedObj } }`

#### DELETE `/api/roadmap/:id`
*   **Purpose**: Delete a roadmap.
*   **Auth Required**: Yes.
*   **URL Params**: `id`
*   **Returns**: `{ message: "Roadmap deleted" }`

---

### Todo Routes
**Base path**: `/api/todo`

#### GET `/api/todo`
*   **Purpose**: Fetch all created Todo Lists for the user.
*   **Auth Required**: Yes.
*   **Returns**: `{ todos: [ { _id, title, isSmartTodo, tasks, createdAt, updatedAt } ] }` (Sorted newest first).

#### POST `/api/todo`
*   **Purpose**: Create a standalone daily Todo list block.
*   **Auth Required**: Yes.
*   **Request Body**:
    *   `title` (String) - Required.
    *   `tasks` (Array of Objects) - Optional, array shape: `[{ description: string }]`
*   **Returns**: `{ message: "Todo created successfully", todo: { ...createdObj } }`

#### POST `/api/todo/smarttodo`
*   **Purpose**: Auto-generates a single "Smart Todo" for the day by querying all active roadmaps and finding pending subtasks up to the user's daily hours limit.
*   **Auth Required**: Yes.
*   **Request Body**: None (Uses user's active roadmaps).
*   **Returns**: `{ message: "Smart Todo created successfully", todo: { ...createdObj } }` **OR** `200 OK: { message: "No pending tasks found across roadmaps." }`

#### PUT `/api/todo/:id`
*   **Purpose**: Update a Todo block (most commonly toggling sub-task checkboxes).
*   **Auth Required**: Yes.
*   **URL Params**: `id`
*   **Request Body**:
    *   `title` (String)
    *   `tasks` (Array of TodoTask objects with updated `completed` booleans).
*   **WARNING - Smart Sync**: If updating a `SmartTodo` (`isSmartTodo: true`), checking off tasks will implicitly trigger a database update that modifies the *underlying Roadmap subtasks* as completed based on their parent IDs.
*   **Returns**: `{ message: "Todo updated successfully", todo: { ...updatedObj } }`

#### DELETE `/api/todo/:id`
*   **Purpose**: Delete a specific Todo item.
*   **Auth Required**: Yes.
*   **URL Params**: `id`
*   **Returns**: `{ message: "Todo deleted successfully" }`

---

## 3. Auth System

*   **Mechanism**: JWT (JSON Web Tokens). Sent via standard `Authorization: Bearer <token>` HTTP header.
*   **Payload Shape**:
    ```json
    {
      "userId": "65b93d...abc",
      "username": "exampleUser123"
    }
    ```
*   **Expiration**: Fixed at `1h` (1 hour) from sign-in moment.
*   **Token Delivery**: Sent back ONLY on successful `/api/signin`. Not automatically set in a cookie. Frontend must manage token lifecycles (e.g. keeping it in Context/localStorage and sending to `axios.interceptors`).
*   **Protected Zones**: ALL routes (except `signup` and `signin`) will reject requests lacking a valid token with a `401 Unauthorized` status.

---

## 4. Enums and Constants

*   **Roadmap Task Status (`status`)**:
    *   `'pending'` (Default)
    *   `'completed'`
*   **Content Source Type (`sourceType`)**: *(Defined in TS Interface)*
    *   `"twitter"`
    *   `"youtube"`
    *   `"reddit"`
    *   `"other"`

---

## 5. Relationships Between Collections

*   **User As Root**: The User collection functions as the root. `Roadmap`, `Todo`, and `Content` collections all contain references back (`userId: { type: Schema.Types.ObjectId, ref: 'User' }`).
*   **Standard Embedded Arrays (No Refs)**:
    *   `Roadmap` contains pure embedded nested objects: `Phases` -> `Tasks` -> `Subtasks`. 
    *   `Todo` contains embedded array of `tasks`.
*   **Cross-Collection Pointers (Soft Refs)**:
    *   Elements inside `Todo.tasks` (when created by `/api/todo/smarttodo`) carry exact coordinates pointing back to the nested schema in `Roadmap` documents via:
        *   `roadmapId` (References parent Roadmap doc)
        *   `phaseId` 
        *   `taskId` 
        *   `subtaskId` 
    *   The backend relies heavily on this path architecture to automatically push completion statuses back to the roadmap when hitting `PUT /api/todo/:id`.

---

## 6. Validation Rules (Field-level)

*   **Password / Username Constraints**: The backend does NOT limit or check string lengths, casing, or specify special character regex patterns natively. 
*   **Email Handling**: Mongoose utilizes `unique: true` index on `email_id`. Duplicate emails produce a strict `409 Conflict`.
*   **Trim Constraints**: `Content` title text gets physically `.trim()` executed upon creation against leading/trailing spaces.
*   **Empty Checks**: Missing required fields generally return simple `400 Bad Request` messages (e.g. `!title || !link || !description`). 

---

## 7. File Uploads
*   **No backend file ingestion/multipart parsers**.
*   Files/media are tracked completely via off-site URLs (`link` in Content, `resources` array of URLs in Roadmap).

---

## 8. Pagination / Filtering Conventions

*   **Pagination Status**: **None**.
    *   API routes output the comprehensive totality of elements fetched for an authenticated user at once. Frontend implementations should handle any pagination or lazy loading client-side.
*   **Filtering**: **None Backend Driven**.
    *   Query parameters functionally do not adjust outputs. 
    *   The frontend needs to execute array filters/reductions to build isolated or categorized views.
*   **Sorting Rule**: Always implicit.
    *   All multiple-result endpoints inherently return arrays sorted chronologically, latest-first based on `sort({ createdAt: -1 })`.
