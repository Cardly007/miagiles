#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Sync Prisma database
npx prisma db push

# Start the application
exec npm start
