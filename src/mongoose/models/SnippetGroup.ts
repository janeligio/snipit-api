import { Schema, model } from 'mongoose'

const SnippetGroupSchema = new Schema({
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    updated: {
        type: Date
    },
    title: {
        maxLength: 100,
        type: String,
        trim: true
    },
    snippets: {
        type: [Schema.Types.ObjectId],
        default: []
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

const SnippetGroup = model('SnippetGroup', SnippetGroupSchema)

export default SnippetGroup