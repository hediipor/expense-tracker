# Simple HTTP Server for Expense Tracker PWA
$port = 5500
$root = "$PSScriptRoot"

# Create Listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")

# FORCE ANONYMOUS AUTHENTICATION
$listener.AuthenticationSchemes = [System.Net.AuthenticationSchemes]::Anonymous

try {
    $listener.Start()
}
catch {
    Write-Host "Error starting server: $_"
    Write-Host "Try running as Administrator or check if port $port is free."
    pause
    exit
}

Write-Host "Starting Expense Tracker Server..."
Write-Host "----------------------------------"
Write-Host "Local Access: http://localhost:$port"

# Get Local IP Address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Wireless*" }).IPAddress | Select-Object -First 1

if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.InterfaceAlias -notlike "*vEthernet*" -and $_.InterfaceAlias -notlike "*VMware*" -and $_.InterfaceAlias -notlike "*VirtualBox*" }).IPAddress | Select-Object -First 1
}

Write-Host "iPhone Access: http://$($ip):$port"
Write-Host "----------------------------------"
Write-Host "Press Ctrl+C to stop."

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = "$root$($request.Url.LocalPath)"
    
    # Default to index.html
    if ($path -match "/$") { $path = "$path`index.html" }
    
    # Security: Prevent directory traversal
    if ($path -notlike "$root*") {
        $response.StatusCode = 403
        $response.Close()
        continue
    }

    if (Test-Path $path) {
        $content = [System.IO.File]::ReadAllBytes($path)
        $extension = [System.IO.Path]::GetExtension($path)
        
        switch ($extension) {
            ".html" { $response.ContentType = "text/html" }
            ".css" { $response.ContentType = "text/css" }
            ".js" { $response.ContentType = "application/javascript" }
            ".json" { $response.ContentType = "application/json" }
            ".png" { $response.ContentType = "image/png" }
            ".svg" { $response.ContentType = "image/svg+xml" }
        }
        
        # Add CORS headers just in case
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    }
    else {
        $response.StatusCode = 404
    }
    
    $response.Close()
}
