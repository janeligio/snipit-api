import _ from 'lodash';
import SnippetGroupModel, { SnippetGroup } from '../mongoose/models/SnippetGroup';
import SnippetModel, { Snippet } from '../mongoose/models/Snippet';


interface CreateSnippetGroupArgs {
    snippetGroup: SnippetGroup;
}

/**
 * @param snippetGroup
 * @returns {Promise<SnippetGroup>} The snippet group created.
 * @description Add a snippetGroup to the database
 **/
async function createSnippetGroup({ snippetGroup }: CreateSnippetGroupArgs) {
    const snippetGroupDocument: SnippetGroup = await SnippetGroupModel.create(snippetGroup);

    return snippetGroupDocument;
}


interface CreateSnippetArgs {
    snippet: Snippet;
}
// Add a snippet to the database
async function createSnippet({ snippet }: CreateSnippetArgs) {
    const snippetDocument: Snippet = await SnippetModel.create(snippet);

    return snippetDocument;
}

interface DeleteSnippetGroupArgs {
    /** The id of the snippet group to delete */
    snippetGroupId: string;
}
// Delete a snippetGroup from the database and deletes its snippets
async function deleteSnippetGroup({ snippetGroupId }: DeleteSnippetGroupArgs) {
    const deletedSnippetGroup: SnippetGroup = await SnippetGroupModel.findOneAndDelete({ _id: snippetGroupId }).exec()

    return deletedSnippetGroup;
}

interface DeleteSnippetGroupSnippetsArgs {
    /** The snippetGroupId of the snippets to delete */
    snippetGroupId: string;
}
// Delete all snippets with the given snippetGroupId
async function deleteSnippetGroupSnippets({ snippetGroupId }: DeleteSnippetGroupSnippetsArgs) {

    // TODO: Define an interface for this return type
    const deletedSnippets = await SnippetModel.deleteMany({ snippetGroupId });

    return deletedSnippets;
}

// Delete a snippet from the database
async function deleteSnippet({ snippetId }) {
    const deletedSnippet: Snippet = await SnippetModel.findOneAndDelete({ _id: snippetId });

    return deletedSnippet;
}

interface EditSnippetGroupArgs {
    snippetGroupId: string;
    snippetGroupData: SnippetGroup;
}
// Edit a snippetGroup from the database
async function editSnippetGroup({ snippetGroupId, snippetGroupData }: EditSnippetGroupArgs) {

    const query = { _id: snippetGroupId };
    const options = { new : true }; // Returns the updated document
    snippetGroupData.updated = new Date();

    const updatedSnippetGroup: SnippetGroup = await SnippetGroupModel
        .findOneAndUpdate(query, snippetGroupData, options)
        .exec();

    return updatedSnippetGroup;
}

interface EditSnippetArgs {
    snippetId: string;
    snippetData: SnippetGroup;
}
// Edit a snippet from the database
async function editSnippet({ snippetId, snippetData }: EditSnippetArgs) {
    const query = { _id: snippetId };
    const options = { new : true }; // Returns the updated document
    snippetData.updated = new Date();

    const updatedSnippet: Snippet = await SnippetModel
        .findOneAndUpdate(query, snippetData, options)
        .exec();

    return updatedSnippet;
}

// Finds a snippet group with the given snippetGroupId
async function findSnippetGroup({ snippetGroupId }) {
    const snippetGroup: SnippetGroup = await SnippetGroupModel.findById(snippetGroupId).exec();

    return snippetGroup;
}

// Finds all snippets with the given snippetGroupId
async function findSnippetGroupSnippets({ snippetGroupId }) {
    // const projection = 'id date updated userId snippetGroupId title description code language filename order';
    const snippets: Snippet[] = await SnippetModel.find({ snippetGroupId }).exec();

    return snippets;
}

// Finds a snippet group and all its snippets with the given snippetGroupId
async function findSnippetGroupWithSnippets({ snippetGroupId }) {
    const snippetGroup: SnippetGroup = await SnippetGroupModel.findOne({ _id: snippetGroupId }).exec();

    const snippets: Snippet[] = await SnippetModel.find({ snippetGroupId }).exec();

    return { snippetGroup, snippets };
}

async function findSnippet({ snippetId }) {
    const snippet: Snippet = await SnippetModel.findOne({ _id: snippetId }).exec();

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

    const snippetGroups: SnippetGroup[] = await SnippetGroupModel.find(query).exec();

    // await Promise.all(_.map(snippetGroups, async (snippetGroup) => {
    //     snippetGroup.snippets = await SnippetModel.find({ snippetGroupId: snippetGroup._id }).exec();
    //     return;
    //     })
    // );
    // _.forEach(snippetGroups, async (snippetGroup: SnippetGroup) => {
    //     snippetGroup.snippets = await SnippetModel.find({ snippetGroupId: snippetGroup._id.toString() }).exec();
    // });

    return snippetGroups;
}

interface QuerySnippetGroupsArgs {
    /** The query to search for snippet groups */
    query: SnippetGroup;
    /** Fields to return */
    projection?: string | object;
    /** The sort order of the snippet groups */
    sort?: {
        date?: 'ascending' | 'descending';
        language?: 'ascending' | 'descending';
    };
    /** Starting index of the results */
    skip?: number;
    /** Last index of the results */
    limit?: number;

}
async function querySnippetGroups({ query, projection, sort, skip, limit }: QuerySnippetGroupsArgs) {

    const options = { sort, skip, limit };

    const snippetGroups = await SnippetGroupModel
        .find(query, projection, options)
        .exec();
        // .sort(sort)
        // .skip(skip)
        // .limit(limit)

    _.forEach(snippetGroups, async (snippetGroup) => {
        snippetGroup.snippets = await SnippetModel.find({ snippetGroupId: snippetGroup._id.toString() }).exec();
    });

    return snippetGroups;
}

const sc = {
    createSnippetGroup,
    createSnippet,
    deleteSnippetGroup,
    deleteSnippetGroupSnippets,
    deleteSnippet,
    editSnippetGroup,
    editSnippet,
    findSnippetGroup,
    findSnippetGroupSnippets,
    findSnippetGroupWithSnippets,
    findSnippet,
    findUserSnippetGroups,
    querySnippetGroups
};

export default sc;