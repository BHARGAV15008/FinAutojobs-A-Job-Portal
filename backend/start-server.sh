#!/usr/bin/env bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the server with the system Node.js
exec /usr/bin/node server.js
