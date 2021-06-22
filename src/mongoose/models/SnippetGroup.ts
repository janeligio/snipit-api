import { Schema, model } from 'mongoose'
import { SnippetSchema } from './Snippet';

const SnippetGroupSchema = new Schema({
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    private: {
        alias: 'isPrivate',
        type: Boolean,
        default: false,
    },
    updated: {
        type: Date
    },
    title: {
        maxLength: 100,
        type: String,
        trim: true
    },
    // snippets: {
    //     type: [SnippetSchema],
    //     default: []
    // },
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