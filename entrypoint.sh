#!/bin/sh
# entrypoint.sh

# Wait for the database to become available
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  # Wait for 5 seconds before trying again
  sleep 5
done

# Run database migrations
npm run migrate

# Start the application
exec "$@"