#!/bin/bash  

# Configuration  
CONTAINER_NAME="jeanshop_container"  
SQL_FILE="src/database/migrations/create_tables.sql"  

#Stop the running container
docker-compose stop

# Check if the container has been stopped successfully
if [ $? -eq 0 ]; then
  echo "The container stopped successfully!"
else
  echo "Failed to stop the container."
  exit 1
fi 