interface ValidationMessage {
    isValid: boolean,
    error: string
}

export function validateLogin(email: string, password: string):ValidationMessage {
    const message: ValidationMessage = {
        isValid: true,
        error: undefined
    }
    return message;
}

export function validateSignup(email: string, password: string):ValidationMessage {
    const message: ValidationMessage = {
        isValid: true,
        error: undefined
    }
    return message;
}