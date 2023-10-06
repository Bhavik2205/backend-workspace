#!/bin/bash

az acr login --name workspaceapp

docker login workspaceapp.azurecr.io

echo "Building Docker images"
docker build --platform linux/amd64 -t workspaceapp:latest .

echo "Tagging docker image"
docker tag workspaceapp:latest workspaceapp.azurecr.io/workspaceapp:latest

echo "Uploading image"
docker push workspaceapp.azurecr.io/workspaceapp:latest