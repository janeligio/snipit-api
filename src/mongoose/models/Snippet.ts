import { Schema, model } from 'mongoose'
import { languageOptions } from '../../util/snippetLanguages'

export const SnippetSchema = new Schema({
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    updated: { type: Date },
    isPrivate: {
        // Deprecate
        type: Boolean,
        default: false,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: false
    },
    owner: {
        // Deprecated - use userId to find owner of snippet
        type: Schema.Types.ObjectId,
        required: false
    },
    fileName: {
        type: String,
        maxLength: 50,
        trim: true
    },
    author: {
        // Deprecate
        type: String
    },
    title: {
        maxLength: 100,
        type: String,
        trim: true
    },
    description: {
        type: String,
        maxLength: 1000,
        trim: true
    },
    code: {
        type: String,
        maxLength: 3000,
        trim: true
    },
    language: {
        type: String,
        required: true,
        enum: languageOptions
    },
    order: {
        // The order that the snippet shows up in the SnippetGroup
        type: Number,
        required: true,
        default: 1
    },
    tags: {
        // Deprecated - use language
        type: [String],
    },
    likes: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    }
})

const Snippet = model('Snippet', SnippetSchema)

export default Snippet