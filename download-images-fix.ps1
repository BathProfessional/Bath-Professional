$fixes = @{
    "hero-poster.jpg" = "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&q=80"
    "before-3.jpg" = "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80"
    "after-1.jpg" = "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80"
    "after-5.jpg" = "https://images.unsplash.com/photo-1616137467421-6a6a05b1e5e8?w=1200&q=80&auto=format"
    "after-6.jpg" = "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80"
    "testimonial-5.jpg" = "https://images.unsplash.com/photo-1522521119408-4c4b0b0b0b0b?w=400&q=80"
}

# Fallback testimonial-5
$fixes["testimonial-5.jpg"] = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80"

$outDir = "C:\Users\14074\bath-professional\images"
foreach ($entry in $fixes.GetEnumerator()) {
    $outPath = Join-Path $outDir $entry.Key
    Write-Host "Fixing $($entry.Key)..."
    try {
        Invoke-WebRequest -Uri $entry.Value -OutFile $outPath -UseBasicParsing
        Write-Host "  OK ($((Get-Item $outPath).Length) bytes)"
    } catch {
        Write-Host "  Failed: $_"
    }
}