import { Schema, model } from 'mongoose'

const SnippetSchema = new Schema({
    date: { type: Date, default: Date.now()},
    updated: { type: Date },
    isPrivate: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true
    },
    author: {
        type: String
    },
    title: {
        maxLength: 100,
        type: String
    },
    description: {
        type: String,
        maxLength: 1000,
    },
    code: {
        type: String,
        maxLength: 3000
    },
    tags: [String],
    likes: {
        type: Number,
        default: 0
    }
})

const Snippet = model('Snippet', SnippetSchema)

export default Snippet