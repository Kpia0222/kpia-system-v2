# 🛸 TECHNICAL STACK & ARCHITECTURE

このプロジェクトは、最新のWeb技術を駆使して構築された、没入型の3Dデジタル宇宙体験です。

## 1. 主要技術スタック (Primary Tech Stack)

### 核心フレームワーク (Core Framework)
* **Next.js (App Router) [v16.1.4]:** 全体の基盤、SSR/SSG、APIルート、ミドルウェア管理。
* **TypeScript [v5.x]:** 強固な型安全性、`any`の排除、インターフェース定義の徹底。

### 3Dレンダリング (3D Rendering Engine)
* **Three.js [v0.182.0]:** 低レイヤー3Dグラフィックスエンジン。
* **React Three Fiber (R3F) [v9.5.0]:** Three.js の React ブリッジ。宣言的な3D構築。
* **@react-three/drei [v10.7.7]:** 抽象化された便利なヘルパー、カメラ制御、ジオメトリ等の提供。
* **WebGPU (Preferred):** Chrome/Edge等での次世代レンダリング。互換性維持のためのWebGLフォールバック。

### スタイリング & UI (Styling & UX)
* **Tailwind CSS [v4.x]:** ユーティリティファーストなスタイリング、`@tailwindcss/postcss` を使用。
* **Framer Motion [v12.28.2]:** DOM要素（2D UI）の高度なアニメーション。
* **Leva [v0.10.1]:** 開発時のデバッグ用GUIコントローラー。

### 状態管理 & 通信 (State & Communication)
* **Zustand [v5.0.10]:** 軽量で柔軟なグローバル状態管理。3DとDOMのブリッジ役。
* **Supabase (@supabase/ssr) [v2.93.3]:** 認証、データベース、ストレージを担うBaaS。

---

## 2. 技術詳細指針 (Technical Guidelines)

### 3D レンダリング戦略
* **Performance First:** `Object3D` の再利用、ジオメトリ・マテリアルのインスタンス化を意識する。
* **Reference Management:** `useFrame` 内での参照アクセスは `ref.current` を通じて直接行い、ReactのState更新は避ける。

### 状態管理の棲み分け
* **Local State (useState/useRef):** コンポーネント内のみで完結する、頻繁な更新（アニメーションの進捗等）。
* **Global Store (Zustand):** 複数コンポーネントを跨ぐデータ、2D UIとの同期が必要な状態。

### データベース & 認証
* **Server Components:** 可能な限りサーバーサイドでデータをフェッチし、クライアントに渡す。
* **Authentication:** Supabaseの認証機能は Next.js ミドルウェアを通じて制御する。
