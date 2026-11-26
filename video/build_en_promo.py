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

# 7 段原生英文解说台词
SCRIPTS = {
    1: "Have you ever spent weeks building a side project, launched it with huge excitement, only to find zero paying customers after three months? That's called a Vanity Death. DEADLAB is an anti-delusion pre-mortem engine for developers. We turned the 3,000-year-old I Ching into a 6-dimensional risk matrix, running 5,000 Monte Carlo simulations to predict exactly how your project will die — before you write a single line of code.",
    2: "Distilled from post-mortems of over 500 failed indie products, DEADLAB evaluates six core pillars: Need, Capability, Economics, Distribution, Dependency, and Founder Stamina. Zero real demand? Zero distribution channels? Negative unit economics? The Three-Veto Guillotine strikes immediately — setting your survival rate to zero. No more 'build it and they will come' illusions.",
    3: "Once your parameters are set, the engine executes 5,000 Monte Carlo iterations in milliseconds, projecting your 24-month survival curve. It reveals your median month of death and the ranked autopsy report. Will you die from fake demand, API platform rug-pulls, or founder burnout? See your failure mode before it happens.",
    4: "Startups don't die in a vacuum. Inspired by the I Ching's moving lines, our dynamic state machine models causal chain reactions over 24 months. A viral distribution spike on a zero-margin product will crush your infrastructure and drain your runway — transmuting early triumph into catastrophic liquidation. Simulate the crisis before it becomes reality.",
    5: "No more self-deception with slider inputs. Paste your landing page URL or pitch doc into the Cold Inquisitor Room. An adversarial AI investor scrutinizes your claims: 'You have no pricing table or pre-orders — why do you claim validated demand?' Only verified evidence unlocks higher ratings, enforcing brutal honesty into your project.",
    6: "Most side projects don't die in a disaster — they freeze to death in silence. Connect your GitHub repository, and DEADLAB continuously tracks commit velocity and issue backlogs to calculate your Founder Hypothermia Index. If activity plummets for three consecutive weeks, an alert triggers before your project slips into abandonment.",
    7: "DEADLAB is now available as a CLI tool and an MCP server for AI coding agents. Run 'npx deadlab-check' in your terminal, or plug it into Cursor, Claude Code, and Windsurf. Before your AI agent generates a single line of code, DEADLAB intercepts the project, serving as the ultimate sanity check for independent builders worldwide."
}

def generate_english_audio():
    print("=== Step 1: Synthesizing English Neural Voice (en-US-ChristopherNeural) ===")
    for i in range(1, 8):
        mp3 = os.path.join(video_dir, f"en_s{i}.mp3")
        wav = os.path.join(video_dir, f"en_s{i}.wav")
        text = SCRIPTS[i]
        print(f"  Generating Scene {i}...")
        cmd = [
            "edge-tts",
            "--voice", "en-US-ChristopherNeural",
            "--text", text,
            "--write-media", mp3
        ]
        subprocess.run(cmd, check=True, shell=True)
        # Convert to WAV with ffmpeg for exact audio padding and zoompan alignment
        convert_cmd = [ffmpeg, "-y", "-loglevel", "error", "-i", mp3, wav]
        subprocess.run(convert_cmd, check=True)
        print(f"    -> {wav} created")

def create_english_html():
    print("=== Step 2: Creating English Feature Showcase HTML ===")
    html_en_path = os.path.join(video_dir, "feature_showcase_en.html")
    
    html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DEADLAB Real Feature Showcase (English)</title>
<link rel="stylesheet" href="../ui.css">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 1920px; height: 1080px; overflow: hidden;
  background-color: var(--bg);
  background-image: url("../assets/ink_bg.jpg");
  background-size: cover;
  background-position: center top;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #111216;
}
.frame {
  width: 1920px; height: 1080px; position: absolute; inset: 0;
  padding: 50px 90px; display: none; flex-direction: column; justify-content: space-between;
}
.frame.active { display: flex; }

.frame-top {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(16px);
  border: 1px solid rgba(26,28,33,0.14); border-radius: 16px;
  padding: 14px 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}
.brand { display: flex; align-items: center; gap: 12px; }
.seal-red {
  background: #C3272B; color: #FFF; font-size: 13px; font-weight: 800;
  padding: 4px 12px; border-radius: 4px; letter-spacing: 1px;
}
.brand-title { font-size: 20px; font-weight: 800; color: #111216; letter-spacing: -0.3px; }
.frame-step { font-family: var(--mono); font-size: 14px; color: #A67C2E; font-weight: 800; letter-spacing: 0.5px; }

.frame-body {
  flex: 1; margin: 24px 0; display: flex; gap: 32px; align-items: stretch;
}

.frame-bottom {
  background: rgba(18, 19, 22, 0.94); backdrop-filter: blur(16px);
  color: #FFF; border-radius: 16px; padding: 18px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.subtitle-text { font-size: 20px; font-weight: 600; color: #FFF; line-height: 1.4; max-width: 1400px; }
.tag-pill { background: #A67C2E; color: #FFF; padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: 800; white-space: nowrap; }

.card-content {
  background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(20px);
  border: 1px solid rgba(26, 28, 33, 0.16); border-radius: 20px;
  padding: 34px 40px; box-shadow: 0 16px 48px rgba(26, 28, 33, 0.08);
  flex: 1; display: flex; flex-direction: column; justify-content: center;
}
</style>
</head>
<body>

<!-- Frame 1: 3D Dynamic I Ching Compass -->
<div class="frame active" id="f1">
  <div class="frame-top">
    <div class="brand">
      <span class="seal-red">PRE-MORTEM</span>
      <span class="brand-title">DEADLAB · Monte Carlo Simulation for Builders</span>
    </div>
    <div class="frame-step">FEATURE 01 / 3D DYNAMIC I CHING COMPASS</div>
  </div>
  <div class="frame-body">
    <div class="card-content" style="flex: 0 0 540px; text-align: center;">
      <div style="width: 300px; height: 300px; margin: 0 auto 16px; border-radius: 50%; border: 3px solid rgba(166,124,46,0.5); display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #FAF8F3 40%, rgba(166,124,46,0.12) 70%, transparent 100%); box-shadow: 0 0 50px rgba(166,124,46,0.25);">
        <div style="font-size: 110px; color: #111216; text-shadow: 0 4px 20px rgba(0,0,0,0.15)">☯</div>
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #111216; margin-bottom: 6px">3,000-Year I Ching × 3D Monte Carlo</div>
      <div style="font-size: 15px; color: #4B5060">Interactive 3D rotation, dynamic zooming & real-time state mutation</div>
    </div>
    <div class="card-content">
      <div style="display: flex; gap: 10px; margin-bottom: 16px">
        <span class="seal-red">PRE-MORTEM AUTOPSY</span>
        <span style="font-size: 18px; color: #A67C2E; font-weight: 700">Hit the Brakes Before Writing Code</span>
      </div>
      <h1 style="font-size: 46px; font-weight: 900; color: #111216; line-height: 1.25; margin-bottom: 20px; letter-spacing: -0.5px">
        Predict how it dies,<br>before deciding to build.
      </h1>
      <p style="font-size: 20px; color: #2D303A; line-height: 1.7">
        Every AI coding assistant is rushing to inflate your build enthusiasm.<br>
        Only pre-mortem simulation provides the sober reality check you need to kill flawed ideas before wasting 6 months.
      </p>
    </div>
  </div>
  <div class="frame-bottom">
    <span class="subtitle-text">Predict how it dies, before deciding to build. The most scientific divination is pre-mortem mortality simulation.</span>
    <span class="tag-pill">3D I Ching Compass</span>
  </div>
</div>

<!-- Frame 2: 6-Yao Discrete Control Panel -->
<div class="frame" id="f2">
  <div class="frame-top">
    <div class="brand">
      <span class="seal-red">CONTROL PANEL</span>
      <span class="brand-title">6-Yao Discrete Commercial Risk Matrix</span>
    </div>
    <div class="frame-step">FEATURE 02 / 6-DIMENSIONAL QUANTITATIVE MATRIX</div>
  </div>
  <div class="frame-body">
    <div class="card-content">
      <div style="font-size: 22px; font-weight: 800; margin-bottom: 20px; color: #111216">
        Six Core Commercial Variables (Levels 0 ~ 3)
      </div>
      <div style="display: flex; flex-direction: column; gap: 14px">
        <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF8F3; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(26,28,33,0.12)">
          <span style="font-weight: 800; font-size: 17px; width: 180px">1st Yao · Need</span>
          <span style="color: #4B5060; font-size: 15px; flex: 1">Does anyone really feel the pain?</span>
          <span style="background: #2A7553; color: #FFF; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700">lv=2 Validated demand (Paid)</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF8F3; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(26,28,33,0.12)">
          <span style="font-weight: 800; font-size: 17px; width: 180px">2nd Yao · Capability</span>
          <span style="color: #4B5060; font-size: 15px; flex: 1">Can you reliably close the delivery loop?</span>
          <span style="background: #2A7553; color: #FFF; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700">lv=2 High confidence</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF8F3; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(195,39,43,0.3)">
          <span style="font-weight: 800; font-size: 17px; width: 180px; color: #C3272B">3rd Yao · Economics</span>
          <span style="color: #4B5060; font-size: 15px; flex: 1">Profitable margin or bleeding compute cash?</span>
          <span style="background: #C3272B; color: #FFF; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700">lv=0 Bleeding cash (Fatal)</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF8F3; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(26,28,33,0.12)">
          <span style="font-weight: 800; font-size: 17px; width: 180px">4th Yao · Distribution</span>
          <span style="color: #4B5060; font-size: 15px; flex: 1">Where do your recurring users come from?</span>
          <span style="background: #2A7553; color: #FFF; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700">lv=3 Viral flywheel</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF8F3; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(26,28,33,0.12)">
          <span style="font-weight: 800; font-size: 17px; width: 180px">5th Yao · Dependency</span>
          <span style="color: #4B5060; font-size: 15px; flex: 1">Will upstream platforms kill your API?</span>
          <span style="background: #A67C2E; color: #FFF; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700">lv=1 Single point of failure</span>
        </div>
      </div>
    </div>
    <div class="card-content" style="flex: 0 0 520px">
      <div style="font-size: 20px; color: #C3272B; font-weight: 800; margin-bottom: 12px">Three-Veto Guillotine</div>
      <p style="font-size: 16px; color: #4B5060; line-height: 1.8; margin-bottom: 24px">
        Copyright limits, licensing laws, and platform TOS policies.<br>
        Legal and economic boundaries are not fuzzy probabilities — any single red line drops your survival rate to absolute zero.
      </p>
      <div style="background: #111216; color: #FFF; border-radius: 14px; padding: 24px">
        <div style="font-size: 14px; color: #A67C2E; font-weight: 700; margin-bottom: 6px">MONTE CARLO SIMULATION</div>
        <div style="font-size: 24px; font-weight: 800">5,000 Iterations of Hazard Rates</div>
      </div>
    </div>
  </div>
  <div class="frame-bottom">
    <span class="subtitle-text">Generation is cheap inflation; killing bad ideas is scarce sanity. Remove founder bias with discrete constraints.</span>
    <span class="tag-pill">6-Yao Risk Matrix</span>
  </div>
</div>

<!-- Frame 3: 24-Month Survival Probability Curve -->
<div class="frame" id="f3">
  <div class="frame-top">
    <div class="brand">
      <span class="seal-red">QUANTITATIVE DATA</span>
      <span class="brand-title">24-Month Survival Probability & Autopsy</span>
    </div>
    <div class="frame-step">FEATURE 03 / MONTE CARLO SURVIVAL CURVE</div>
  </div>
  <div class="frame-body">
    <div class="card-content" style="flex: 0 0 440px; text-align: center">
      <div style="font-size: 14px; color: #666; font-family: var(--mono); margin-bottom: 4px">24 MONTHS SURVIVAL</div>
      <div style="font-family: var(--mono); font-size: 78px; font-weight: 800; color: #C3272B; line-height: 1; margin-bottom: 14px">11.5%</div>
      <div style="font-size: 18px; font-weight: 700; color: #111216; margin-bottom: 20px">Median Month of Death: Month 7</div>
      <div style="background: rgba(195,39,43,0.08); border: 1px solid rgba(195,39,43,0.25); border-radius: 12px; padding: 14px 18px">
        <div style="font-size: 13px; color: #C3272B; font-weight: 700; margin-bottom: 4px">#1 Cause of Death (64.8% Share)</div>
        <div style="font-size: 16px; font-weight: 700; color: #111216">Negative Margins · Unit Cost Exceeds Price</div>
      </div>
    </div>
    <div class="card-content">
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px; color: #111216">
        24-Month Non-Linear Survival Decay Curve (Monte Carlo Hazard Integration)
      </div>
      <svg viewBox="0 0 660 220" style="width: 100%; height: 260px; background: #FAF8F3; border-radius: 14px; border: 1px solid rgba(26,28,33,0.1)">
        <path d="M 40,30 L 620,30 M 40,80 L 620,80 M 40,130 L 620,130 M 40,180 L 620,180" stroke="rgba(26,28,33,0.06)" stroke-width="1"/>
        <path d="M 40,40 Q 180,50 240,110 T 420,170 T 620,195 L 620,200 L 40,200 Z" fill="rgba(195,39,43,0.12)"/>
        <path d="M 40,40 Q 180,50 240,110 T 420,170 T 620,195" fill="none" stroke="#C3272B" stroke-width="4"/>
        <circle cx="240" cy="110" r="6" fill="#C3272B"/>
        <text x="250" y="105" font-size="14" fill="#C3272B" font-weight="bold">Month 4: Moving Line Cliff</text>
      </svg>
    </div>
  </div>
  <div class="frame-bottom">
    <span class="subtitle-text">Running 5,000 Monte Carlo simulations to deliver three brutal truths: How it dies, when it dies, and the fatal flaw.</span>
    <span class="tag-pill">Survival Curve Report</span>
  </div>
</div>

<!-- Frame 4: Moving Lines & Transmutation Engine -->
<div class="frame" id="f4">
  <div class="frame-top">
    <div class="brand">
      <span class="seal-red">CORE ALGORITHM</span>
      <span class="brand-title">Moving Lines & Transmutation State Machine</span>
    </div>
    <div class="frame-step">FEATURE 04 / CROSS-DIMENSIONAL CAUSAL CHAIN</div>
  </div>
  <div class="frame-body">
    <div class="card-content">
      <div style="background: #FAF8F3; border: 1px solid rgba(166,124,46,0.3); border-radius: 18px; padding: 28px 36px; margin-bottom: 24px">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px">
          <span style="font-size: 22px; font-weight: 800; color: #111216">
            Primary [Di Ze Lin] (User Influx) ──( Mutation )──> Transmuted [Ze Shui Kun] (Runway Depleted)
          </span>
          <span class="seal-red">3rd Yao Mutation</span>
        </div>
        <p style="font-size: 18px; color: #2D303A; line-height: 1.8">
          <strong>Dynamic Temporal Autopsy:</strong><br>
          Month 4: The 3rd Yao (Economics) mutates. The viral traffic spike (Dist=3) overwhelms thin margins (Econ=0), tearing the cash runway apart. Founder stamina drops to critical, entering vegetative survival state.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px">
        <div style="background: #FFF; border: 1px solid rgba(26,28,33,0.12); border-radius: 14px; padding: 20px">
          <div style="font-weight: 800; color: #C3272B; font-size: 16px; margin-bottom: 6px">⚠️ Fatal Flag Warning</div>
          <div style="font-size: 14px; color: #555">Negative Margins + Viral Traffic: Amplifying user volume on negative unit margins accelerates insolvency.</div>
        </div>
        <div style="background: #FFF; border: 1px solid rgba(26,28,33,0.12); border-radius: 14px; padding: 20px">
          <div style="font-weight: 800; color: #2A7553; font-size: 16px; margin-bottom: 6px">🛡️ Actionable Mitigation Plan</div>
          <div style="font-size: 14px; color: #555">Freeze feature work for 2 weeks. Calculate compute token limits and break-even subscription prices.</div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-bottom">
    <span class="subtitle-text">Moving lines link cause and effect. Projecting the 24-month autopsy script to spot the first crack before it widens.</span>
    <span class="tag-pill">Transmutation Engine</span>
  </div>
</div>

<!-- Frame 5: Cold Inquisitor Pitch Room -->
<div class="frame" id="f5">
  <div class="frame-top">
    <div class="brand">
      <span class="seal-red">INPUT REVOLUTION</span>
      <span class="brand-title">Cold Investor Inquisition Room</span>
    </div>
    <div class="frame-step">FEATURE 05 / ADVERSARIAL DUE DILIGENCE</div>
  </div>
  <div class="frame-body">
    <div class="card-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <div style="font-size: 22px; font-weight: 800; color: #111216">
          ⚖️ Refuse Fake Data Delusions · Paste Landing Page for Adversarial Due Diligence
        </div>
        <div style="color: #C3272B; font-weight: 800; font-size: 16px">Initial Confidence Discount: 75%</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px">
        <div style="background: #FAF8F3; border-left: 4px solid #C3272B; border-radius: 10px; padding: 18px 22px">
          <div style="font-weight: 800; font-size: 17px; color: #111216; margin-bottom: 4px">
            [Questionable Demand] Waitlist detected, but has any stranger actually paid a deposit in the last 30 days?
          </div>
          <div style="font-size: 14px; color: #555">In business, "applause" does not equal "payment". Without verified revenue, Need is locked at lv=0.</div>
        </div>
        <div style="background: #FAF8F3; border-left: 4px solid #C3272B; border-radius: 10px; padding: 18px 22px">
          <div style="font-weight: 800; font-size: 17px; color: #111216; margin-bottom: 4px">
            [Margin Trap] If each user consumes $15/mo in compute while price is $19 with 30% CAC, where is your profit?
          </div>
          <div style="font-size: 14px; color: #555">Without break-even proof, Economics is locked at lv=0 (bleeding cash).</div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-bottom">
    <span class="subtitle-text">Adversarial proof inquisition. Unsubstantiated claims are discounted and locked, forcing builders to face brutal facts.</span>
    <span class="tag-pill">Inquisitor Room</span>
  </div>
</div>

<!-- Frame 6: GitHub Vital Pulse Telemetry -->
<div class="frame" id="f6">
  <div class="frame-top">
    <div class="brand">
      <span class="seal-red">CONTINUOUS TELEMETRY</span>
      <span class="brand-title">GitHub Live Pulse & Founder Hypothermia Index</span>
    </div>
    <div class="frame-step">FEATURE 06 / CODE HYPOTHERMIA WARNING</div>
  </div>
  <div class="frame-body">
    <div class="card-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
        <div>
          <div style="font-size: 22px; font-weight: 800; color: #111216">github.com/owner/repo</div>
          <div style="font-size: 15px; color: #2A7553; font-weight: 700">Strong Vital Pulse · Active Releases</div>
        </div>
        <div style="text-align: right">
          <div style="font-size: 13px; color: #777">HYPOTHERMIA INDEX:</div>
          <div style="font-family: var(--mono); font-size: 32px; font-weight: 800; color: #2A7553">14%</div>
        </div>
      </div>

      <div style="width: 100%; height: 120px; background: #111216; border-radius: 14px; position: relative; overflow: hidden; margin-bottom: 20px">
        <svg viewBox="0 0 600 90" style="width: 100%; height: 100%" preserveAspectRatio="none">
          <path d="M 0,45 L 80,45 L 90,38 L 100,45 L 110,55 L 120,10 L 130,75 L 145,45 L 170,30 L 190,45 L 280,45 L 290,38 L 300,45 L 310,55 L 320,10 L 330,75 L 345,45 L 370,30 L 390,45 L 480,45 L 490,38 L 500,45 L 510,55 L 520,10 L 530,75 L 545,45 L 570,30 L 600,45" fill="none" stroke="#2A7553" stroke-width="3"/>
        </svg>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 16px; color: #555">
        <span>Latest Commit: <b>2 days ago</b></span>
        <span>Stars: <b>1,420</b></span>
        <span>Open Issues: <b>12</b></span>
        <span>Stamina Yao: <b style="color:#2A7553">lv=3 Abundant</b></span>
      </div>
    </div>
  </div>
  <div class="frame-bottom">
    <span class="subtitle-text">Connect your GitHub repo for real-time code hypothermia tracking. Sounding the alarm before founder burnout silently kills the project.</span>
    <span class="tag-pill">Vital Pulse ECG</span>
  </div>
</div>

<!-- Frame 7: AI Coding Circuit Breaker -->
<div class="frame" id="f7">
  <div class="frame-top">
    <div class="brand">
      <span class="seal-red">DISTRIBUTION CHANNEL</span>
      <span class="brand-title">AI Coding Circuit Breaker (CLI & MCP Server)</span>
    </div>
    <div class="frame-step">FEATURE 07 / TERMINAL & IDE CIRCUIT BREAKER</div>
  </div>
  <div class="frame-body">
    <div class="card-content" style="flex: 0 0 780px; background: #131418; color: #FFF; border: 1px solid rgba(255,255,255,0.15)">
      <div style="font-family: var(--mono); font-size: 14px; color: #A67C2E; margin-bottom: 10px">TERMINAL RUNTIME · npx deadlab-check</div>
      <div style="font-family: var(--mono); font-size: 13.5px; line-height: 1.7; color: #E6E9F0">
        <span style="color: #4EBA87">┌────────────────────────────────────────────────────────┐</span><br>
        <span style="color: #4EBA87">│   ☯  DEADLAB · AI Coding Pre-Mortem Circuit Breaker    │</span><br>
        <span style="color: #4EBA87">└────────────────────────────────────────────────────────┘</span><br>
        [Hexagram Simulation]: Primary [Di Ze Lin] ──(3rd Yao Moves)──> Transmuted [Ze Shui Kun]<br>
        6th Yao [Stamina]:      ━━━━━ ━━━━━ Yin  (Runway: ~6 months)<br>
        3rd Yao [Economics]:    ━━━━━ ⭕ ━━━━ <span style="background:#C3272B;color:#FFF;padding:1px 6px">Moving Line · Traffic Overwhelms Margins</span><br>
        12-Month Survival: <span style="color:#FF5A5F;font-weight:bold">34.2%</span>  |  24-Month Survival: <span style="color:#FF5A5F;font-weight:bold">11.5%</span><br>
        <span style="background:#C3272B;color:#FFF;padding:2px 8px;font-weight:bold">⚠️ [CIRCUIT BREAKER TRIGGERED: High Commercial Risk]</span>
      </div>
    </div>
    <div class="card-content" style="display: flex; flex-direction: column; justify-content: center">
      <div style="display: flex; gap: 10px; margin-bottom: 12px">
        <span class="seal-red">KNOW WHEN TO STOP</span>
        <span style="font-size: 18px; color: #A67C2E; font-weight: 700">Build What Lasts</span>
      </div>
      <div style="font-size: 32px; font-weight: 900; color: #111216; line-height: 1.3; margin-bottom: 14px">
        The Essential Sanity Check for Indie Builders Worldwide.
      </div>
      <div style="font-size: 16px; color: #4B5060; line-height: 1.7">
        Invoked by Cursor and Claude Code before writing code.<br>
        If fatal flaws are detected, generation is intercepted immediately.
      </div>
    </div>
  </div>
  <div class="frame-bottom">
    <span class="subtitle-text">Know when to stop to build what lasts. Before writing your next line of code, let DEADLAB predict where it will break first.</span>
    <span class="tag-pill">AI Coding Circuit Breaker</span>
  </div>
</div>

</body>
</html>
"""
    with open(html_en_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  -> Created {html_en_path}")

def capture_english_screenshots():
    print("=== Step 3: Capturing 1080P English Screenshots ===")
    html_src = os.path.join(video_dir, "feature_showcase_en.html")
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

        tmp_html = os.path.join(video_dir, f"tmp_feature_en_f{i}.html")
        with open(tmp_html, 'w', encoding='utf-8') as f:
            f.write(content)

        png_path = os.path.join(video_dir, f"en_s{i}.png")
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

def render_english_video():
    print("=== Step 4: Rendering English Video Segments ===")
    list_lines = []
    total_dur = 0.0

    for i in range(1, 8):
        png = os.path.join(video_dir, f"en_s{i}.png")
        wav = os.path.join(video_dir, f"en_s{i}.wav")
        seg = os.path.join(video_dir, f"en_seg{i}.mp4")
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
        list_lines.append(f"file 'en_seg{i}.mp4'")

    list_path = os.path.join(video_dir, "list_en.txt")
    with open(list_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(list_lines) + '\n')

    out_mp4 = os.path.join(video_dir, "deadlab_promo_en.mp4")
    concat_cmd = [
        ffmpeg, "-y", "-loglevel", "error",
        "-f", "concat", "-safe", "0",
        "-i", list_path,
        "-c", "copy",
        out_mp4
    ]
    subprocess.run(concat_cmd, check=True)

    assets_mp4 = os.path.join(project_dir, "assets", "deadlab_promo_en.mp4")
    shutil.copyfile(out_mp4, assets_mp4)
    print(f"Copied final English promo to: {assets_mp4}")

    final_dur = get_duration(out_mp4)
    file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024)
    print(f"\n🎉 ENGLISH REAL FEATURE PROMO GENERATED: {out_mp4}")
    print(f"Total Duration: {final_dur:.2f}s | Size: {file_size_mb:.2f} MB")

if __name__ == '__main__':
    generate_english_audio()
    create_english_html()
    capture_english_screenshots()
    render_english_video()
