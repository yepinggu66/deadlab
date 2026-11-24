import os
import sys
import asyncio
import subprocess
import edge_tts

video_dir = r'E:\Deep seek-002\逆天卦_2026-11-24\video'
ffmpeg = r'C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe'
ffprobe = r'C:\Users\pingguye\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffprobe.exe'

# 7段具有深度、哲学批判与严谨数学/商业逻辑的拟人化解说词
scripts = [
    # 01
    "先算它怎么死，再决定要不要做。在狂热的技术浪潮里，最清醒的智慧往往不是加速，而是刹车。几千年来人类都在问卦占卜吉凶，但在软件工程里，最科学的占卜，其实叫事前验尸分析。",
    # 02
    "在今天，生成代码已经变成了白菜价。所有大模型都在狂热地帮你写架构、堆功能、制造立项的幻觉。但没有任何一个人工智能会残忍地告诉你：这个项目从第一天起，结构上就注定活不过半年。生成是廉价的膨胀，杀死才是稀缺的清醒。",
    # 03
    "这就是逆天卦沙盘的内核：把易经六爻，重构为需求、能力、经济、分发、依赖与续航六个维度的离散状态约束。外加三票否决机制：版权、牌照、平台规则。现实的法务与合规红线不是渐进概率，而是一票否决的断头台。任一票红，存活率瞬间归零。唯有全绿，系统才会启动五千次蒙特卡洛危险率推演，剥离盲目乐观，交出三张底牌：死法、死期、与命门。",
    # 04
    "看一个真实的盲区：把中文流行歌用 AI 转成英文版，算法模拟给出百分之三十六的存活率。但只要法务推门进来扫一眼：没有词曲原作者授权，这叫非法衍生作品。存活率瞬间从三十六坠跌至零。许多独立开发者耗费数月打磨产品，最后却死于一条不可逆的底层法则。",
    # 05
    "面对这套推演，我们也毫不留情地把自己算了一遍。九项功能做完，沙盘显示百分之六十七的存活率，最大死因是占比百分之三十四的被大厂复刻。当我们补齐校准账本和品牌护城河后，存活率提到了百分之七十三，但系统的危险天平立刻倾斜，下一个首要死因，变成了冷酷的没人真正需要。商业世界的真相正是如此：你解决了一个死法，新的死法立刻接踵而至。",
    # 06
    "你甚至无需主观臆测参数。只需给出一个 GitHub 仓库地址，沙盘在三十秒内逆向解析你的代码库、依赖树与提交历史。它将静态代码还原为动态的因果六爻，并且对每一项判断给出确凿的代码证据。凡是置信度存疑的节点，留给开发者亲自审视。",
    # 07
    "推演的目的，从不是断定命运，而是在系统崩塌之前，看清那道最先裂开的缝隙。卦象不渡虚妄的发财梦，它只渡不想猝死的人。在你满怀热血敲下下一行代码之前，先算它怎么死，再决定要不要做。"
]

VOICE = "zh-CN-YunjianNeural"

async def generate_audio():
    print("Generating Neural TTS Audio...")
    for i, text in enumerate(scripts):
        wav_path = os.path.join(video_dir, f"s{i+1}.wav")
        communicate = edge_tts.Communicate(text, VOICE, rate="-3%")
        await communicate.save(wav_path)
        print(f"  Scene {i+1} audio generated: {wav_path}")

def get_duration(file_path):
    cmd = [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file_path]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return float(res.stdout.strip())

def render_segments():
    print("Rendering video segments with slow zoom & audio padding...")
    list_lines = []
    total_dur = 0.0

    for i in range(1, 8):
        png = os.path.join(video_dir, f"s{i}.png")
        wav = os.path.join(video_dir, f"s{i}.wav")
        seg = os.path.join(video_dir, f"seg{i}.mp4")
        dur = get_duration(wav)
        total_dur += dur + 0.5
        print(f"  Rendering Segment {i} (duration: {dur:.2f}s)...")

        # ffmpeg zoompan and apad filter
        fargs = [
            ffmpeg, "-y", "-loglevel", "error",
            "-loop", "1", "-i", png,
            "-i", wav,
            "-filter_complex",
            "[0:v]scale=1920:1080,zoompan=z='min(1+0.0005*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[v];[1:a]apad=pad_dur=0.5[a]",
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "192k",
            "-shortest", seg
        ]
        subprocess.run(fargs, check=True)
        list_lines.append(f"file 'seg{i}.mp4'")

    list_path = os.path.join(video_dir, "list.txt")
    with open(list_path, "w", encoding="utf-8") as f:
        f.write("\n".join(list_lines) + "\n")

    out_mp4 = os.path.join(video_dir, "promo.mp4")
    concat_args = [
        ffmpeg, "-y", "-loglevel", "error",
        "-f", "concat", "-safe", "0",
        "-i", list_path,
        "-c", "copy",
        out_mp4
    ]
    subprocess.run(concat_args, check=True)
    final_dur = get_duration(out_mp4)
    file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024)
    print(f"\nSUCCESS: Generated {out_mp4}")
    print(f"Total Duration: {final_dur:.2f} seconds ({final_dur/60:.1f} mins)")
    print(f"File Size: {file_size_mb:.2f} MB")

async def main():
    await generate_audio()
    render_segments()

if __name__ == "__main__":
    asyncio.run(main())
