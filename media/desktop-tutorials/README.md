# Desktop tutorial videos

Programmatic click-through tutorials rendered with [Remotion](https://www.remotion.dev/).

The videos are intentionally rendered from known screenshots plus explicit cursor, click, zoom, and caption keyframes. This is easier to maintain than a raw screen recording: every click target is visible, the cursor path is deterministic, captions can be localized, and outdated steps can be re-rendered after replacing a screenshot.

## Render

```bash
npm install
npm run render
```

Outputs:

- `../../public/videos/desktop-chatgpt-en.mp4`
- `../../public/videos/desktop-chatgpt-zh.mp4`

Refresh the localized poster frames after rendering when the intro card changes:

```bash
ffmpeg -ss 0.6 -i ../../public/videos/desktop-chatgpt-en.mp4 -frames:v 1 -q:v 3 ../../public/images/desktop/chatgpt-tutorial-en-poster.jpg
ffmpeg -ss 0.6 -i ../../public/videos/desktop-chatgpt-zh.mp4 -frames:v 1 -q:v 3 ../../public/images/desktop/chatgpt-tutorial-zh-poster.jpg
```

## Update a tutorial

1. Replace or add screenshots under `public/images/`.
2. If `chatgpt-dialog-filled.png` changes, regenerate the checked/enabled confirmation state with Pillow:
   ```bash
   python3 -m pip install pillow
   python3 scripts/generate-confirmed-dialog.py
   ```
3. Update scene timing, focus rectangles, cursor targets, and localized captions in `src/DesktopChatgptTutorial.tsx`.
4. Render both language compositions and inspect the videos.
5. Commit the Remotion source and the rendered MP4 assets used by the docs.

Coordinates are in the original 1600×1090 screenshot coordinate space. Keep credential-like example URLs clearly fake when replacing screenshots. The focus rectangles are static zoomed shots rather than continuous camera pans; this keeps the video readable without making viewers motion-sick.
