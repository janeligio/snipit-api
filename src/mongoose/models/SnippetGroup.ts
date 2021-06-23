import { Schema, model } from 'mongoose'
import { SnippetSchema } from './Snippet';

const SnippetGroupSchema = new Schema({
    date: {
        type: Date,
        default: Date.now(),
    },
    updated: {
        type: Date
    },
    hidden: {
        type: Boolean,
        default: false,
    },
    title: {
        maxLength: 100,
        type: String,
        trim: true
    },
    description: {
        maxLength: 1000,
        type: String,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    tags: {
        // Will include things like languages and topics
        type: [String],
    },
});

const SnippetGroup = model('SnippetGroup', SnippetGroupSchema)

export default SnippetGroup