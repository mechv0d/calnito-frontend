$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env.local")) {
  Write-Host "No .env.local found. Creating from .env.example..."
  Copy-Item ".env.example" ".env.local"
  Write-Host "Edit .env.local with your Firebase config before real login."
}

npm install
npm run dev
