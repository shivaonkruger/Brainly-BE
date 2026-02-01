import mongoose, {Schema} from 'mongoose';
mongoose.connect('mongodb+srv://shiva:shivagupta@cluster0.drkxqxr.mongodb.net/brainly');


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