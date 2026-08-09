# =====================================================================
# Google Cloud Run PowerShell Deployment Script for QLex Backend
# =====================================================================

$ErrorActionPreference = "Stop"

$ProjectId = (gcloud config get-value project 2>$null)
if (-not $ProjectId) {
    Write-Host "Error: GCP Project ID not set. Run 'gcloud config set project YOUR_PROJECT_ID' first." -ForegroundColor Red
    exit 1
}

$Region = "asia-south1"
$ServiceName = "qlex-backend"
$ImageName = "gcr.io/${ProjectId}/${ServiceName}:latest"

Write-Host "Building and submitting container image to GCP Cloud Build..." -ForegroundColor Cyan
gcloud builds submit --tag $ImageName .

Write-Host "Deploying container to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $ServiceName `
    --image $ImageName `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10 `
    --set-env-vars "APP_NAME=QLex API,APP_VERSION=1.0.0,DEBUG=False,ACCESS_TOKEN_EXPIRE_MINUTES=525600,DATABASE_URL=postgresql+psycopg2://postgres:DivaThiru1012@db.fdkkjqvmdnfmqvmsexar.supabase.co:5432/postgres,SECRET_KEY=qlex_super_secret_key_change_this_before_production_2026,ALLOWED_ORIGINS=https://qlexmindtech.vercel.app,RAZORPAY_KEY_ID=rzp_test_TC5tGEdBuuCBLm,RAZORPAY_KEY_SECRET=ppBTFvxKCcCOiHYfrH2yJu9e,RAZORPAY_WEBHOOK_SECRET=DivaThiru@0810"

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Service URL:" -ForegroundColor Yellow
gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'
