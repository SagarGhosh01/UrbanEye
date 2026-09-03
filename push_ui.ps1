# UrbanEye Branch Push Script
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " Pushing UrbanEye Platform to GitHub Branch 'ui'" -ForegroundColor Yellow
Write-Host " Target: https://github.com/SagarGhosh01/UrbanEye" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan

# Ensure remote URL is set correctly
git remote set-url origin https://github.com/SagarGhosh01/UrbanEye.git

# Create/Switch to 'ui' branch
git checkout -b ui 2>$null
git checkout ui

# Stage all files
git add .

# Commit changes
git commit -m "feat: complete 19-module UI architecture & Vite fixes"

# Push to origin ui
git push -u origin ui

Write-Host "`nSuccessfully pushed to branch 'ui'!" -ForegroundColor Green
Write-Host "View remote branch: https://github.com/SagarGhosh01/UrbanEye/tree/ui" -ForegroundColor Cyan
