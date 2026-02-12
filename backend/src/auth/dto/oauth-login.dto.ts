import * as Joi from 'joi';

export const OAuthLoginSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    authId: Joi.string().required(),
    authProvider: Joi.string().valid('google').required(),
    profilePicture: Joi.string().uri().optional(),
    idToken: Joi.string().required(), // Token from Google/Microsoft
});

export interface OAuthLoginDto {
    name: string;
    email: string;
    authId: string;
    authProvider: 'google';
    profilePicture?: string;
    idToken: string;
}
