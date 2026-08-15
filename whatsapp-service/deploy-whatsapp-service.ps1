# =====================================================================
# Google Cloud Run PowerShell Deployment Script for WhatsApp Microservice
# =====================================================================

$ErrorActionPreference = "Stop"

$ProjectId = (gcloud config get-value project 2>$null)
if (-not $ProjectId) {
    Write-Host "Error: GCP Project ID not set. Run 'gcloud config set project YOUR_PROJECT_ID' first." -ForegroundColor Red
    exit 1
}

$Region = "asia-south1"
$ServiceName = "qlex-whatsapp-service"
$ImageName = "gcr.io/${ProjectId}/${ServiceName}:latest"

Write-Host "Building and submitting container image for WhatsApp Service..." -ForegroundColor Cyan
gcloud builds submit --tag $ImageName .

Write-Host "Deploying WhatsApp Microservice container to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $ServiceName `
    --image $ImageName `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 2Gi `
    --cpu 1 `
    --no-cpu-throttling `
    --min-instances 1 `
    --max-instances 2

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Service URL:" -ForegroundColor Yellow
gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'
