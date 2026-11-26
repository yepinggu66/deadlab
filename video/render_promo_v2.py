import os
import sys
import time
import asyncio
import subprocess
import edge_tts

video_dir = r'E:\Deep seek-002\逆天卦_2026-11-24\video'
project_dir = r'E:\Deep seek-002\逆天卦_2026-11-24'
ffmpeg = r'C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe'
ffprobe = r'C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffprobe.exe'
chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
if not os.path.exists(chrome):
    chrome = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

# 7 段深度商业解说词 (无任何个人私有项目，聚焦 Quibi、动爻变卦、审讯室、活体脉搏与 AI 编程熔断)
scripts = [
    # 01
    "先算它怎么死，再决定要不要做。在狂热的 AI 浪潮里，最清醒的智慧不是狂热加速，而是主动刹车。几千年来人类都在问卦占卜吉凶，但在现代商业与软件工程里，最科学的占卜，其实叫事前验尸推演。",
    # 02
    "今天，生成代码已经变成了白菜价。所有大模型都在狂热地帮你写架构、堆功能、制造立项的自嗨幻觉。但没有一个 AI 会残忍地告诉你：这个项目从第一天起，结构上就注定活不过半年。生成是廉价的膨胀，杀死才是稀缺的清醒。",
    # 03
    "这就是逆天卦沙盘的内核：将易经六爻，重构为需求、能力、经济、分发、依赖与续航六个维度的量化约束。外加版权、牌照、平台规则三票否决断头台。系统启动五千次蒙特卡洛危险率推演，剥离盲目乐观，交出三张底牌：死法、死期、与命门。",
    # 04
    "看硅谷真实的公开败局：投资 17.5 亿美元的短视频平台 Quibi，团队全是大佬，但由于第一爻需求真实度为零，上线仅半年猝死。负毛利狂热烧钱的 Fast，每赚一美元补贴十六美元，死于第三爻经济崩溃。在真实商业世界里，致命短板往往在立项第一天就已注定。",
    # 05
    "它不止是静态计算，更是动态演化。初爻需求、二爻能力、三爻经济、四爻分发、五爻依赖、上爻续航。流量暴增如何反噬微薄毛利？技术债务如何拖垮团队精力？动爻连锁，本卦转变卦，提前为你推演 24 个月的死因剧本。",
    # 06
    "拒绝自嗨。冷酷投资人审讯室对你的落地页展开反向取证质询；绑定 GitHub 仓库，实时测算代码失温指数与生命心电图。更被封装为全球首个 AI 编程立项熔断器，在写下第一行代码前替你排雷拦截。",
    # 07
    "推演的目的，不是断定命运，而是在系统崩塌前，看清最先裂开的缝隙。知止不殆，方能逆天。在写下一行代码前，先来逆天卦，算算它最先死在哪。"
]

VOICE = "zh-CN-YunjianNeural"

def generate_screenshots():
    print("Generating 1080P Screenshots using Headless Browser...")
    slides_html_path = os.path.join(video_dir, "slides_ink.html")
    
    # 为每个场景生成单页 HTML 临时文件以确保百分之百精确截图
    with open(slides_html_path, 'r', encoding='utf-8') as f:
        full_html = f.read()

    for i in range(1, 8):
        png_path = os.path.join(video_dir, f"s{i}.png")
        # 将第 i 场景设置为 on，其余为 none
        mod_html = full_html
        for j in range(1, 8):
            if j == i:
                mod_html = mod_html.replace(f'id="s{j}" class="scene"', f'id="s{j}" class="scene on"')
                mod_html = mod_html.replace(f'class="scene on" id="s{j}"', f'class="scene on" id="s{j}"')
            else:
                mod_html = mod_html.replace(f'id="s{j}" class="scene on"', f'id="s{j}" class="scene"')
                mod_html = mod_html.replace(f'class="scene on" id="s{j}"', f'class="scene" id="s{j}"')
        
        tmp_html_path = os.path.join(video_dir, f"tmp_s{i}.html")
        with open(tmp_html_path, 'w', encoding='utf-8') as f:
            f.write(mod_html)

        cmd = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--window-size=1920,1080",
            f"--screenshot={png_path}",
            f"file:///{tmp_html_path.replace(os.sep, '/')}"
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            os.remove(tmp_html_path)
        except:
            pass
        print(f"  Captured Scene {i} -> {png_path} ({os.path.getsize(png_path)} bytes)")

async def generate_audio():
    print("Generating Neural TTS Audio via edge_tts...")
    for i, text in enumerate(scripts):
        wav_path = os.path.join(video_dir, f"s{i+1}.wav")
        communicate = edge_tts.Communicate(text, VOICE, rate="-2%")
        await communicate.save(wav_path)
        print(f"  Scene {i+1} audio generated: {wav_path} ({os.path.getsize(wav_path)} bytes)")

def get_duration(file_path):
    cmd = [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file_path]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return float(res.stdout.strip())

def render_segments():
    print("Rendering video segments with slow cinematic zoom & audio padding...")
    list_lines = []
    total_dur = 0.0

    for i in range(1, 8):
        png = os.path.join(video_dir, f"s{i}.png")
        wav = os.path.join(video_dir, f"s{i}.wav")
        seg = os.path.join(video_dir, f"seg{i}.mp4")
        dur = get_duration(wav)
        total_dur += dur + 0.45
        print(f"  Rendering Segment {i}: audio={dur:.2f}s, target={dur+0.45:.2f}s")

        cmd = [
            ffmpeg, "-y", "-loglevel", "error",
            "-loop", "1", "-i", png,
            "-i", wav,
            "-filter_complex",
            "[0:v]scale=1920:1080,zoompan=z='min(1+0.0005*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[v];[1:a]apad=pad_dur=0.45[a]",
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
    
    # 拷贝一份到 assets 供网页端直接播放
    assets_mp4 = os.path.join(project_dir, "assets", "deadlab_promo_v2.mp4")
    try:
        import shutil
        shutil.copyfile(out_mp4, assets_mp4)
        print(f"Copied promo video to assets: {assets_mp4}")
    except Exception as e:
        print("Copy to assets failed:", e)

    final_dur = get_duration(out_mp4)
    file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024)
    print(f"\n🎉 ALL DONE! Generated: {out_mp4}")
    print(f"Total Duration: {final_dur:.2f}s | Size: {file_size_mb:.2f} MB")

async def main():
    generate_screenshots()
    await generate_audio()
    render_segments()

if __name__ == '__main__':
    asyncio.run(main())
