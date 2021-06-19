import { Schema, model } from 'mongoose'

const SnippetGroupSchema = new Schema({
    date: { type: Date, default: Date.now() },
    updated: Date,
    snippets: {
        type: [Schema.Types.ObjectId],
        default: []
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

const SnippetGroup = model('Snippet', SnippetGroupSchema)

export default SnippetGroup