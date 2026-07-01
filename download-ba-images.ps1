$base = "https://img1.wsimg.com/isteam/ip/862a3bda-8a05-4fde-81d5-67cd96e1fa49"
$suffix = "/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:1400,cg:true"
$outDir = "C:\Users\14074\bath-professional\images"

$pairs = @(
    @{ before = "before-1.jpg"; after = "after-1.jpg"; src = "image000001(40)(1).jpg"; srcAfter = "image000001(41)(1).jpg" },
    @{ before = "before-2.jpg"; after = "after-2.jpg"; src = "image000000(82)(1).jpg"; srcAfter = "image000000(85)(1).jpg" },
    @{ before = "before-3.jpg"; after = "after-3.jpg"; src = "Resized_20231031_101938.jpeg"; srcAfter = "Resized_20231031_140601.jpeg" },
    @{ before = "before-4.jpg"; after = "after-4.jpg"; src = "image000000(119)(2).jpg"; srcAfter = "image000000(120)(2).jpg" },
    @{ before = "before-5.jpg"; after = "after-5.jpg"; src = "countertop.jpeg"; srcAfter = "countertopreglazing.jpg" },
    @{ before = "before-6.jpg"; after = "after-6.jpg"; src = "Resized_image000005(1).jpeg"; srcAfter = "image000002(22).jpg" }
)

$gallery = @(
    @{ file = "gallery-1.jpg"; src = "image000001(41)(1).jpg"; cat = "tubs" },
    @{ file = "gallery-2.jpg"; src = "image000000(85)(1).jpg"; cat = "showers" },
    @{ file = "gallery-3.jpg"; src = "Resized_20231031_140601.jpeg"; cat = "full" },
    @{ file = "gallery-4.jpg"; src = "countertopreglazing.jpg"; cat = "kitchens" },
    @{ file = "gallery-5.jpg"; src = "717545339(2).jpg"; cat = "tubs" },
    @{ file = "gallery-6.jpg"; src = "Resized_20231005_163916.jpeg"; cat = "showers" },
    @{ file = "gallery-7.jpg"; src = "image000000(141).jpg"; cat = "full" },
    @{ file = "gallery-8.jpg"; src = "Resized_image000000(146).jpeg"; cat = "kitchens" },
    @{ file = "gallery-9.jpg"; src = "IMG_6230(2).jpg"; cat = "tubs" },
    @{ file = "gallery-10.jpg"; src = "Resized_123_1(292).jpeg"; cat = "showers" },
    @{ file = "gallery-11.jpg"; src = "image000001(52)(2).jpg"; cat = "full" },
    @{ file = "gallery-12.jpg"; src = "123_1(298).jpeg"; cat = "tubs" }
)

function Download-Img($src, $dest) {
    $encoded = [uri]::EscapeDataString($src).Replace('%2F','/').Replace('%28','(').Replace('%29',')')
    # Build URL manually for wsimg paths with parens
    $url = "$base/$src$suffix"
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        $size = (Get-Item $dest).Length
        Write-Host "OK $dest ($size bytes)"
        return $true
    } catch {
        Write-Host "FAIL $dest - $_"
        return $false
    }
}

foreach ($p in $pairs) {
    Download-Img $p.src (Join-Path $outDir $p.before)
    Download-Img $p.srcAfter (Join-Path $outDir $p.after)
}

foreach ($g in $gallery) {
    Download-Img $g.src (Join-Path $outDir $g.file)
}

Write-Host "Done!"