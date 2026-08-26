# =====================================================================
# Google Cloud Run PowerShell Deployment Script for QLex Backend
# =====================================================================

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot


if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    $GCloudBin = "C:\Users\ediva\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"
    if (Test-Path $GCloudBin) {
        $env:PATH = "$GCloudBin;$env:PATH"
    }
}

gcloud config set project qlex-production
$ProjectId = "qlex-production"

$Region = "asia-south1"
$ServiceName = "qlex-backend"
$Tag = Get-Date -Format "yyyyMMddHHmmss"
$ImageName = "gcr.io/${ProjectId}/${ServiceName}:${Tag}"

Write-Host "Building and submitting fresh container image ($Tag) to GCP Cloud Build..." -ForegroundColor Cyan
gcloud builds submit --tag $ImageName .

Write-Host "Deploying container to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $ServiceName `
    --image $ImageName `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 2Gi `
    --cpu 1 `
    --min-instances 1 `
    --max-instances 1 `
    --no-cpu-throttling `
    --set-env-vars "APP_NAME=QLex API,APP_VERSION=1.0.0,DEBUG=False,ACCESS_TOKEN_EXPIRE_MINUTES=525600,DATABASE_URL=postgresql+psycopg2://postgres.fdkkjqvmdnfmqvmsexar:DivaThiru1012@aws-0-ap-south-1.pooler.supabase.com:5432/postgres,SECRET_KEY=qlex_super_secret_key_change_this_before_production_2026,ALLOWED_ORIGINS=*,RAZORPAY_KEY_ID=rzp_test_TC5tGEdBuuCBLm,RAZORPAY_KEY_SECRET=ppBTFvxKCcCOiHYfrH2yJu9e,RAZORPAY_WEBHOOK_SECRET=DivaThiru@0810,WHATSAPP_BOT_URL=http://127.0.0.1:5001,BACKEND_URL=https://qlex-backend-ybnb435gbq-el.a.run.app,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=divagar.240075@aids.ritchennai.edu.in,SMTP_PASSWORD=eprzscarycrjwnda,EMAILS_FROM_EMAIL=divagar.240075@aids.ritchennai.edu.in,EMAILS_FROM_NAME=QLex_Printing_Portal,SMTP_TLS=True"

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Service URL:" -ForegroundColor Yellow
gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'
