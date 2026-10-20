# DreamX project page

Live site: https://kchyun.github.io/DreamX/

Static site, no build step. Open `index.html` locally or serve it with GitHub Pages.

```
project_page/
├── index.html              # page content (teaser, method and policy figures are inline SVG)
├── .nojekyll               # tells GitHub Pages to serve files as-is
└── static/
    ├── css/style.css       # styles + figure animations
    ├── js/main.js          # video sync/lazy-load, data lists (examples, datasets, masks)
    ├── images/teaser/      # stills used in the teaser figure
    ├── posters/            # first-frame thumbnails for every video
    └── videos/
        ├── any2any/        # <id>_source.mp4 / <id>_target.mp4
        ├── hr_benchmark/   # <task>_human / _adaworld / _videoworld2 / _ours .mp4
        ├── action_transfer/# <id>_human.mp4 / <id>_robot.mp4
        ├── datasets/       # <dataset>/<clip>.mp4 — two sample clips per dataset
        ├── teaser/         # teaser.mp4 (overview video) + optional teaser-figure clips
        └── attention/      # ← attention-map videos (see below)
```

## Auto-upgrading media slots
Every placeholder and every photo in the teaser figure points at an expected file.
Drop an mp4 with that exact name in place and the page switches from the still or placeholder to the video. You don't need to edit any HTML.

| Where on the page | Expected file(s) |
|---|---|
| Teaser – input thumbnails | `static/videos/teaser/human_{1,2,3}.mp4`, `robot_{1,2,3}.mp4` |
| Teaser – universal across embodiments | `static/videos/teaser/universal_human.mp4`, `universal_robot.mp4` |
| Teaser – policy scene | `static/videos/teaser/policy_sim.mp4` |
| Attention maps | `static/videos/attention/human.mp4`, `robot.mp4` (input and overlay side by side, 2:1) |

## Dataset sample clips
Each dataset card plays its clips one after another. The clip list and captions live in `DATASETS` in `static/js/main.js`.
To swap a clip, drop the mp4 into `static/videos/datasets/<dataset>/`, add a poster at `static/posters/ds_<clip>.jpg`, and update that list.

## Interim videos
The any-to-any and HumanAndRobot clips are cropped out of the concatenated supplementary videos, with the burned-in label strip removed.
To use clean originals, overwrite the files with the same names. The HumanAndRobot generated outputs still carry a "GENERATED" mark from the source videos.

## Other TODOs
Search `index.html` for `TODO` to find the paper/code links and the BibTeX venue.

## Deploy (GitHub Pages)
This folder is the root of https://github.com/kchyun/DreamX.
1. Push to `main`.
2. In the repo, go to Settings → Pages → Build and deployment → Source: *Deploy from a branch*, then pick `main` and `/ (root)`.
3. The site goes live at https://kchyun.github.io/DreamX/ (the path is case-sensitive) a minute or two after each push.

All asset paths are relative, so the site works under the `/DreamX/` sub-path and when opened locally.
Keep the paper PDF and the PPTX sources out of this repo.
