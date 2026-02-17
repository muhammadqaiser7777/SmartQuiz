import Joi from 'joi';

export const loginSchema = Joi.object({
    username: Joi.string().required().messages({
        'any.required': 'Username is required',
    }),
    password: Joi.string().min(8).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
    }),
});

export type LoginDto = {
    username: string;
    password: string;
};
