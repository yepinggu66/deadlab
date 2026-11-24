$ErrorActionPreference = "Stop"
$d = "E:\Deep seek-002\逆天卦_2026-11-24\video"
$ff = "C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe"
$fp = "C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffprobe.exe"

$lines = @(
  "先算它怎么死，再决定要不要做。",
  "现在写方案是白菜价。所有人工智能都在帮你生成，没有人帮你提前杀死它。",
  "六爻，六个变量。再加三票否决：版权、牌照、平台。任意一票红，存活率直接归零；全绿才推演五千次，给你三样东西：死法、死期、命门。",
  "把中文歌做成英文版，模型说存活率百分之三十六。但法务只看一眼：没有词曲授权，这叫衍生作品，归零。换成接 B 端客户，他们自带版权，回到百分之五十二。",
  "我们也把自己算了一遍：百分之六十七，最可能死于被复刻。补上校准数据和品牌之后，下一个死因立刻变成——没人真的需要。",
  "已经做好的项目不用手填。粘一个 GitHub 地址，读说明文档、文件树和依赖，三十秒推出六爻，每一条都给你证据。",
  "先算它怎么死，再决定要不要做。"
)

Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice("Microsoft Huihui Desktop")
$s.Rate = 0
$s.Volume = 100
for ($i = 0; $i -lt $lines.Count; $i++) {
  $p = Join-Path $d ("s" + ($i + 1) + ".wav")
  if (-not (Test-Path $p) -or (Get-Item $p).Length -lt 10000) {
    $s.SetOutputToWaveFile($p)
    $s.Speak($lines[$i])
  }
}
$s.Dispose()
Write-Host "TTS done"
$ErrorActionPreference = "Continue"

$total = 0
$list = @()
for ($i = 1; $i -le 7; $i++) {
  $wav = Join-Path $d "s$i.wav"
  $dur = [double](& $fp -v error -show_entries format=duration -of default=nw=1:nk=1 $wav)
  $total += $dur + 0.45
  Write-Host ("scene {0}: {1:N2}s" -f $i, $dur)
  $png = Join-Path $d "s$i.png"
  $seg = Join-Path $d "seg$i.mp4"
  $fargs = @(
    "-y","-loglevel","error","-loop","1","-i",$png,"-i",$wav,
    "-filter_complex","[0:v]scale=1920:1080,zoompan=z='min(1+0.0006*on,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[v];[1:a]apad=pad_dur=0.45[a]",
    "-map","[v]","-map","[a]","-c:v","libx264","-preset","veryfast","-crf","21","-pix_fmt","yuv420p",
    "-c:a","aac","-ar","44100","-ac","2","-b:a","160k","-shortest",$seg
  )
  & $ff @fargs 2>&1 | Select-Object -Last 1
  $list += "file 'seg$i.mp4'"
}
Write-Host ("estimated total: {0:N1}s" -f $total)

$listPath = Join-Path $d "list.txt"
[System.IO.File]::WriteAllLines($listPath, $list, (New-Object System.Text.UTF8Encoding($false)))
& $ff -y -loglevel error -f concat -safe 0 -i $listPath -c copy (Join-Path $d "promo.mp4") 2>&1 | Select-Object -Last 1

$out = Join-Path $d "promo.mp4"
$final = & $fp -v error -show_entries format=duration -of default=nw=1:nk=1 $out
Write-Host ("FINAL: " + $out + "  " + [math]::Round([double]$final,2) + "s  " + [math]::Round((Get-Item $out).Length/1MB,2) + " MB")
