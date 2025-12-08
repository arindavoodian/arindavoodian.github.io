#!/usr/bin/env python3
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTOS_DIR = ROOT / "photos"
OUTPUT = ROOT / "gallery.json"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def auto_title_from_filename(filename: str) -> str:
    name = os.path.splitext(filename)[0]
    name = name.replace("-", " ").replace("_", " ")
    name = " ".join(name.split())
    return name.title()

def build_gallery():
    gallery = {"categories": {}}

    if not PHOTOS_DIR.exists():
        print(f"Photos directory does not exist: {PHOTOS_DIR}")
        return gallery

    for category_dir in sorted(PHOTOS_DIR.iterdir()):
        if not category_dir.is_dir():
            continue

        category_name = category_dir.name
        items = []

        for file in sorted(category_dir.iterdir()):
            if file.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue

            rel_path = file.relative_to(ROOT).as_posix()
            items.append({
                "src": rel_path,
                "title": auto_title_from_filename(file.name),
                "description": ""
            })

        if items:
            gallery["categories"][category_name] = items

    return gallery

def main():
    gallery = build_gallery()
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(gallery, f, indent=2)
    print(f"Wrote {OUTPUT} with {sum(len(v) for v in gallery['categories'].values())} photos.")

if __name__ == "__main__":
    main()
