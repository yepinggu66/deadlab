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

# 7 段与实机画面 1:1 绝对对齐的深度解说词 (无任何私有项目，对齐 7 大功能区)
SCRIPTS = {
    1: "先算它怎么死，再决定要不要做。在狂热的 AI 浪潮里，大模型写代码越来越快，但没有一个 AI 会残忍地告诉你：你的项目是不是从第一天起就注定夭折。几千年来人类都在问卦占卜吉凶，但在现代商业与独立开发中，最科学的占卜，其实叫事前验尸推演。DEADLAB，就是给程序员的立项防沉迷系统。",
    2: "我们从五百个死掉的真实项目中，将商业逻辑抽象为六爻量化约束：初爻需求、二爻交付、三爻经济、四爻分发、五爻依赖与上爻续航。只要你在【需求真实度】、【分发渠道】或【单位经济】拉到零，三票否决断头台立即触发——存活率瞬间归零，立项斩立决。拒绝任何“我先做出来再说”的自嗨幻觉。",
    3: "设定参数后，引擎在毫秒内并发五千次蒙特卡洛危险率推演，生成长达二十四个月的非线性生存概率曲线。它不仅给出基线存活率，更精准指出中位死亡时间与死因排名。是死于伪需求、算力成本压垮、还是被上游接口扼杀？在悲剧发生前，把底牌全部掀开。",
    4: "商业从来不是静态的。《易经》推演的灵魂在于“动爻”与“变卦”。在 DEADLAB 中，变量随时间剧烈连锁：早期爆款带来的流量激增，会瞬间反噬微薄毛利，导致资金流断裂。从【地泽临】演化为【泽水困】，清晰呈现时序因果链条，在沙盘中提前预演致命危机。",
    5: "拒绝拍脑袋填假数据。进入“冷酷投资人审讯室”，贴入你的产品落地页链接或方案简述。AI 尽调算法将像冷面投资人一样步步反问：“没有定价凭什么说有人买？” 未见真实预售或付费凭证，初始置信度直接打折锁定。把自嗨过滤器做进产品交互内核。",
    6: "很多项目不是死于灾难，而是死于创始人精力的缓慢失温。绑定 GitHub 仓库，系统实时遥测 Commit 活跃度、Issue 积压速度与代码迭代频率。算法实时计算“创始人失温指数”：若提交连续数周骤降，续航爻自动衰减并触发月度脉搏预警，防止项目死于悄无声息的弃坑。",
    7: "现在，DEADLAB 已经封装为命令行与 AI 编程助手 MCP 工具。在终端运行 npx deadlab --install，或一键接入 Cursor、Claude Code 与 Windsurf。在你敲下下一行代码前，沙盘推演自动介入，为全球独立开发者筑起最后一道理智防线。知止不殆，方能逆天。"
}

def generate_chinese_audio():
    print("=== Step 1: Synthesizing Chinese Neural Voice (zh-CN-YunjianNeural) ===")
    for i in range(1, 8):
        mp3 = os.path.join(video_dir, f"s{i}.mp3")
        wav = os.path.join(video_dir, f"s{i}.wav")
        text = SCRIPTS[i]
        print(f"  Generating Scene {i}...")
        cmd = [
            "edge-tts",
            "--voice", "zh-CN-YunjianNeural",
            "--text", text,
            "--write-media", mp3
        ]
        subprocess.run(cmd, check=True, shell=True)
        convert_cmd = [ffmpeg, "-y", "-loglevel", "error", "-i", mp3, wav]
        subprocess.run(convert_cmd, check=True)
        print(f"    -> {wav} created")

def capture_chinese_screenshots():
    print("=== Step 2: Capturing 1080P Chinese Screenshots ===")
    html_src = os.path.join(video_dir, "feature_showcase.html")
    with open(html_src, 'r', encoding='utf-8') as f:
        template = f.read()

    for i in range(1, 8):
        content = template
        for j in range(1, 8):
            if j == i:
                content = content.replace(f'class="frame" id="f{j}"', f'class="frame active" id="f{j}"')
                content = content.replace(f'id="f{j}" class="frame"', f'id="f{j}" class="frame active"')
            else:
                content = content.replace(f'class="frame active" id="f{j}"', f'class="frame" id="f{j}"')
                content = content.replace(f'id="f{j}" class="frame active"', f'id="f{j}" class="frame"')

        tmp_html = os.path.join(video_dir, f"tmp_feature_zh_f{i}.html")
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

def render_chinese_video():
    print("=== Step 3: Rendering Chinese Video Segments ===")
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

    assets_mp4 = os.path.join(project_dir, "assets", "deadlab_promo_v2.mp4")
    shutil.copyfile(out_mp4, assets_mp4)
    print(f"Copied final Chinese promo to: {assets_mp4}")

    final_dur = get_duration(out_mp4)
    file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024)
    print(f"\n🎉 CHINESE REAL FEATURE PROMO GENERATED: {out_mp4}")
    print(f"Total Duration: {final_dur:.2f}s | Size: {file_size_mb:.2f} MB")

if __name__ == '__main__':
    generate_chinese_audio()
    capture_chinese_screenshots()
    render_chinese_video()
