import { Schema, model } from 'mongoose'
import { Snippet } from './Snippet';

export interface SnippetGroup {
    /** Unique identifier */
    _id?: string;
    /** Date created */
    date?: Date;
    /** Date at which the snippet group was created */
    updated?: Date;
    /** Id of the owner of the snippet group */
    userId?: string;
    /** Title of the snippet group */
    title?: string;
    /** Description of the snippet group */
    description?: string;
    /** Languages and topics used in the snippet group */
    tags?: string[];
    /** Whether the snippet group is only viewable by the owner */
    hidden?: boolean;
    /** Snippets in the snippet group */
    snippets?: Snippet[];
    /** After a query, the snippet group data is in this field */
    _doc?: object;
}

const SnippetGroupSchema = new Schema<SnippetGroup>({
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
        trim: true,
        default: ''
    },
    description: {
        maxLength: 1000,
        type: String,
        trim: true,
        default: ''
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    tags: {
        // Will include things like languages and topics
        type: [String],
        default: [],
    },
    likes: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    }
});

const SnippetGroupModel = model<SnippetGroup>('SnippetGroup', SnippetGroupSchema)

export default SnippetGroupModel