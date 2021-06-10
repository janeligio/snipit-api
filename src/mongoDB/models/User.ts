import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
    date: { type: Date, default: Date.now() },
    username: {
        type: String, 
        minLength: 4,
        maxLength: 30,
        required: true
    },
    email: String,
    password: {
        type: String,
        minLength: 8,
        maxLength: 20,
        required: true
    },
    info: {
        name: {
            type: String,
            maxLength: 30
        },
        bio: {
            type: String,
            maxLength: 250
        }
    },
    publicSnippets: [Schema.Types.ObjectId],
    privateSnippets: [Schema.Types.ObjectId]
})

const User = model('User', UserSchema)

export default User