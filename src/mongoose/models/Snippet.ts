import { Schema, model } from 'mongoose'
import { Language, languageOptions } from '../../util/snippetLanguages'

export interface Snippet {
    /** Unique identifier */
    _id?: string;
    /** Date of creation of the snippet */
    date?: Date;
    /** Date at which the snippet was updated */
    updated?: Date;
    /** Id of the owner of the snippet */
    userId?: string;
    /** Id of the snippet group this snippet belongs to */
    snippetGroupId?: string;
    /** Title of the snippet */
    title?: string;
    /** Description of the snippet */
    description?: string;
    /** Snippet code */
    code?: string;
    /** Language of the snippet */
    language?: Language;
    /** Filename of the snippet */
    filename?: string;
    /** Order of the snippet in the snippet group */
    order?: number;

}

export const SnippetSchema = new Schema<Snippet>({
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
    }
})

const SnippetModel = model<Snippet>('Snippet', SnippetSchema)

export default SnippetModel;