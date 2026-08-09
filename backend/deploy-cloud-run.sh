#!/bin/bash
# =====================================================================
# Google Cloud Run Deployment Script for QLex Backend
# =====================================================================
# Requirements:
# - Google Cloud SDK (gcloud CLI) installed and logged in (`gcloud auth login`)
# - GCP Project ID configured (`gcloud config set project YOUR_PROJECT_ID`)
# =====================================================================

set -e

# Configuration (update as needed)
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION="us-central1"
SERVICE_NAME="qlex-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: GCP Project ID not set. Run 'gcloud config set project YOUR_PROJECT_ID' first."
  exit 1
fi

echo "🚀 Building and pushing container image to Google Container Registry..."
gcloud builds submit --tag "$IMAGE_NAME" .

echo "☁️ Deploying to Google Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "APP_NAME=QLex API,APP_VERSION=1.0.0,DEBUG=False"

echo "✅ Deployment completed successfully!"
echo "🔗 Service URL:"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)'
