import PasswordValidator from 'password-validator';
const PaswordSchema = new PasswordValidator();

const isProduction = process.env.NODE_ENV === 'production';

interface PasswordRulesInterface {
    min: number,
    max: number,
    uppercase?: boolean,
    lowercase?: boolean,
    digits?: number,
    spaces?: boolean
}

let minLength;
let maxLength;

if (isProduction) {
    minLength = 8;
    maxLength = 100;
} else {
    minLength = 4;
    maxLength = 100;
}


if (isProduction) {
    PaswordSchema
        .has().uppercase() // Must have uppercase letters
        .has().lowercase() // Must have lowercase letters
        .has().digits(1) // Must have at least 1 digits
        .has().not().spaces() // Should not have spaces
        .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
}

PaswordSchema
    .is().min(minLength) // Minimum length 8
    .is().max(maxLength) // Maximum length 100

export const PasswordRules: PasswordRulesInterface = {
    min: minLength,
    max: maxLength,
};

export default PaswordSchema;