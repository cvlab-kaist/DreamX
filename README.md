# DreamX project page

Live site: https://cvlab-kaist.github.io/DreamX/

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
        └── attention/      # human / arm1 / arm2 .mp4 attention clips (see below)
```

## Auto-upgrading media slots
Every placeholder and every photo in the teaser figure points at an expected file.
Drop an mp4 with that exact name in place and the page switches from the still or placeholder to the video. You don't need to edit any HTML.

| Where on the page | Expected file(s) |
|---|---|
| Teaser – input thumbnails | `static/videos/teaser/human_{1,2,3}.mp4`, `robot_{1,2,3}.mp4` |
| Teaser – universal across embodiments | `static/videos/teaser/universal_human.mp4`, `universal_robot.mp4` |
| Teaser – policy scene | `static/videos/teaser/policy_sim.mp4` |

## Attention maps
The Attention section shows one clip at a time; the pills pick `static/videos/attention/{human,arm1,arm2}.mp4` (EgoVerse, Bridge, BimanualYAM).
Each clip has the input on the left and the attention overlay on the right, at the source camera's aspect ratio: EgoVerse and BimanualYAM are 16:9 (1708×480), Bridge is 4:3 (1280×480). The attention renders come out at 640×480, so the 16:9 clips are stretched back to their original shape.
Each clip steps through six native time steps, holding each for 0.7 s, and the bar under the video shows playback progress.
Posters are `static/posters/att_{human,arm1,arm2}.jpg` (the first step). To add a clip, drop in `<id>.mp4` and `att_<id>.jpg` and add a pill with `data-id="<id>"` plus the video size in `data-w` / `data-h` in `index.html`.

## Dataset sample clips
Each dataset card plays its clips one after another. The clip list and captions live in `DATASETS` in `static/js/main.js`.
To swap a clip, drop the mp4 into `static/videos/datasets/<dataset>/`, add a poster at `static/posters/ds_<clip>.jpg`, and update that list.

## Interim videos
The any-to-any and HumanAndRobot clips are cropped out of the concatenated supplementary videos, with the burned-in label strip removed.
To use clean originals, overwrite the files with the same names. The HumanAndRobot generated outputs still carry a "GENERATED" mark from the source videos.

## Other TODOs
Search `index.html` for `TODO` to find the Code button, which still says "soon".

## Deploy (GitHub Pages)
This folder is the root of https://github.com/kchyun/DreamX.
1. Push to `main`.
2. In the repo, go to Settings → Pages → Build and deployment → Source: *Deploy from a branch*, then pick `main` and `/ (root)`.
3. The site goes live at https://kchyun.github.io/DreamX/ (the path is case-sensitive) a minute or two after each push.

All asset paths are relative, so the site works under the `/DreamX/` sub-path and when opened locally.
Keep the paper PDF and the PPTX sources out of this repo.
