

TODO:

Build remaining routes and tests (see routes list below)
Add CORS when connecting frontend
Move port to environment variable (PORT=3000 in .env)
Deploy backend to Railway, Render or Fly.io
Document all API endpoints



Routes to build:


Room routes (routes/rooms.js):
    POST /rooms — create a room
    GET /rooms — get all rooms the user is in
    POST /rooms/:roomId/join — join a room
    DELETE /rooms/:roomId — delete a room


User routes (routes/users.js):
    GET /users/:id — get a user's profile
    PUT /users/:id — update username or password
    DELETE /users/:id — delete account


Message routes (add to routes/messages.js):
    DELETE /messages/:messageId — delete a message


Tests to write (tests/):
    rooms.test.js — test all room routes
    users.test.js — test all user routes
    messages.tes