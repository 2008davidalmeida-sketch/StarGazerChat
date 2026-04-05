/*
This file contains utility functions to validate user input for authentication. 
The validateAuthRegister function checks if the username and password meet certain criteria, 
such as being non-empty, having a maximum length for the username, and a minimum length for the password. 
The validateAuthLogin function checks if the username and password are provided.
It returns an error message if any validation fails, or null if the input is valid.
*/

export function validateAuthRegister(username, password) {
    if (!username || !password) return 'Please enter all fields';
    if (username.length > 15) return 'Username must be less than 15 characters';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
}

export function validateAuthLogin(username, password) {
    if (!username || !password) return 'Please enter all fields';
    return null;
}