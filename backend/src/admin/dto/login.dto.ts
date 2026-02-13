import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    // Example: Enforcing a minimum length and complexity for the login attempt
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, and a number',
    })
    password!: string;
}