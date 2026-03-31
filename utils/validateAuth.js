/*
This file contains a utility function to validate user input for authentication. 
The validateAuth function checks if the username and password meet certain criteria, 
such as being non-empty, having a maximum length for the username, and a minimum length for the password. 
It returns an error message if any validation fails, or null if the input is valid.
*/

export function validateAuth(username, password) {
    if (!username || !password) return 'Please enter all fields';
    if (username.length > 15) return 'Username must be less than 15 characters';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
}