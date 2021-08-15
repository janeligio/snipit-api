import EmailValidator from 'email-validator';
import _ from 'lodash';
import PasswordSchema, { PasswordRules } from '../config/validationConfig';
import User from '../mongoose/models/User';
import CONSTANTS from '../util/constants';

export interface ValidationMessage {
    isValid: boolean;
    errors: string;
}

export async function validateLogin(email: string, password: string): Promise<ValidationMessage> {
    const message: ValidationMessage = {
        isValid: true,
        errors: undefined,
    };

    // Check if email exists (user is in the database)
    const user = await User.findOne({ email }, 'email').exec();
    if (!user) {
        message.isValid = false;
        message.errors = 'Email does not exist.';
    }

    return message;
}

export async function validateSignup(email: string, password: string, confirmPassword: string): Promise<ValidationMessage> {
    const message: ValidationMessage = {
        isValid: true,
        errors: undefined,
    };

    // Check if email already exists
    const user = await User.findOne({ email }, 'email').exec();
    if (user) {
        message.isValid = false;
        message.errors = 'Email is already being used.';
    }
    // Check email
    if (!EmailValidator.validate(email)) {
        message.isValid = false;
        message.errors = 'Invalid email.';
        return message;
    }

    // Check password
    if (password !== confirmPassword) {
        message.isValid = false;
        message.errors = 'Passwords do not match.';
        return message;
    }

    const isValidPassword = PasswordSchema.validate(password, { list: true });

    if (isValidPassword.length > 0) {
        const rulesBroken: string[] = [];
        isValidPassword.forEach(ruleBroken => {
            let message = 'Password must ';
            switch (ruleBroken) {
                case 'min':
                    rulesBroken.push(message + `have at least ${PasswordRules.min} characters`);
                    break;
                case 'max':
                    rulesBroken.push(message + `have fewer than ${PasswordRules.max + 1} characters`);
                    break;
                case 'digits':
                    // Fill in
                    break;
                case 'space':
                    // Fill in
                    break;
                case 'lowercase':
                    // Fill in
                    break;
                case 'uppercase':
                    // Fill in
                    break;
                default:
                    break;
            }
        })
        message.isValid = false;
        message.errors = 'Password must ' + rulesBroken.join(', ') + '.';
        return message;
    }

    return message;
}

export function validateSnippetGroup(snippetGroup): ValidationMessage {
    const { hidden, title, description, tags, snippets } = snippetGroup;

    const message: ValidationMessage = {
        isValid: true,
        errors: undefined,
    };

    if (hidden !== undefined && typeof (hidden) !== 'boolean') {
        message.isValid = false;
        message.errors = 'Hidden must be a boolean value';
        return message;
    }

    if (typeof title !== 'string' && title.length > 100) {
        message.isValid = false;
        message.errors = 'Title must be fewer than 100 characters';
        return message;
    }

    // _.forEach(snippets, async (snippet) => {
    //     const { isValid, errors } = await validateSnippet(snippet);
    //     if (!isValid) {
    //         message.isValid = isValid;
    //         message.errors = errors;
    //         return message;
    //     }
    // });

    return message;
}

export function validateSnippet(snippet): ValidationMessage {
    const { fileName, title, description, code, language, order } = snippet;

    const message: ValidationMessage = {
        isValid: true,
        errors: undefined,
    };

    if (fileName !== undefined && fileName.length > 50) {
        message.isValid = false;
        message.errors = 'Filename character count must be fewer than 50 characters';
        return message;
    }

    if (title !== undefined && title.length > 100) {
        message.isValid = false;
        message.errors = 'Title must be fewer than 100 characters';
        return message;
    }

    if (description !== undefined && description.length > 1000) {
        message.isValid = false;
        message.errors = 'Description must be fewer than 1000 characters';
        return message;
    }

    if (code !== undefined && code.length > 3000) {
        message.isValid = false;
        message.errors = 'Code character count must be fewer than 3000 characters';
        return message;
    }

    if (language !== undefined && language.length < 1) {
        message.isValid = false;
        message.errors = 'Language options must be present';
        return message;
    }

    if (order !== undefined && typeof (order) !== 'number') {
        message.isValid = false;
        message.errors = 'Order must be a number';
        return message;
    }

    return message;
}

export async function validateBio(name, bio): Promise<ValidationMessage> {
    const message: ValidationMessage = {
        isValid: true,
        errors: undefined,
    };

    if (name.length > 100 || name.length < 4) {
        message.isValid = false;
        message.errors = 'Name must be fewer than 30 characters';
    }

    if (bio.length > 250) {
        message.isValid = false;
        message.errors = 'Bio must be fewer than 250 characters';
    }

    return message;
}

export const validateRegister = async ({ username, email, password, confirmPassword }): Promise<ValidationMessage> => {
    const {
        SCHEMAS: {
            USER: { USERNAME, EMAIL, PASSWORD }
        } } = CONSTANTS;

    const message: ValidationMessage = {
        isValid: true,
        errors: undefined
    }

    let user;

    // Validate username
    if (typeof username !== 'string') {
        message.isValid = false;
        message.errors = 'Must provide username.';
        return message;
    }
    if (username.length < USERNAME.MIN_LENGTH) {
        message.isValid = false;
        message.errors = `Username must have at least ${USERNAME.MIN_LENGTH} characters.`;
        return message;
    }
    if (username.length > USERNAME.MAX_LENGTH) {
        message.isValid = false;
        message.errors = `Username must have fewer than ${USERNAME.MAX_LENGTH} characters.`;
        return message;
    }
    user = await User.findOne({ username }).exec();
    if (user) {
        message.isValid = false;
        message.errors = 'Username taken.';
        return message;
    }

    // Validate email

    // Check if email already exists
    user = await User.findOne({ email }).exec();
    if (user) {
        message.isValid = false;
        message.errors = 'Email is already being used.';
    }
    // Check email
    if (!EmailValidator.validate(email)) {
        message.isValid = false;
        message.errors = 'Invalid email.';
        return message;
    }

    // Validate password
    if (password !== confirmPassword) {
        message.isValid = false;
        message.errors = 'Passwords do not match.';
        return message;
    }

    const isValidPassword = PasswordSchema.validate(password, { list: true });

    if (isValidPassword.length > 0) {
        const rulesBroken: string[] = [];
        isValidPassword.forEach(ruleBroken => {
            let message = 'Password must ';
            switch (ruleBroken) {
                case 'min':
                    rulesBroken.push(message + `have at least ${PasswordRules.min} characters`);
                    break;
                case 'max':
                    rulesBroken.push(message + `have fewer than ${PasswordRules.max + 1} characters`);
                    break;
                case 'digits':
                    // Fill in
                    break;
                case 'space':
                    // Fill in
                    break;
                case 'lowercase':
                    // Fill in
                    break;
                case 'uppercase':
                    // Fill in
                    break;
                default:
                    break;
            }
        })
        message.isValid = false;
        message.errors = 'Password must ' + rulesBroken.join(', ') + '.';
        return message;
    }

    return message;
}

export const validateLogin_v2 = async ({ username, email }): Promise<ValidationMessage> => {
    const message: ValidationMessage = {
        isValid: true,
        errors: undefined,
    };

    // If username is provided, check if it exists
    if (username && typeof username === 'string' && username.length > 0) {
        const user = await User.findOne({ username }).exec();
        if (!user) {
            message.isValid = false;
            message.errors = 'User does not exist.'
            return message;
        }
        return message;
    }

    // Check if email exists (user is in the database)
    if (email && typeof email === 'string' && email.length > 0) {
        const user = await User.findOne({ email }, 'email').exec();
        if (!user) {
            message.isValid = false;
            message.errors = 'Email does not exist.';
            return message;
        }
        return message;
    }

    // If username or email is not provided return error
    message.isValid = false;
    message.errors = 'Must provide username or email.';
    return message;
}

export const validateEditUser = async ({ name, bio }): Promise<ValidationMessage> => {
    const message: ValidationMessage = {
        isValid: true,
        errors: undefined
    }

    // Validate name
    if (typeof name === 'string' && name.length > 0) {
        if (name.length > 100) {
            message.isValid = false;
            message.errors = 'Name must be fewer than 100 characters';
        }
        return message;
    }

    // Validate bio
    if (typeof bio === 'string' && bio.length > 0) {
        if (bio.length > 250) {
            message.isValid = false;
            message.errors = 'Bio must be fewer than 250 characters';
        }
        return message;
    }

    return message;
};