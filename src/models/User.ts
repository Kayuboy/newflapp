import mongoose, { Schema, Document } from 'mongoose';
import { compare, hash } from 'bcrypt';

export interface IUser extends Document {
  username: string;
  password: string;
  isAdmin: boolean;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Uživatelské jméno je povinné'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Heslo je povinné'],
      minlength: [4, 'Heslo musí mít alespoň 4 znaky'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Před uložením zašifrujeme heslo
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const hashedPassword = await hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Metoda pro porovnání hesla
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Vytvoření a export modelu
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 