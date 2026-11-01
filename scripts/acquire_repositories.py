#!/usr/bin/env python3
"""
SONORA Repository Acquisition and Inspection Tool
Clones mandated open-source repositories shallowly (--depth 1), extracts metadata,
detects licenses, commit hashes, branches, and generates repository-inventory records.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

TARGETS = [
    # A. Better Lyrics ecosystem
    {"id": "better-lyrics", "name": "Better Lyrics", "url": "https://github.com/better-lyrics/better-lyrics.git", "category": "Better Lyrics Ecosystem"},
    {"id": "braccato", "name": "Braccato", "url": "https://github.com/better-lyrics/braccato.git", "category": "Better Lyrics Ecosystem"},
    {"id": "composer", "name": "Composer", "url": "https://github.com/better-lyrics/composer.git", "category": "Better Lyrics Ecosystem"},
    {"id": "unison", "name": "Unison", "url": "https://github.com/better-lyrics/unison.git", "category": "Better Lyrics Ecosystem"},
    {"id": "better-lyrics-api", "name": "Better Lyrics API", "url": "https://github.com/better-lyrics/api.git", "category": "Better Lyrics Ecosystem"},
    {"id": "shaders", "name": "Better Lyrics Shaders", "url": "https://github.com/better-lyrics/shaders.git", "category": "Better Lyrics Ecosystem"},
    {"id": "kawarp", "name": "Kawarp", "url": "https://github.com/better-lyrics/kawarp.git", "category": "Better Lyrics Ecosystem"},
    {"id": "rics", "name": "RICS", "url": "https://github.com/better-lyrics/rics.git", "category": "Better Lyrics Ecosystem"},

    # B. YouTube Music applications
    {"id": "orchard-v4", "name": "Orchard v4", "url": "https://github.com/SFG5453/orchard-v4.git", "category": "YouTube Music Applications"},
    {"id": "riff", "name": "Riff", "url": "https://github.com/rootscripts/riff.git", "category": "YouTube Music Applications"},
    {"id": "zuno_music", "name": "Zuno", "url": "https://github.com/BitOpenCode/zuno_music.git", "category": "YouTube Music Applications"},
    {"id": "lyrenne", "name": "Lyrenne", "url": "https://github.com/Doctordefector/Lyrenne.git", "category": "YouTube Music Applications"},
    {"id": "opentune", "name": "OpenTune", "url": "https://github.com/harshitethic/OpenTune.git", "category": "YouTube Music Applications"},
    {"id": "nixiedesktop", "name": "Nixie Desktop", "url": "https://github.com/NixiePlayer/NixieDesktop.git", "category": "YouTube Music Applications"},
    {"id": "ytm-rs", "name": "ytm-rs", "url": "https://github.com/grapedjuice/ytm-rs.git", "category": "YouTube Music Applications"},
    {"id": "riff-muriel", "name": "Muriel", "url": "https://github.com/cloverscripts/riff-muriel.git", "category": "YouTube Music Applications"},
    {"id": "moosik", "name": "Moosik", "url": "https://github.com/AtotheY/moosik.git", "category": "YouTube Music Applications"},

    # C. YouTube Music integrations
    {"id": "ytmusicapi", "name": "ytmusicapi", "url": "https://github.com/sigma67/ytmusicapi.git", "category": "YouTube Music Integrations"},
    {"id": "youtube-js", "name": "YouTube.js", "url": "https://github.com/LuanRT/YouTube.js.git", "category": "YouTube Music Integrations"},
    {"id": "ytmdesktop2", "name": "YTMDesktop2", "url": "https://github.com/Venipa/ytmdesktop2.git", "category": "YouTube Music Integrations"},
    {"id": "ytmdesktop", "name": "YouTube Music Desktop App", "url": "https://github.com/ytmdesktop/ytmdesktop.git", "category": "YouTube Music Integrations"},
    {"id": "youlyplus", "name": "YouLyPlus", "url": "https://github.com/ibratabian17/YouLyPlus.git", "category": "YouTube Music Integrations"},

    # D. Lyrics and LRC infrastructure
    {"id": "lrclib", "name": "LRCLIB", "url": "https://github.com/tranxuanthang/lrclib.git", "category": "Lyrics Infrastructure"},
    {"id": "lrcget", "name": "LRCGet", "url": "https://github.com/tranxuanthang/lrcget.git", "category": "Lyrics Infrastructure"},

    # E. Design and music application references
    {"id": "spicetify-cli", "name": "Spicetify CLI", "url": "https://github.com/spicetify/cli.git", "category": "Design & App References"},
    {"id": "cider", "name": "Cider", "url": "https://github.com/ciderapp/Cider.git", "category": "Design & App References"},
    {"id": "feishin", "name": "Feishin", "url": "https://github.com/jeffvli/feishin.git", "category": "Design & App References"},
    {"id": "harmonoid", "name": "Harmonoid", "url": "https://github.com/harmonoid/harmonoid.git", "category": "Design & App References"},
    {"id": "spotx", "name": "SpotX", "url": "https://github.com/SpotX-Official/SpotX.git", "category": "Design & App References"},

    # F. Discovery targets
    {"id": "themesong", "name": "ThemeSong", "url": "https://github.com/vrie/themesong.git", "category": "Discovery Targets"},
    {"id": "newsync", "name": "NewSync", "url": "https://github.com/better-lyrics/newsync.git", "category": "Discovery Targets"},
    {"id": "lrc-studio", "name": "LRC Studio", "url": "https://github.com/fashni/lrc-studio.git", "category": "Discovery Targets"},
    {"id": "ytmdesktop-plus", "name": "YTMDesktop+", "url": "https://github.com/YTMDesktop/YTMDesktop-plus.git", "category": "Discovery Targets"},
    {"id": "pear-desktop", "name": "Pear Desktop", "url": "https://github.com/peardesktop/pear-desktop.git", "category": "Discovery Targets"}
]

REPO_DIR = Path("/Users/kaushik/Desktop/sonora/research/repositories")
RESULTS_FILE = Path("/Users/kaushik/Desktop/sonora/research/technical-audits/acquisition_results.json")

def run(cmd, cwd=None, timeout=60):
    try:
        res = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, timeout=timeout)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except subprocess.TimeoutExpired:
        return -1, "", "Command timed out"
    except Exception as e:
        return -1, "", str(e)

def inspect_repo(repo_path):
    # Detect default branch & commit sha
    rc, branch, _ = run("git rev-parse --abbrev-ref HEAD", cwd=repo_path)
    rc, commit_sha, _ = run("git rev-parse HEAD", cwd=repo_path)

    # Detect license file
    license_type = "Unknown"
    license_files = ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING", "LICENSE-MIT", "LICENSE-APACHE"]
    for lf in license_files:
        p = repo_path / lf
        if p.exists():
            content = p.read_text(errors="ignore")[:600]
            if "GNU GENERAL PUBLIC LICENSE" in content or "GPL" in content:
                if "Affero" in content or "AGPL" in content:
                    license_type = "AGPL-3.0"
                elif "Version 3" in content or "GPL-3" in content:
                    license_type = "GPL-3.0"
                elif "Version 2" in content or "GPL-2" in content:
                    license_type = "GPL-2.0"
                else:
                    license_type = "GPL"
            elif "MIT License" in content or "Permission is hereby granted, free of charge" in content:
                license_type = "MIT"
            elif "Apache License" in content and "Version 2.0" in content:
                license_type = "Apache-2.0"
            elif "PolyForm Shield" in content:
                license_type = "PolyForm Shield"
            elif "BSD" in content:
                license_type = "BSD"
            else:
                first_line = content.splitlines()[0] if content.splitlines() else "Unknown"
                license_type = f"Custom ({first_line[:30]})"
            break

    # Detect main languages / files
    pkg_json = repo_path / "package.json"
    cargo_toml = repo_path / "Cargo.toml"
    pyproject = repo_path / "pyproject.toml" or (repo_path / "setup.py")
    pubspec = repo_path / "pubspec.yaml"

    languages = []
    framework = "Custom"
    if pkg_json.exists():
        try:
            pkg_data = json.loads(pkg_json.read_text(errors="ignore"))
            deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
            if "react" in deps:
                framework = "React"
            elif "vue" in deps:
                framework = "Vue"
            elif "electron" in deps:
                framework = "Electron"
            elif "svelte" in deps:
                framework = "Svelte"
            languages.append("TypeScript/JavaScript")
        except:
            languages.append("JavaScript")
    if cargo_toml.exists():
        languages.append("Rust")
    if (repo_path / "pyproject.toml").exists() or (repo_path / "setup.py").exists():
        languages.append("Python")
    if pubspec.exists():
        languages.append("Dart/Flutter")
    if (repo_path / "go.mod").exists():
        languages.append("Go")
    if (repo_path / "CMakeLists.txt").exists():
        languages.append("C/C++")

    main_lang = "/".join(languages) if languages else "Various"

    return {
        "branch": branch if branch else "master",
        "commit": commit_sha if commit_sha else "unknown",
        "license": license_type,
        "language": main_lang,
        "framework": framework
    }

def main():
    REPO_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_FILE.parent.mkdir(parents=True, exist_ok=True)

    results = []
    print(f"Starting acquisition of {len(TARGETS)} repositories...")

    for target in TARGETS:
        tid = target["id"]
        tname = target["name"]
        turl = target["url"]
        dest = REPO_DIR / tid

        print(f"\nProcessing [{tname}] ({turl})...")
        if dest.exists() and (dest / ".git").exists():
            print(f"  Already exists at {dest}. Inspecting...")
            meta = inspect_repo(dest)
            results.append({
                **target,
                "status": "Acquired (Cached)",
                **meta
            })
            continue

        # Shallow clone
        cmd = f"git clone --depth 1 --single-branch {turl} {dest}"
        rc, out, err = run(cmd, timeout=90)
        if rc == 0 and dest.exists():
            meta = inspect_repo(dest)
            print(f"  Successfully cloned: {meta['branch']} @ {meta['commit'][:8]} | License: {meta['license']} | Lang: {meta['language']}")
            results.append({
                **target,
                "status": "Acquired",
                **meta
            })
        else:
            print(f"  Failed or unavailable: {err[:120]}")
            # Try without .git suffix or check if fallback exists
            results.append({
                **target,
                "status": f"Unavailable ({err.splitlines()[-1] if err else 'Clone failed'})",
                "branch": "N/A",
                "commit": "N/A",
                "license": "N/A",
                "language": "N/A",
                "framework": "N/A"
            })

    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nAcquisition pass complete. Recorded {len(results)} targets to {RESULTS_FILE}")

if __name__ == "__main__":
    main()
