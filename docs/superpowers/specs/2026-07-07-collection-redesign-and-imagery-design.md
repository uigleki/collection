# Perfect Collection — 改版设计规格 · 「立月 / The Standing Moon」

Date: 2026-07-07 · Status: Draft for build · Branch: `redesign/imagery-and-visual-system`

---

## 摘要

把 "Perfect Collection" 重做为一个 **Awwwards/FWA 级的沉思式 nocturne**：一轮**恒定的月**悬于负空间，作品如"指向月的手指"在其下的一条**垂直之河**中浮现、滚过；聚焦的作品其**真彩封面从月光水影中涟漪显影**。技术上用业界最强的动画/图形库栈（**Lenis + GSAP/ScrollTrigger + Motion + React Three Fiber/OGL + View Transitions**）实现电影级编排，同时守住性能与无障碍。

**北极星**（每个决策的准绳）：*若它让封面更"在场"、让空间更静，就留下；若它只是让设计自身更炫，就砍掉。* **指月之指，非月。**

指导精神：**本質（authenticity）**——真彩原图、原文标题、全无衬线；美来自排版/留白/编排/图像工程，而非对内容的加工。非商用 · 个人 · 公开。版权见 §8。

---

## 1. 现状与目标

**Stack（不变）**: React 19, Vite 8, Tailwind v4, TypeScript, Bun, react-router v8, vite-plugin-pwa, Vitest + Playwright。静态部署。`motion` 已装。

**现状**: 三路由（`/` `/reviews` `/why`）；纯文字卡片 + 乱填 `color` 左边框；动效散乱炫技（3D 弹跳）；Ubuntu；无 `prefers-reduced-motion`；纯黑深色。

**目标**: 建立「立月」signature 与冷月夜视觉系统；用强库栈做电影级动画；加入真彩封面（构建期自动抓取 + 合规）；补齐无障碍与性能。

**非目标**: 不改信息架构；不引组件库；不商用；不为画师建高清画廊；不做"日式旅游符号"（樱花/鸟居/红日/毛笔字）——只借**原则**（間、克制、字理），不借**符号**。

---

## 2. 锁定决策（Locked）

- **Signature = 「立月」**：固定月 + 作品如"指"滚过 + 倒影显影封面。见 §5。
- **布局 = 垂直之河**，非卡片网格；侧边竖排 CJK 印记与横排 Ubuntu 十字交叉。见 §3.3。
- **配色 = 冷色月夜（dark-first）**，强调＝光度非色相；单一月晕光；封面永不重着色（仅氛围底板可双色调）。见 §3.1。
- **字体 = 全无衬线**：拉丁永远 **Ubuntu**（Light/Medium，绝不 Bold 做显示级）；CJK 用**黑体/ゴシック**（苹方/Hiragino + 自托管思源黑体/Noto Sans CJK 子集）。否决一切衬线（明朝/宋体/Georgia）。见 §3.2。
- **技术栈 = Lenis + GSAP/ScrollTrigger(+SplitText/Flip) + Motion + R3F/OGL + View Transitions**。分工见 §4。
- **封面 = 真彩、原貌、构建期脚本自动抓取**（AniList/TMDB/IGDB/CAA）；同人音乐/冷门游戏/画师手工补。废弃乱填 `color`，改用**从真封面提取的主色**做极克制点缀。
- 性能/无障碍为一等公民：poster-first LCP、离屏暂停、四层 `prefers-reduced-motion`、移动端限 dpr。见 §4.4。

---

## 3. 视觉系统

### 3.1 配色 — 冷色月夜（dark-first），另配"雨后清晨"浅色

强调**不是**色相而是**光度（glow）**；暖色仅作"重逢"母题的 ≤8% 月晕，极罕见。**封面永远真彩，不做任何重着色**；双色调/染色只允许用在非正典的氛围底板（雨、水、纹理）。

**Nocturne（默认/深色）**
| Token | Hex | 用途 |
|---|---|---|
| 墨 sumi（底） | `#0A0D14` | 页面背景（蓝黑，非纯黑） |
| 深水 deep-water | `#10141E` | 面板/条带 |
| 夜蓝 night-blue | `#1A2130` | 抬升表面/卡片静息 |
| 霧 mist（发丝线） | `#2C3444` | 1px 分隔/边框 |
| 月白 moon-white | `#EAEEF4` | 主文字（冷、通透） |
| 微光 faint | `#8B97A9` | 次文字/元数据 |
| 月暈 halo | `#C7D3E0` | 月、聚焦光、关键发丝 |
| 水光 water | `#6E8CA0` | 倒影染色/hover 链接 |
| 暖月 warm-moon（罕用） | `#C9B28A` | 仅"重逢"时刻的 ≤8% 月晕 |

**After-rain（浅色）— 冷的雨洗纸，非暖奶油**
| Token | Hex | 用途 |
|---|---|---|
| 薄雾 mist-paper | `#EEF1F5` | 背景（冷灰蓝） |
| 云 cloud | `#E4E8EE` | 次表面 |
| 墨 ink | `#14181F` | 主文字 |
| 远山 far | `#55606F` | 次文字 |
| 霜 frost | `#D3D9E1` | 发丝线 |
| 潮 tide | `#5E7488` | 链接/聚焦 |
| 暖月 warm-moon（罕用） | `#B79F76` | 重逢月晕 |

- **胶片颗粒**：单层动画噪声叠加，全站 **3–5%** 透明度（着色器实现，会呼吸），把封面/字/光融为一口"照相之气"。
- **辉光**：全站**仅一处**软径向月晕。多处辉光＝廉价 SaaS 感。
- 通过 Tailwind v4 `@theme` + `light-dark()` + `data-theme` 覆盖实现，双主题同等打磨。

### 3.2 字体 — Ubuntu × CJK 黑体，把"字"做成个性

- Ubuntu 是**人文无衬线**（圆润端点、开口 a/e/g、独特数字）——**别让它退化成 Inter 式中性**，要用出它的性格。CJK 配**黑体（ゴシック）**，用"尺寸/字重/間"拿到明朝般的沉静，而非用衬线。
- 字体来源：拉丁 Ubuntu；CJK 苹果端原生 **PingFang/Hiragino**，其余端**自托管 Source Han Sans / Noto Sans CJK 子集**（`pyftsubset`/`subset-font`，`unicode-range`，`font-display: swap`，几 KB）。
- **显示级**：hero 标题 `clamp(2.5rem, 8vw, 9rem)`，**仅 Ubuntu Light(300)/Medium(500)，绝不 Bold**；靠尺寸与留白出力。
- **字距**：大号拉丁 `-0.01em ~ -0.02em`（编辑感收紧）；小号拉丁标签 `+0.12em ~ 0.25em`（安静的奢侈感）。
- **CJK 标题**：Light/Regular，`line-height: 1.8`，短标题 `letter-spacing: .05–.1em`；CJK 比相邻拉丁**大 5–8%** 以匹配视重。
- **十字轴**：横排 Ubuntu 标题 + **侧边竖排（tategaki, `writing-mode: vertical-rl`）CJK 印记**（作品序号、指月印、一行感受）＝记忆点。
- **数字为母题**：`作品 001 / 月`、`2015 · 雨`，等宽、字距舒展，把索引做成字体艺术。
- **正文**：Ubuntu Regular `1.6`，measure ~62ch；CJK 正文 `1.9`。文字周围的静默＝間。

### 3.3 布局 — 垂直之河（非网格）

组织隐喻＝**在动水上看恒月**：一条连续垂直滚动（河），月固定其上，作品在不同"深度/偏移"浮现。

- **节奏铁律**：绝不连续两件作品同尺寸/同侧。交替：*全幅英雄条 → 漂浮在"間"里的小件 → 双联 → 只有一行字的"呼吸"空屏 → 循环*。每屏至多 1–2 件。**空屏是内容（間），不是浪费。**
- **侧边竖排**（tategaki）走索引号/指月印/一行感受；拉丁元数据横排。
- **备选"星座/索引"视图**：作品为散落暗空的光点，大小由"它多大程度上丰盈了我"决定（非网格）；hover 画一条 月→作品 的细线（那根"手指"）。
- 参考沉浸式画廊的"空间化、虔诚"而非商店网格（见 §9 参考）。

### 3.4 动效定位（技术实现见 §4）

目标是**世界级编排**（非更少动效，也非满屏碎抖）。气质 **awe not hyperactivity**：慢、通透、有呼吸。**每个效果都必须映射到 月/雨/水/记忆/重逢，否则砍掉——手指绝不可盖过月。**

---

## 4. 技术栈与分工（Motion / Graphics）

口诀：**GSAP 编排世界 · Motion 响应用户 · Lenis 移动页面 · WebGL 绘出梦境。**（严格分车道，避免三者打架。）

| 层 | 库 | 版本/许可 | 职责 |
|---|---|---|---|
| 滚动基座 | **Lenis** (`lenis` + `lenis/react` `<ReactLenis root>`) | 1.3.x · MIT | 惯性顺滑滚动，保留原生滚动语义/可访问性；**驱动 ScrollTrigger**（见下） |
| 编排/时间轴 | **GSAP + ScrollTrigger + SplitText + Flip**（`@gsap/react` 的 `useGSAP`） | 3.13.x · Standard License，**全免费含全部插件** | scrub 时间轴、**pin 立月**、交错编排、标题揭示、共享元素 |
| UI 动效 | **Motion** (`motion/react`，已装) | 12.x · MIT | 组件进出场(`AnimatePresence`)、hover/tap/drag、`layout` 重排 |
| WebGL/着色器 | **OGL**（轻量单面着色器，hero 首选）或 **R3F + drei + @react-three/postprocessing**（场景变复杂时） | MIT | 月-水墨 hero、颗粒/辉光/暗角、封面显影；**GSAP 补间其 uniforms** |
| 路由转场 | **View Transitions API**（react-router `viewTransition` + `useViewTransitionState`）；含 canvas 的转场用 **GSAP Flip + 常驻 canvas** | — | 缩略图→详情的共享元素 morph；着色器溶解 |

### 4.1 Lenis ↔ GSAP 接线（唯一滚动引擎）
`<ReactLenis root>` 包裹应用；用 `gsap.ticker.add(t => lenis.raf(t*1000))` + `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.lagSmoothing(0)`。**不得同时跑第二个滚动引擎**（不要再用 Motion `useScroll(window)` 做同一效果）。

### 4.2 signature 配方
- **立月 pin+scrub**：月（WebGL 层或蒙版元素）置于 `ScrollTrigger { pin:true, scrub }` 容器；scrub 时间轴驱动月的 uniform（位置/缩放/盈亏相位）、压暗水面、揭示标题——uniform 驱动＝月无缝恒在，不重挂载。
- **倒影→封面显影**：水线处 OGL/R3F 平面，`uProgress` 从"涟漪+模糊(Kawase)"归零，用噪声阈值蒙版把 placeholder 溶解为**真彩封面**（倒影可失真，封面落定即真彩不动）。触发＝Motion hover 或 ScrollTrigger enter。
- **墨破入场（仅首帧一次）**：黑屏被一笔水墨破开、外洇、蒸发为月；grain/dither 着色器实现，3–5 秒，之后永不重复。
- **SplitText 标题揭示**：按 **chars** 切（CJK 无空格、有禁则），保标点、resize 重切、`document.fonts.ready` 后再切；逐字 opacity/`y`/`clip-path`。

### 4.3 路由转场
默认交叉淡入/morph 用 View Transitions（`Link viewTransition`）；需 scrub/多阶段/含 WebGL 的转场用 GSAP + 常驻 canvas，并对不支持的浏览器/reduced-motion 提供即时导航降级。

### 4.4 性能与无障碍护栏（Awwwards 与可访问性双重计分）
- **WebGL 绝不做 LCP、不阻塞首帧**：先出静态月 poster/CSS 渐变作为 LCP，`requestIdleCallback` 后懒初始化 canvas 淡入；hero 进入视口才挂载 R3F/OGL。
- **离屏暂停**：`IntersectionObserver` 或 R3F `frameloop="demand"`；离场 `disable()` 不需要的 ScrollTrigger。
- **四层 `prefers-reduced-motion`**：`gsap.matchMedia()` 注册无动版、Lenis 回落原生滚动、Motion `useReducedMotion()`、WebGL 冻结为静帧/poster。
- **移动端**：OGL 优先于 three；`dpr` 限 `[1,1.5]`；片元着色器保持廉价、降分辨率上采样；真机中端安卓实测。
- **长列表** `content-visibility:auto` + `contain-intrinsic-size`。
- **React 19**：一律 `useGSAP()`，不得裸 `useEffect` 跑 GSAP；按需注册插件、代码分割 WebGL hero；`will-change` 节制。

---

## 5. Signature 详述 — 「立月」

- 一轮月固定于上三分之一偏右的負空間，**始终不动**；作品在其下的垂直之河中滚过（"指"）。月随滚动微盈亏、月晕呼吸；视口底一道水线映出月影。
- **聚焦即显影**：作品居中/聚焦时，其真彩封面从月光水影（涟漪+模糊）中锐化落定——**倒影是无常（可失真），封面是本質（真彩不动）**。
- 次级节拍（非主 signature）：**墨破入场**（首帧一次）；**记住雨**（打开作品时玻璃层雨滴短暂划落又拭去，呼应 雨→记忆→重逢）。
- 为何它赢：这是贯穿全站的**结构性隐喻**，不是滚过一次的特效；给全站一个难忘的单一意象，几乎不占注意力，且其它一切（固定月/移动作品/水线/倒影→封面）都由它逻辑派生——这种连贯＝"被艺术指导过"而非"模板"。

---

## 6. 数据模型

`src/data/types.ts`：
```ts
export interface ImageSource { provider: "anilist"|"tmdb"|"igdb"|"steam"|"coverartarchive"|"vocadb"|"manual"; id?: string; url: string; credit: string; }
export interface WorkImage { src: string; width: number; height: number; thumbhash: string; accent: string; alt: string; source: ImageSource; }
export interface Work {
  title: string; subtitle: string;      // color: 移除
  image?: WorkImage;                     // 无合法图源 → 优雅降级为纯文字/竖排
  readonly review: readonly ReviewPoint[]; readonly flaws?: readonly ReviewPoint[];
  readonly ref?: { provider: ImageSource["provider"]; id: string }; // 抓图脚本输入
  readonly weight?: number;              // "多大程度丰盈了我"，驱动河的尺寸与星座视图
}
```
- `WorkTrack` 同加可选 `image?`。生成产物（thumbhash/accent/尺寸/路径/来源）写入 `src/data/generated/covers.ts`（纳入版本库，构建可复现）。ID 清单见 §7.3。

---

## 7. 图像流水线

### 7.1 抓取脚本 `scripts/fetch-covers.ts`（Bun，幂等）
遍历带 `ref` 的作品 → 按 provider 取图（AniList GraphQL / TMDB `image.tmdb.org` / IGDB Twitch-OAuth `images.igdb.com` / Steam CDN by appid / Cover Art Archive by mbid）→ 存 `src/assets/works/<slug>.<ext>` → 算 **ThumbHash** + **提取主色**（`sharp`/`node-vibrant`）→ 写 `covers.ts`。密钥经 `.env`（TMDB、Twitch）；AniList/CAA/Steam 无需 key。合规缓存：IGDB(鼓励自存)/TMDB(≤6月)/Steam(个人可接受) 自存；AniList/CAA 倾向热链——仅取当前收录、不批量镜像（保留"运行时热链"开关）。

### 7.2 构建优化（vite-imagetools）
`import cover from "@/assets/works/x.jpg?w=480;960;1440&format=avif;webp;jpg&as=picture"` → 响应式 `<picture>`、hash 缓存、零运行时。每类统一自然比例最小裁切（动画/电影 2:3、游戏 3:4 或 16:9、音乐 1:1、画师 2:3，画师**不裁切**）。始终设 `width/height`（用 thumbhash 比例）杜绝 CLS；hero 一张 `fetchpriority="high"`；其余 `loading="lazy" decoding="async"`；**LCP 图不 lazy**。PWA：`vite.config.ts` 的 Workbox `globPatterns` 增 `png,jpg,jpeg,webp,avif`。

### 7.3 作品 ID 清单
动画: 化物語 AniList `5081` · 偽物語 `11597` · ハイスコアガール `20574` · 少女終末旅行 `99420`（截图补 TMDB）。电影: TMDB — 打ち上げ花火(2017)/ペンギン・ハイウェイ(2018)/Charlie and the Chocolate Factory。游戏: Steam appid — To the Moon `206440`/Edith Finch `501300`/Finding Paradise `337340`/Steins;Gate `412830`/7年後で待ってる `1562920`/ASTLIBRA `1718570`。音乐: 主流→MusicBrainz+CAA；同人/V家→VocaDB+官方页（多数无图，保持文字/竖排，手工补个别）。画师 カントク: 无合法 API → **仅链出**官方站/pixiv/X/BOOTH，至多一张未改动小图+署名。

---

## 8. 版权与合规

非商用+个人评论+缩略尺寸+署名 → 跨美/欧/日/中约 **2/10**。落实：①官方 API+署名；②缩略/参考尺寸且挨着原创短评；③每图署名并链回官方（欧/日/中为法定）；④能链接/嵌入优先于重制转存（欧盟 *Renckhoff*）；⑤Footer/`/credits` 放 takedown 联系并秒回；⑥**画师仅链出、不裁切不改色不建高清画廊**（日本同一性保持权）；⑦写清 **CC BY-SA 4.0 仅覆盖你的文字与代码**，第三方封面/截图/插画版权归原权利人、仅作评论用途。

---

## 9. 参考画廊（各偷一样）
Garden Eight *The Shift*（克制的节奏赢 SOTM）· mount *Yamauchi No.10*（暗、电影、几乎无 UI 的虔诚奢侈）· baqemono *NEWFOLK/MOHEIM*（为静止服务的工程级交互）· 中村勇吾（Yugo Nakamura）工作室（把动作当材料）· monopo *LIONS GOOD NEWS*（"收藏"的编辑式叙事）· Awwwards Japan / 沉浸式 WebGL 画廊合集（空间化虔诚而非商店网格）· Codrops：GSAP 着色器涟漪/揭示/模糊（倒影→封面配方）、Three.js 水扰动、Rain&Water、Efecto/VFX-JS（颗粒/墨破）· tategaki.github.io（生产级竖排）· Source Han Sans + CJK 排版指南（正确断行/视重）· 物哀与間 primer（为每一处空屏正名）。

---

## 10. 依赖与工具

**新增运行时**：`lenis`、`gsap`、`@gsap/react`、`three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`（和/或 `ogl`）。`motion` 已装。
**新增构建/资产**：`vite-imagetools`、`thumbhash`、`sharp`（或 `node-vibrant`）、`subset-font`（或 `fonttools pyftsubset`）。
**QA**：`@axe-core/playwright`、Playwright 视觉快照、Lighthouse CI 预算。保留 Context7 MCP；开发环境加 Chrome DevTools MCP + Playwright MCP。
**跳过**：`@squoosh/cli`(归档)、`@unpic`(需CDN)、`unplugin-imagemin`(停滞)、shadcn/Figma MCP、pa11y(与 axe 重复)。`@paper-design/shaders`(0.x) 仅作装饰、锁版本。

---

## 11. 实现分期（带检查点；TDD，期末验证 + code review）

- **P0 · 技术地基（无图即见效）**：装依赖；`<ReactLenis root>` + GSAP/ScrollTrigger 接线 + `useGSAP` + `gsap.matchMedia` reduced-motion 骨架；Nocturne tokens（双主题）+ 字体（Ubuntu + 自托管 CJK 子集）+ 字号刻度；移除乱填 `color`。
- **P1 · 立月 hero**：OGL/R3F 月-水墨着色器 + 颗粒/月晕呼吸 + 墨破入场；SplitText 标题揭示；poster-first LCP + 懒初始化 + reduced-motion 静帧。**核心 signature。**
- **P2 · 垂直之河 + 滚动编排**：Home 重构为"河"节奏；pin 立月贯穿开场；tategaki 侧边印记；ScrollTrigger 揭示；"呼吸"空屏。
- **P3 · 数据模型 + 抓图流水线**：types、`fetch-covers.ts`、thumbhash + 提取色、vite-imagetools、PWA globs、`covers.ts`。
- **P4 · 倒影→封面显影**：水线着色器 `uProgress` 显影真彩封面；封面揭示转场；真彩不失真保证。
- **P5 · Reviews/Why 对齐 + 路由 View Transitions**。
- **P6 · 合规**：`/credits`、Footer 署名/takedown/CC、画师链出。
- **P7 · 音乐图（尽力）** + 长尾手工。
- **P8 · QA/性能**：Lighthouse CI 预算、axe、视觉快照、dpr 限制、content-visibility、双主题对比度、reduced-motion 全审。

---

## 12. 风险与开放项
- **WebGL 性能/兼容**：poster-first + 懒初始化 + dpr 限制 + reduced-motion 静帧是硬约束；低端设备回落静态月。
- **CJK + SplitText 断行**：按 chars 切、保标点、resize 重切、字体就绪后再切。
- **热链 vs 自存**：默认可自存者自存，保留热链开关；上线若加 CSP 需放行相应图源域名（当前 `_headers` 无 CSP）。
- **"炫"与"静"的度**：signature 之外一切从简；真机滚动目视校准；始终 reduced-motion 降级。
- 同人音乐长尾/画师基本无图——接受文字/竖排为常态，不强凑。
