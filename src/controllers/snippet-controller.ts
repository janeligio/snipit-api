import _ from 'lodash';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet';


export interface SnippetGroup {
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
    /** Date at which the snippet group was created */
    updated?: Date;
}

interface Snippet {
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
    language?: string;
    /** Filename of the snippet */
    filename?: string;
    /** Order of the snippet in the snippet group */
    order?: number;
    /** Date at which the snippet was created */
    updated?: Date;

}


interface CreateSnippetGroupArgs {
    snippetGroup: SnippetGroup;
}

/**
 * @param snippetGroup
 * @returns {Promise<SnippetGroup>} The snippet group created.
 * @description Add a snippetGroup to the database
 **/
async function createSnippetGroup({ snippetGroup }: CreateSnippetGroupArgs) {
    const snippetGroupDocument = await SnippetGroup.create(snippetGroup);

    return snippetGroupDocument;
}


interface CreateSnippetArgs {
    snippet: Snippet;
}
// Add a snippet to the database
async function createSnippet({ snippet }: CreateSnippetArgs) {
    const snippetDocument = await Snippet.create(snippet);

    return snippetDocument;
}

// Delete a snippetGroup from the database and deletes its snippets
async function deleteSnippetGroup({ snippetGroupId }) {
    await Snippet.deleteMany({ snippetGroupId });
    await SnippetGroup.findOneAndDelete({ _id: snippetGroupId }).exec()
}

// Delete a snippet from the database
async function deleteSnippet({ snippetId }) {
    await Snippet.findOneAndDelete({ _id: snippetId });
}

interface EditSnippetGroupArgs {
    snippetGroupId: string;
    snippetGroupData: SnippetGroup;
    onSuccess: (snippetGroup: SnippetGroup) => void;
    onError: (error: string) => void;
}
// Edit a snippetGroup from the database
async function editSnippetGroup({ snippetGroupId, snippetGroupData, onSuccess, onError }: EditSnippetGroupArgs) {

    const query = { _id: snippetGroupId };

    try {
        const options = { new : true }; // Returns the update document
        const updatedSnippetGroup: any = await SnippetGroup
            .findOneAndUpdate(query, { ...snippetGroupData, updated: Date.now()}, options)
            .exec();

        onSuccess(updatedSnippetGroup);
    } catch (err) {
        onError("Error editing user.");
    }
}

// Edit a snippet from the database
async function editSnippet({ snippetId, snippetData }) {
    const snippet: any = await Snippet.findOne({ _id: snippetId}).exec();

    for ( const [key, value] of Object.entries(snippetData)) {
        snippet[key] = value;
    }

    await snippet.save();
}

async function findSnippetGroup({ snippetGroupId }) {
    const snippetGroup = await SnippetGroup.findById(snippetGroupId).exec();

    return snippetGroup;
}

async function findSnippetGroupWithSnippets({ snippetGroupId }) {
    const snippetGroup = await SnippetGroup.findOne({ _id: snippetGroupId }).exec();

    const snippets = await Snippet.find({ snippetGroupId }).exec();

    return { snippetGroup, snippets };
}

async function findSnippet({ snippetId }) {
    const snippet = await Snippet.findOne({ _id: snippetId }).exec();

    return snippet;
}

interface FindUserSnippetGroupsArgs {
    /** id field of user **/
    userId: string;
    /** Whether to return private snippet groups. **/
    hidden: boolean;
}

async function findUserSnippetGroups({ userId, hidden }: FindUserSnippetGroupsArgs) {

    const query: any = { userId };
    if (!hidden) query.hidden = false;

    const snippetGroups = await SnippetGroup.find(query).exec();

    _.forEach(snippetGroups, async (snippetGroup) => {
        snippetGroup.snippets = await Snippet.find({ snippetGroupId: snippetGroup._id.toString() }).exec();
    });

    return snippetGroups;
}

export {
    createSnippetGroup,
    createSnippet,
    deleteSnippetGroup,
    deleteSnippet,
    editSnippetGroup,
    editSnippet,
    findSnippetGroup,
    findSnippetGroupWithSnippets,
    findSnippet,
    findUserSnippetGroups
}