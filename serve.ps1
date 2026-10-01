# Servidor local simples para ver o site (sem Node/Python).
# Uso:  powershell -ExecutionPolicy Bypass -File serve.ps1   →  http://localhost:8080
param([int]$Port = 8080)

$root = $PSScriptRoot
$types = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="text/javascript; charset=utf-8"
  ".json"="application/json"; ".svg"="image/svg+xml"; ".webp"="image/webp"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"
  ".png"="image/png"; ".ico"="image/x-icon"; ".webmanifest"="application/manifest+json"; ".txt"="text/plain; charset=utf-8"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "OTILC rodando em http://localhost:$Port/  (Ctrl+C para parar)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
      if ($path -eq "" -or $path.EndsWith("/")) { $path += "index.html" }
      $file = [IO.Path]::GetFullPath((Join-Path $root $path))
      if ($file.StartsWith($root) -and [IO.File]::Exists($file)) {
        $bytes = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file).ToLower()
        $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
      }
      Write-Host "$($res.StatusCode) /$path"
    } catch { $res.StatusCode = 500 } finally { $res.Close() }
  }
} finally { $listener.Stop() }
