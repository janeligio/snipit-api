import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
    dateCreated: { type: Date, default: Date.now() },
    email: {
        type: String, 
        minLength: 4,
        maxLength: 100,
        required: true
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 200,
        required: true
    },
    name: {
        type: String, 
        minLength: 4,
        maxLength: 100,
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