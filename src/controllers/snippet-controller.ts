import _ from 'lodash';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet';

// Add a snippetGroup to the database
async function createSnippetGroup({ snippetGroup }) {
    const snippetGroupDocument = await SnippetGroup.create(snippetGroup);

    return snippetGroupDocument;
}

// Add a snippet to the database
async function createSnippet({ snippet }) {
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

// Edit a snippetGroup from the database
async function editSnippetGroup({ snippetGroupId, snippetGroupData }) {
    const snippetGroup: any = await SnippetGroup.findOne({ _id: snippetGroupId}).exec();

    for ( const [key, value] of Object.entries(snippetGroupData)) {
        snippetGroup[key] = value;
    }

    await snippetGroup.save();
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

    // const snippetGroupArray = [];

    _.forEach(snippetGroups, async (snippetGroup) => {
        snippetGroup.snippets = await Snippet.find({ snippetGroupId: snippetGroup._id.toString() }).exec();
    });

    // for ( const snippetGroup of snippetGroupsDocuments ) {
    //     const snippets = await Snippet.find({ snippetGroupId: snippetGroup._id }).exec();
    //     snippetGroup.snippets = snippets;
    //     // snippetGroupArray.push({ ...snippetGroup, snippets });
    // }

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