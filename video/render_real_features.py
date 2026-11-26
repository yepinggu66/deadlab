import os
import sys
import subprocess
import shutil

video_dir = r'E:\Deep seek-002\逆天卦_2026-11-24\video'
project_dir = r'E:\Deep seek-002\逆天卦_2026-11-24'
ffmpeg = r'C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe'
ffprobe = r'C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffprobe.exe'
chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
if not os.path.exists(chrome):
    chrome = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

def capture_real_features():
    print("Capturing Real Feature Showcase 1080P Screenshots...")
    html_src = os.path.join(video_dir, "feature_showcase.html")
    with open(html_src, 'r', encoding='utf-8') as f:
        template = f.read()

    for i in range(1, 8):
        # 严格替换 active 属性
        content = template
        for j in range(1, 8):
            if j == i:
                content = content.replace(f'class="frame" id="f{j}"', f'class="frame active" id="f{j}"')
                content = content.replace(f'id="f{j}" class="frame"', f'id="f{j}" class="frame active"')
            else:
                content = content.replace(f'class="frame active" id="f{j}"', f'class="frame" id="f{j}"')
                content = content.replace(f'id="f{j}" class="frame active"', f'id="f{j}" class="frame"')

        tmp_html = os.path.join(video_dir, f"tmp_feature_f{i}.html")
        with open(tmp_html, 'w', encoding='utf-8') as f:
            f.write(content)

        png_path = os.path.join(video_dir, f"s{i}.png")
        cmd = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--window-size=1920,1080",
            f"--screenshot={png_path}",
            f"file:///{tmp_html.replace(os.sep, '/')}"
        ]
        subprocess.run(cmd, check=True)
        try:
            os.remove(tmp_html)
        except:
            pass
        size = os.path.getsize(png_path)
        print(f"  Frame {i} captured -> {png_path} ({size} bytes)")

def get_duration(file_path):
    cmd = [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file_path]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return float(res.stdout.strip())

def render_video():
    print("Rendering video segments with slow cinematic zoom & audio padding...")
    list_lines = []
    total_dur = 0.0

    for i in range(1, 8):
        png = os.path.join(video_dir, f"s{i}.png")
        wav = os.path.join(video_dir, f"s{i}.wav")
        seg = os.path.join(video_dir, f"seg{i}.mp4")
        dur = get_duration(wav)
        total_dur += dur + 0.45
        print(f"  Segment {i}: audio={dur:.2f}s, target={dur+0.45:.2f}s")

        cmd = [
            ffmpeg, "-y", "-loglevel", "error",
            "-loop", "1", "-i", png,
            "-i", wav,
            "-filter_complex",
            "[0:v]scale=1920:1080,zoompan=z='min(1+0.0004*on,1.04)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[v];[1:a]apad=pad_dur=0.45[a]",
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "160k",
            "-shortest", seg
        ]
        subprocess.run(cmd, check=True)
        list_lines.append(f"file 'seg{i}.mp4'")

    list_path = os.path.join(video_dir, "list_v2.txt")
    with open(list_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(list_lines) + '\n')

    out_mp4 = os.path.join(video_dir, "deadlab_promo_v2.mp4")
    concat_cmd = [
        ffmpeg, "-y", "-loglevel", "error",
        "-f", "concat", "-safe", "0",
        "-i", list_path,
        "-c", "copy",
        out_mp4
    ]
    subprocess.run(concat_cmd, check=True)
    
    # 拷贝一份到 assets 供网页端播放
    assets_mp4 = os.path.join(project_dir, "assets", "deadlab_promo_v2.mp4")
    shutil.copyfile(out_mp4, assets_mp4)
    print(f"Copied final promo video to: {assets_mp4}")

    final_dur = get_duration(out_mp4)
    file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024)
    print(f"\n🎉 REAL FEATURE PROMO GENERATED: {out_mp4}")
    print(f"Total Duration: {final_dur:.2f}s | Size: {file_size_mb:.2f} MB")

if __name__ == '__main__':
    capture_real_features()
    render_video()
