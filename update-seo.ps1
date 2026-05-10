$files = @(
  'detail-pelatihan-digital.html',
  'detail-forum-literasi.html',
  'detail-content-creator.html',
  'detail-fashion-batik.html',
  'detail-school-contest.html',
  'detail-freefire-battle.html',
  'detail-mobile-legends.html',
  'detail-fun-walk-nganjuk.html',
  'detail-lomba-poster.html',
  'detail-sekolah-inflasi.html',
  'detail-school-contest-2024.html',
  'program-scholarship-camp-global-english.html',
  'program-holiday-global-english.html'
)

$baseDir = "c:\event\kedirievent"

foreach ($file in $files) {
    # Check if the file exists
    $filePath = Join-Path -Path $baseDir -ChildPath $file
    if (-Not (Test-Path -Path $filePath)) {
        Write-Output "Skipping $file, not found."
        continue
    }

    $c = Get-Content -Path $filePath -Raw -Encoding UTF8

    # Extract H1 Title
    $title = "Detail Event"
    if ($c -match '(?i)<h1[^>]*>([\s\S]*?)</h1>') {
        $title = $matches[1] -replace '<[^>]+>', ''
        $title = $title -replace '\s+', ' '
        $title = $title.Trim()
    }

    # Extract First paragraph in content-body
    $description = "Informasi detail event terlengkap di Kediri Event."
    if ($c -match '(?i)<div class="content-body[^>]*>\s*<p>([\s\S]*?)</p>') {
        $description = $matches[1] -replace '<[^>]+>', ''
        $description = $description -replace '\s+', ' '
        $description = $description.Trim()
        if ($description.Length -gt 160) {
            $description = $description.Substring(0, 157) + "..."
        }
    }

    # Extract Image
    $imageSrc = "https://kedirievent.com/assets/img/kediri-event-cover.jpg"
    if ($c -match '(?i)<img[^>]*src="(assets/img/[^"]+)"') {
        $imageSrc = "https://kedirievent.com/" + $matches[1]
    }

    $canonicalUrl = "https://kedirievent.com/$file"

    # Replace Title
    $c = $c -replace '(?i)<title>[\s\S]*?</title>', "<title>$title - Kediri Event</title>"
    
    # Replace Meta Description
    $c = $c -replace '(?i)<meta name="description" content="[^"]*">', "<meta name=`"description`" content=`"$description`">"
    
    # Replace Canonical URL
    $c = $c -replace '(?i)<link rel="canonical" href="[^"]*">', "<link rel=`"canonical`" href=`"$canonicalUrl`">"

    # Insert AEO and GEO meta tags just before </head> if they don't exist
    if ($c -notmatch '(?i)<meta name="geo.region"') {
        $geoTags = "  <meta name=`"geo.region`" content=`"ID-JI`">`r`n  <meta name=`"geo.placename`" content=`"Kediri`">`r`n  <meta name=`"geo.position`" content=`"-7.8166;112.0166`">`r`n  <meta name=`"ICBM`" content=`"-7.8166, 112.0166`">`r`n"
        $c = $c -replace '(?i)(</head>)', "$geoTags`$1"
    }

    # OpenGraph tags
    $c = $c -replace '(?i)<meta property="og:url" content="[^"]*">', "<meta property=`"og:url`" content=`"$canonicalUrl`">"
    $c = $c -replace '(?i)<meta property="og:title" content="[^"]*">', "<meta property=`"og:title`" content=`"$title - Kediri Event`">"
    $c = $c -replace '(?i)<meta property="og:description" content="[^"]*">', "<meta property=`"og:description`" content=`"$description`">"
    $c = $c -replace '(?i)<meta property="og:image" content="[^"]*">', "<meta property=`"og:image`" content=`"$imageSrc`">"

    # Twitter tags
    $c = $c -replace '(?i)<meta name="twitter:url" content="[^"]*">', "<meta name=`"twitter:url`" content=`"$canonicalUrl`">"
    $c = $c -replace '(?i)<meta name="twitter:title" content="[^"]*">', "<meta name=`"twitter:title`" content=`"$title - Kediri Event`">"
    $c = $c -replace '(?i)<meta name="twitter:description" content="[^"]*">', "<meta name=`"twitter:description`" content=`"$description`">"
    $c = $c -replace '(?i)<meta name="twitter:image" content="[^"]*">', "<meta name=`"twitter:image`" content=`"$imageSrc`">"

    # Fix JSON-LD Schema
    $c = $c -replace '(?i)"name":\s*"Template.*?Kediri Event"', "`"name`": `"$title - Kediri Event`""
    $c = $c -replace '(?i)"description":\s*"Template.*?Kediri Event\."', "`"description`": `"$description`""
    $c = $c -replace '(?i)"url":\s*"https://kedirievent\.com/mentahan\.html"', "`"url`": `"$canonicalUrl`""
    $c = $c -replace '(?i)"url":\s*"https://kedirievent\.com/assets/img/kediri-event-cover\.jpg"', "`"url`": `"$imageSrc`""

    # Robots meta fix
    $c = $c -replace '(?i)<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="index, follow">'
    $c = $c -replace '(?i)<meta name="googlebot" content="noindex, nofollow[^"]*">', '<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">'

    # WA Number replace (footer / text)
    $c = $c -replace '(?i)<strong>WhatsApp:</strong>\s*<span>.*?</span>', '<strong>WhatsApp:</strong> <span>+62 895-6390-68080</span>'
    
    # WA link replace
    $c = $c -replace '(?i)https://wa.me/[0-9]+\?', 'https://wa.me/62895639068080?'

    # Favicon deduplication
    $faviconDedupe = '<link rel="icon" type="image/png" sizes="32x32" href="assets/img/logo2 square.png">`r`n  <link rel="icon" type="image/png" sizes="16x16" href="assets/img/logo2 square.png">'
    $c = $c -replace '(?i)<link rel="icon" type="image/png" sizes="32x32" href="assets/img/logo2 square\.png">\s*<link rel="icon" type="image/png" sizes="32x32" href="assets/img/logo2 square\.png">', $faviconDedupe

    # Save file
    [IO.File]::WriteAllText($filePath, $c, [System.Text.Encoding]::UTF8)

    Write-Output "Updated $file"
}

Write-Output "Done script."
