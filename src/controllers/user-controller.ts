import UserModel, { User } from '../mongoose/models/User';
import bcrypt from 'bcrypt';
import CONSTANTS from '../util/constants';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/keys';

// Add a user to the database
async function createUser({ username, email, password, onSuccess, onError }) {
    const saltRounds = CONSTANTS.SALT_ROUNDS;
    const hash = await bcrypt.hash(password, saltRounds);

    try {
        const user: User = await UserModel.create({
            username,
            email,
            password: hash
        });

        const payload = { id: user._id, username };

        jwt.sign(payload, jwtSecret, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                onError("Error signing JWT.");
            } else {
                onSuccess(token);
            }
        });

    } catch (err) {
        onError("Error creating user.");
    }
}

interface DeleteUserArgs {
    id?: string;
    username?: string;
    email?: string;
    onSuccess: (user) => void;
    onError: (error: string) => void;
}

// Delete a user from the database
async function deleteUser({ id, username, email, onSuccess, onError }: DeleteUserArgs) {
    const query: any = {};
    if (id) query.id = id;
    else if (username) query.username = username;
    else if (email) query.email = email;

    try {
        const deletedUser: User = await UserModel.findOneAndDelete(query);
        onSuccess(deletedUser);
    } catch (err) {
        onError("Error deleting user.");
    }
}


interface EditUserArgs {
    id?: string;
    username?: string;
    email?: string;
    userData: User;
    onSuccess: (user) => void;
    onError: (error: string) => void;
}
// Edit a user from the database
async function editUser({ id, username, email, userData, onSuccess, onError }: EditUserArgs) {
    const query: any = {};
    if (id) query.id = id;
    else if (username) query.username = username;
    else if (email) query.email = email;

    try {

        const options = { new : true }; // Returns the update document
        userData.updated = new Date();
        const user: User = await UserModel.findOneAndUpdate(query, userData, options).exec();

        onSuccess(user);
    } catch (err) {
        onError("Error editing user.");
    }
}

interface FindUserArgs {
    /** _id field of User document. **/
    id?: string;
    /** username field of User document. **/
    username?: string;
    /** email field of User document. **/
    email?: string;
    /** Space-separated string of fields to return in the User document. **/
    selectProps?: string;
}

async function findUser({ id, username, email, selectProps }: FindUserArgs) {
    const query: any = {};
    if (id) query.id = id;
    else if (username) query.username = username;
    else if (email) query.email = email;

    const user: User = await UserModel.findOne(query, selectProps).exec();

    return user;
}

const uc = {
    createUser,
    deleteUser,
    editUser,
    findUser
};

export default uc;