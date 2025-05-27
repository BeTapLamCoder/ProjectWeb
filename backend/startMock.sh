#!/bin/bash  
# Configuration  
CONTAINER_NAME="jeanshop_container"  
MIGRATIONS_DIR="src/database/migrations"

# Pull image  
docker compose up -d  

# Check if the image has been pulled successfully  
if [ $? -eq 0 ]; then  
  echo "Image pulled successfully!"  
else  
  echo "Failed to pull the image."  
  exit 1  
fi   

# Copy all SQL files from the migrations directory into the container  
echo "Copying SQL files from $MIGRATIONS_DIR to container $CONTAINER_NAME..."  
for SQL_FILE in "$MIGRATIONS_DIR"/*.sql; do  
  if [ -f "$SQL_FILE" ]; then  
    echo "Copying $SQL_FILE to container $CONTAINER_NAME..."  
    docker cp "$SQL_FILE" "$CONTAINER_NAME:/tmp/"  
    
    # Check if the file has been copied successfully  
    if [ $? -eq 0 ]; then  
      echo "$SQL_FILE copied successfully!"  

      # Wait for 0.5 seconds before executing the SQL script  
      sleep 0.5  
      
      # Execute the SQL script inside the container  
      SCRIPT_NAME=$(basename "$SQL_FILE")  # Get the base name of the file  
      echo "Executing $SCRIPT_NAME in container $CONTAINER_NAME..."  
      docker exec -it "$CONTAINER_NAME" psql -U jeanshopdev -d jeanshop -f "tmp/$SCRIPT_NAME"  
      
      # Check if the command succeeded  
      if [ $? -eq 0 ]; then  
          echo "SQL script $SCRIPT_NAME executed successfully."  
      else  
          echo "Failed to execute SQL script $SCRIPT_NAME."  
      fi      
    else  
      echo "Failed to copy $SQL_FILE."  
    fi  
  else  
    echo "No SQL files found in $MIGRATIONS_DIR."  
  fi  
done