import { Schema, model } from 'mongoose'
import { languageOptions } from '../../util/snippetLanguages'

export const SnippetSchema = new Schema({
    date: {
        type: Date,
        default: Date.now(),
    },
    updated: {
        type: Date
    },
    userId: {
        // The owner of this snippet, used to verify if user has permission
        type: Schema.Types.ObjectId,
        required: true
    },
    snippetGroupId: {
        // Maps the relationship to its snippet group
        type: Schema.Types.ObjectId,
        required: true
    },
    fileName: {
        type: String,
        maxLength: 50,
        trim: true
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