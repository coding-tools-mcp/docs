import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1280;
const HEIGHT = 720;
const IMAGE_WIDTH = 1600;
const IMAGE_HEIGHT = 1090;
const FPS = 30;

const GREEN = "#18a058";
const CYAN = "#0ea5e9";
const INK = "#10231d";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";

type Rect = { x: number; y: number; w: number; h: number };
type MouseAction = {
  at: number;
  x: number;
  y: number;
  rect?: Rect;
};
type SceneSpec = {
  image: string;
  stateImage?: { at: number; image: string };
  seconds: number;
  focus: Rect;
  endFocus?: Rect;
  title: string;
  body: string;
  actions?: MouseAction[];
};

const full: Rect = { x: 0, y: 0, w: IMAGE_WIDTH, h: IMAGE_HEIGHT };

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

const mixRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: interpolate(t, [0, 1], [a.x, b.x]),
  y: interpolate(t, [0, 1], [a.y, b.y]),
  w: interpolate(t, [0, 1], [a.w, b.w]),
  h: interpolate(t, [0, 1], [a.h, b.h]),
});

const transformFor = (rect: Rect) => {
  const fit = Math.max(WIDTH / rect.w, HEIGHT / rect.h);
  const scale = Math.min(fit, 1.72);
  let x = WIDTH / 2 - (rect.x + rect.w / 2) * scale;
  let y = (HEIGHT - 110) / 2 - (rect.y + rect.h / 2) * scale;

  const scaledW = IMAGE_WIDTH * scale;
  const scaledH = IMAGE_HEIGHT * scale;
  if (scaledW >= WIDTH) {
    x = Math.min(0, Math.max(WIDTH - scaledW, x));
  }
  if (scaledH >= HEIGHT) {
    y = Math.min(0, Math.max(HEIGHT - scaledH, y));
  }
  return { scale, x, y };
};

const pointToScreen = (
  x: number,
  y: number,
  transform: { scale: number; x: number; y: number },
) => ({
  x: x * transform.scale + transform.x,
  y: y * transform.scale + transform.y,
});

const rectToScreen = (
  rect: Rect,
  transform: { scale: number; x: number; y: number },
) => ({
  left: rect.x * transform.scale + transform.x,
  top: rect.y * transform.scale + transform.y,
  width: rect.w * transform.scale,
  height: rect.h * transform.scale,
});

const Cursor: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 34,
      height: 34,
      zIndex: 40,
      filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.45))",
      pointerEvents: "none",
    }}
  >
    <svg width="34" height="34" viewBox="0 0 34 34">
      <polygon
        points="3,2 3,28 10,22 14,33 18,31 14,21 24,20"
        fill="white"
        stroke="black"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const mouseState = (actions: MouseAction[], time: number) => {
  if (actions.length === 0) return null;
  const first = actions[0];
  let previous = { x: first.x - 240, y: first.y + 150, at: 0 };
  let current = previous;

  for (const action of actions) {
    const moveStart = Math.max(0.15, action.at - 0.75);
    if (time < moveStart) break;
    const p = smooth(clamp01((time - moveStart) / 0.75));
    current = {
      x: interpolate(p, [0, 1], [previous.x, action.x]),
      y: interpolate(p, [0, 1], [previous.y, action.y]),
      at: action.at,
    };
    if (time >= action.at) {
      current = { x: action.x, y: action.y, at: action.at };
      previous = current;
      continue;
    }
    break;
  }
  if (time > actions[actions.length - 1].at) {
    const last = actions[actions.length - 1];
    current = { x: last.x, y: last.y, at: last.at };
  }
  return current;
};

const activeAction = (actions: MouseAction[], time: number) => {
  if (actions.length === 0) return undefined;
  return actions.find((action) => time < action.at + 0.65) ?? actions[actions.length - 1];
};

const Caption: React.FC<{ step: string; title: string; body: string }> = ({
  step,
  title,
  body,
}) => (
  <div
    style={{
      position: "absolute",
      left: 44,
      right: 44,
      bottom: 28,
      zIndex: 30,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "18px 22px",
      borderRadius: 20,
      color: "white",
      background: "rgba(7, 24, 19, 0.88)",
      boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
      backdropFilter: "blur(10px)",
      fontFamily: FONT,
    }}
  >
    <div
      style={{
        flex: "0 0 auto",
        minWidth: 52,
        height: 52,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        background: GREEN,
        fontSize: 25,
        fontWeight: 800,
      }}
    >
      {step}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15 }}>{title}</div>
      <div style={{ fontSize: 20, color: "#d7e5de", marginTop: 5, lineHeight: 1.35 }}>
        {body}
      </div>
    </div>
  </div>
);

const ScreenScene: React.FC<{ scene: SceneSpec; step: string }> = ({ scene, step }) => {
  const frame = useCurrentFrame();
  const duration = scene.seconds * FPS;
  const time = frame / FPS;
  const panT = smooth(clamp01(frame / Math.max(1, duration - 8)));
  const focus = mixRect(scene.focus, scene.endFocus ?? scene.focus, panT);
  const transform = transformFor(focus);
  const image = scene.stateImage && time >= scene.stateImage.at ? scene.stateImage.image : scene.image;
  const cursor = scene.actions ? mouseState(scene.actions, time) : null;
  const highlighted = scene.actions ? activeAction(scene.actions, time) : undefined;
  const opacity = interpolate(
    frame,
    [0, 8, Math.max(9, duration - 8), duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#071811", opacity, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.15)",
        }}
      >
        <Img
          src={staticFile(`images/${image}`)}
          style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
        />
      </div>

      {highlighted?.rect ? (
        <div
          style={{
            position: "absolute",
            ...rectToScreen(highlighted.rect, transform),
            border: `4px solid ${CYAN}`,
            borderRadius: 10,
            boxShadow: `0 0 0 5px rgba(14,165,233,0.18), 0 0 28px rgba(14,165,233,0.5)`,
            opacity: 0.75 + Math.sin(frame / 5) * 0.2,
            zIndex: 22,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {scene.actions?.map((action) => {
        const p = clamp01((time - action.at) / 0.58);
        if (p <= 0 || p >= 1) return null;
        const center = pointToScreen(action.x, action.y, transform);
        const size = interpolate(p, [0, 1], [18, 78]);
        return (
          <div
            key={`${action.x}-${action.y}-${action.at}`}
            style={{
              position: "absolute",
              left: center.x - size / 2,
              top: center.y - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              border: `4px solid rgba(14,165,233,${1 - p})`,
              background: `rgba(14,165,233,${0.18 * (1 - p)})`,
              zIndex: 38,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {cursor ? (
        <Cursor {...pointToScreen(cursor.x, cursor.y, transform)} />
      ) : null}
      <Caption step={step} title={scene.title} body={scene.body} />
    </AbsoluteFill>
  );
};

const CardScene: React.FC<{
  title: string;
  subtitle: string;
  bullets: string[];
  final?: boolean;
}> = ({ title, subtitle, bullets, final = false }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        opacity,
        fontFamily: FONT,
        color: "white",
        background:
          "radial-gradient(circle at 18% 12%, rgba(24,160,88,0.38), transparent 32%), linear-gradient(135deg, #061510, #0b2a1f 58%, #071811)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: 920, transform: `translateY(${interpolate(opacity, [0, 1], [34, 0])}px)` }}>
        <div style={{ fontSize: final ? 54 : 48, fontWeight: 900, letterSpacing: -1.2 }}>{title}</div>
        <div style={{ fontSize: 26, color: "#b8d7ca", marginTop: 16, lineHeight: 1.45 }}>{subtitle}</div>
        <div style={{ marginTop: 36, display: "grid", gap: 16 }}>
          {bullets.map((bullet, index) => (
            <div
              key={bullet}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                fontSize: 25,
                lineHeight: 1.35,
                opacity: interpolate(frame, [12 + index * 7, 24 + index * 7], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <span style={{ color: "#4ade80", fontWeight: 900 }}>✓</span>
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

type Copy = {
  intro: { title: string; subtitle: string; bullets: string[] };
  scenes: Omit<SceneSpec, "image" | "seconds" | "focus" | "endFocus" | "actions">[];
  final: { title: string; subtitle: string; bullets: string[] };
};

const english: Copy = {
  intro: {
    title: "Connect ChatGPT to a workspace",
    subtitle: "A focused click-through using Coding Tools MCP Desktop — watch the cursor, highlights, and zoomed regions.",
    bullets: [
      "Copy the authenticated public endpoint in Desktop.",
      "Paste it into ChatGPT as a custom MCP server.",
      "Verify with one real read-only workspace request.",
    ],
  },
  scenes: [
    {
      title: "Copy the secure endpoint",
      body: "Start the workspace, then copy the public endpoint. The URL already carries the token.",
    },
    {
      title: "Choose how the workspace is exposed",
      body: "Temporary sharing is enough for a demo; use stable public access for a permanent setup.",
    },
    {
      title: "Use Token in URL for ChatGPT",
      body: "ChatGPT can treat the complete URL as the credential, so the dialog can remain No authentication.",
    },
    {
      title: "Add a custom MCP server in ChatGPT",
      body: "Open the Plugins area, choose Add, then Add custom MCP server.",
    },
    {
      title: "Paste, acknowledge, create",
      body: "Paste the endpoint, keep No authentication, acknowledge the risk only for a server you trust, then create it.",
    },
    {
      title: "Verify with a real read",
      body: "A successful workspace file list is the acceptance test — not just a green tunnel status.",
    },
  ],
  final: {
    title: "Treat the URL like a password",
    subtitle: "The ?token= value authorizes the client. Keep it out of screenshots, chats, logs, and issues.",
    bullets: [
      "Start with a small test repository, not your whole home directory.",
      "Use stable public access and OAuth for a long-lived setup.",
      "Review git diff yourself before accepting changes.",
    ],
  },
};

const chinese: Copy = {
  intro: {
    title: "把 ChatGPT 连接到工作区",
    subtitle: "这是 Coding Tools MCP Desktop 的重点点击演示——注意鼠标轨迹、高亮框和局部放大。",
    bullets: [
      "在 Desktop 中复制带认证的公网 endpoint。",
      "把它作为 custom MCP server 粘贴到 ChatGPT。",
      "用一次真实的只读工作区请求完成验收。",
    ],
  },
  scenes: [
    {
      title: "复制安全 endpoint",
      body: "启动工作区后复制公网 endpoint。这个 URL 已经携带 token。",
    },
    {
      title: "选择工作区暴露方式",
      body: "演示用 Temporary sharing 就够了；长期使用时选择 stable public access。",
    },
    {
      title: "ChatGPT 适合 Token in URL",
      body: "完整 URL 本身就是凭据，所以 ChatGPT 对话框里可以保持 No authentication。",
    },
    {
      title: "在 ChatGPT 添加 custom MCP server",
      body: "打开 Plugins 区域，选择 Add，再选择 Add custom MCP server。",
    },
    {
      title: "粘贴、确认、创建",
      body: "粘贴 endpoint，保持 No authentication；只在信任服务器时确认风险，然后创建。",
    },
    {
      title: "用真实读取来验收",
      body: "成功列出工作区文件才是验收标准——不能只看隧道状态变绿。",
    },
  ],
  final: {
    title: "把这个 URL 当作密码",
    subtitle: "?token= 就是客户端授权凭据。不要放进截图、聊天、日志或 issue。",
    bullets: [
      "先用小型测试仓库，不要直接暴露整个 home 目录。",
      "长期使用请选择 stable public access 和 OAuth。",
      "接受修改前，自己检查 git diff。",
    ],
  },
};

const sceneVisuals = [
  {
    image: "dashboard-running.png",
    seconds: 5.4,
    focus: full,
    endFocus: { x: 835, y: 375, w: 675, h: 315 },
    actions: [
      { at: 3.15, x: 982, y: 640, rect: { x: 924, y: 621, w: 116, h: 38 } },
    ],
  },
  {
    image: "workspace-access.png",
    seconds: 4.2,
    focus: { x: 470, y: 165, w: 625, h: 755 },
    actions: [
      { at: 2.55, x: 780, y: 584, rect: { x: 502, y: 560, w: 565, h: 46 } },
    ],
  },
  {
    image: "authentication-options.png",
    seconds: 4.3,
    focus: { x: 470, y: 165, w: 625, h: 755 },
    actions: [
      { at: 2.55, x: 710, y: 675, rect: { x: 505, y: 650, w: 560, h: 42 } },
    ],
  },
  {
    image: "chatgpt-add-menu.png",
    seconds: 4.4,
    focus: full,
    endFocus: { x: 1305, y: 75, w: 270, h: 190 },
    actions: [
      { at: 2.7, x: 1452, y: 228, rect: { x: 1360, y: 209, w: 185, h: 35 } },
    ],
  },
  {
    image: "chatgpt-dialog-filled.png",
    seconds: 7.4,
    focus: { x: 480, y: 190, w: 610, h: 670 },
    endFocus: { x: 480, y: 345, w: 610, h: 670 },
    stateImage: { at: 4.9, image: "chatgpt-dialog-confirmed.png" },
    actions: [
      { at: 1.7, x: 780, y: 516, rect: { x: 510, y: 497, w: 548, h: 41 } },
      { at: 3.05, x: 780, y: 592, rect: { x: 510, y: 574, w: 548, h: 38 } },
      { at: 4.55, x: 536, y: 749, rect: { x: 515, y: 692, w: 540, h: 91 } },
      { at: 6.25, x: 1000, y: 830, rect: { x: 926, y: 811, w: 155, h: 39 } },
    ],
  },
  {
    image: "chatgpt-call-result.png",
    seconds: 5.4,
    focus: { x: 515, y: 225, w: 790, h: 450 },
    actions: [],
  },
] satisfies Omit<SceneSpec, "title" | "body">[];

export const DesktopChatgptTutorial: React.FC<{ locale: "en" | "zh" }> = ({ locale }) => {
  const copy = locale === "zh" ? chinese : english;
  let frameCursor = 0;
  const sequences: React.ReactNode[] = [];

  sequences.push(
    <Sequence key="intro" from={frameCursor} durationInFrames={4.2 * FPS}>
      <CardScene {...copy.intro} />
    </Sequence>,
  );
  frameCursor += 4.2 * FPS;

  sceneVisuals.forEach((visual, index) => {
    const text = copy.scenes[index];
    const frames = Math.round(visual.seconds * FPS);
    sequences.push(
      <Sequence key={visual.image} from={frameCursor} durationInFrames={frames}>
        <ScreenScene scene={{ ...visual, ...text }} step={`${index + 1}`} />
      </Sequence>,
    );
    frameCursor += frames;
  });

  sequences.push(
    <Sequence key="final" from={frameCursor} durationInFrames={5.2 * FPS}>
      <CardScene {...copy.final} final />
    </Sequence>,
  );

  return <AbsoluteFill style={{ background: "#071811" }}>{sequences}</AbsoluteFill>;
};

export const desktopChatgptDuration = Math.round(
  (4.2 + sceneVisuals.reduce((sum, scene) => sum + scene.seconds, 0) + 5.2) * FPS,
);
