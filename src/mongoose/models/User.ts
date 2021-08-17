import { Schema, model } from 'mongoose'

export interface User {
    /** Unique identifier */
    _id?: string;
    /** Date the account was created */
    date?: Date;
    /** Date the account details were updated */
    updated?: Date;
    /** Username */
    username?: string;
    /** Password */
    password?: string;
    /** Confirm password */
    confirmPassword?: string;
    /** Email */
    email?: string;
    /** User's name */
    name?: string;
    /** User's bio */
    bio?: string;
};

const UserSchema = new Schema<User>({
    date: {
        type: Date,
        default: Date.now(),
    },
    updated: {
        type: Date
    },
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        unique: true
    },
    email: {
        type: String,
        minLength: 4,
        maxLength: 100,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 200,
        required: true
    },
    name: {
        type: String,
        maxLength: 100,
    },
    bio: {
        type: String,
        maxLength: 250
    },
});

const UserModel = model<User>('User', UserSchema);

export default UserModel;