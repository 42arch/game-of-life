# Game of Life (Three.js + WebGPU) - 技术文档

## 1. 技术栈
*   **前端框架:** [Next.js 14+](https://nextjs.org/) (React 18+, TypeScript)
*   **图形渲染:** [Three.js](https://threejs.org/)
*   **GPGPU:** 利用 Three.js 的 `WebGLRenderTarget` 和 Shader Material 实现“Ping-Pong”纹理交换技术，在 GPU 上进行细胞状态计算。
*   **UI 组件:** [shadcn/ui](https://ui.shadcn.com/) (基于 Radix UI 和 Tailwind CSS)。
*   **样式:** Tailwind CSS。
*   **图标:** Lucide React。

## 2. 核心架构

### 2.1 目录结构
```
app/
├── components/
│   ├── GameOfLife.tsx       # 主容器组件，连接 UI 和 游戏引擎
│   └── ui/                  # UI 组件 (Sidebar, PlaybackControls, StatsCard, etc.)
├── core/
│   └── GameEngine.ts        # 游戏核心引擎 (Three.js 逻辑封装)
├── hooks/
│   └── useLifeGameEngine.ts # React Hook，用于管理 GameEngine 实例和状态
├── shaders/
│   ├── fragment.glsl.ts     # 片元着色器 (模拟逻辑 & 渲染逻辑)
│   └── vertex.glsl.ts       # 顶点着色器 (通用平面投影)
└── types.ts                 # 类型定义
```

### 2.2 渲染与模拟原理 (GPGPU)
本项目不使用 CPU 遍历数组来计算下一代状态，而是使用 GPU 的并行计算能力。

1.  **双帧缓存 (Ping-Pong Buffers):**
    *   创建两个 `WebGLRenderTarget` (`fboA` 和 `fboB`)。
    *   纹理每个像素的 R 通道存储细胞状态 (0.0 = 死, 1.0 = 活)。
    *   **步骤 1 (计算):** 将 `fboA` 作为输入纹理 (`tSource`) 传入模拟着色器 (`SIMULATION_FRAGMENT_SHADER`)。渲染到一个全屏四边形，输出结果到 `fboB`。
    *   **步骤 2 (展示):** 将 `fboB` 作为纹理映射到一个平面 Mesh 上，使用渲染着色器 (`RENDER_FRAGMENT_SHADER`) 显示到屏幕。
    *   **步骤 3 (交换):** 交换 `fboA` 和 `fboB` 的引用。下一帧以 `fboB` (旧的输出) 作为输入。

2.  **着色器逻辑 (`fragment.glsl.ts`):**
    *   **Simulation Shader:** 读取当前像素周围 8 个邻居的状态，根据 Conway 的规则计算下一帧状态。同时处理鼠标绘制 (`uIsDrawing`) 和图案印章 (`uIsStamping`) 逻辑。
    *   **Render Shader:** 读取当前状态纹理，根据 `uColorAlive` 和 `uColorDead` 混合颜色输出。处理网格线 (`uGridVisible`) 的绘制（使用 `fwidth` 实现抗锯齿网格）。

3.  **交互实现:**
    *   **绘制:** 通过 `Raycaster` 获取鼠标在平面上的 UV 坐标，传入 Shader (`uMouse`)。Shader 计算像素与鼠标的距离，若小于笔刷半径则设为存活。
    *   **图案拖拽:** 拖拽时计算落点 UV，将图案纹理传入 Shader (`uStampTexture`)，在特定帧将图案叠加到状态纹理中。

### 2.3 状态同步
*   **React <-> Three.js:** 使用 `GameEngine` 类封装 Three.js 逻辑。React 通过 `ref` 获取 DOM 挂载点初始化引擎。
*   **通信:**
    *   **React -> Engine:** 通过调用 `engine.setSpeed()`, `engine.setGridDimensions()` 等方法传递参数。
    *   **Engine -> React:** 通过回调函数 (`onStatsUpdate`, `onGameStateChange`) 将帧率、世代数、存活数同步回 React 状态，更新 UI。

### 2.4 统计实现
*   **异步读取:** 使用 `renderer.readRenderTargetPixelsAsync` (如果支持) 或 `readRenderTargetPixels` 从 GPU 显存读取当前帧的纹理数据到 CPU `Float32Array`。
*   **节流:** 为了不阻塞主渲染循环，统计更新操作被节流 (Throttle) 到每 1000ms 执行一次。
*   **计数:** 遍历像素数组计算 `value > 0.5` 的数量。

## 3. 关键类与方法

### `GameEngine`
*   `init(container)`: 初始化 Renderer, Scene, Camera, FBOs。
*   `animate()`: 渲染循环 (`requestAnimationFrame`)。处理模拟步进、渲染、状态更新。
*   `setGridDimensions(w, h)`: 重建 FBOs 以调整网格大小。
*   `updateStats()`: 读取 GPU 纹理计算统计数据。

### `SIMULATION_FRAGMENT_SHADER`
*   `uniform float uSimulate`: 控制是否运行生命游戏规则。
*   `uniform float uIsDrawing`: 控制是否应用笔刷。
*   `uniform float uIsStamping`: 控制是否应用图案。

## 4. 优化策略
*   **Half-Float Texture:** 使用 `THREE.FloatType` 或 `HalfFloatType` 确保精度。
*   **Power Preference:** WebGL context 请求 `high-performance`。
*   **按需更新:** 只有在 `isRunning` 为 true 或有交互操作时才进行 GPGPU 计算，否则只重绘显示层。
