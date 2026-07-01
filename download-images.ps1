$images = @{
    "hero-poster.jpg" = "https://images.unsplash.com/photo-1600566753190-17f0baa0a6a3?w=1920&q=80"
    "before-1.jpg" = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80"
    "after-1.jpg" = "https://images.unsplash.com/photo-1600566753190-17f0baa0a6a3?w=1200&q=80"
    "before-2.jpg" = "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80"
    "after-2.jpg" = "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80"
    "before-3.jpg" = "https://images.unsplash.com/photo-1564540586988-78a839274d6f?w=1200&q=80"
    "after-3.jpg" = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80"
    "before-4.jpg" = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80"
    "after-4.jpg" = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
    "before-5.jpg" = "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80"
    "after-5.jpg" = "https://images.unsplash.com/photo-1616137467421-6a6a05b1e5e8?w=1200&q=80"
    "before-6.jpg" = "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80"
    "after-6.jpg" = "https://images.unsplash.com/photo-1631889993959-f3bbed18339b?w=1200&q=80"
    "gallery-kitchen-before.jpg" = "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80"
    "gallery-kitchen-after.jpg" = "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&q=80"
    "gallery-kitchen2-before.jpg" = "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1200&q=80"
    "gallery-kitchen2-after.jpg" = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
    "testimonial-1.jpg" = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
    "testimonial-2.jpg" = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    "testimonial-3.jpg" = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"
    "testimonial-4.jpg" = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
    "testimonial-5.jpg" = "https://images.unsplash.com/photo-1519085360753-bc4e2a0a379a?w=400&q=80"
}

$outDir = Join-Path $PSScriptRoot "images"
foreach ($entry in $images.GetEnumerator()) {
    $outPath = Join-Path $outDir $entry.Key
    Write-Host "Downloading $($entry.Key)..."
    try {
        Invoke-WebRequest -Uri $entry.Value -OutFile $outPath -UseBasicParsing
    } catch {
        Write-Host "Failed: $($entry.Key) - $_"
    }
}
Write-Host "Done!"