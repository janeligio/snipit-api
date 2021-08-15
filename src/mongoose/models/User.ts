import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
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
})

const User = model('User', UserSchema)

export default User