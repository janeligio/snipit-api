import EmailValidator from 'email-validator';
import PasswordSchema, { PasswordRules } from '../config/validationConfig';
import User from '../mongoose/models/User';

interface ValidationMessage {
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
            let message = '- Password must ';
            switch (ruleBroken) {
                case 'min':
                    rulesBroken.push(message + `have at least ${PasswordRules.min} characters.`);
                    break;
                case 'max':
                    rulesBroken.push(message + `have fewer than ${PasswordRules.max + 1} characters.`);
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
        message.errors = rulesBroken.join('\n');
        return message;
    }

    return message;
}
