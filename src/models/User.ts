import mongoose, { Schema } from 'mongoose';



const UserSchema: Schema = new Schema({
  username: {
    type: String
  },
  email_id: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  }
});

export default mongoose.model('User', UserSchema);