# 🛸 PROJECT SYSTEM PROMPT & ARCHITECTURE

## 1. PROJECT OVERVIEW

このプロジェクトは、**「Vibe Coding（AI生成）」のスピード**と**「プロレベルの保守性・品質」**を両立させるための、Next.jsおよびR3F（React Three Fiber）を用いた高度な3D Webエクスペリエンスです。

## 2. TECHNICAL STACK

AIは以下のスタックに基づいたコード生成を行ってください。

* **Framework:** Next.js (App Router)
* **3D Engine:** React Three Fiber (R3F), Three.js, @react-three/drei
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Backend:** Supabase
* **Infrastructure:** Vercel, GitHub

---

## 3. DIRECTORY MAP (Folder Rules)

コードの配置場所を厳格に守ってください。

* `src/components/canvas/`: **3D世界専用。** R3Fコンポーネント、3Dモデル、ライト、環境設定。
* `src/components/dom/`: **2D UI専用。** Tailwind CSSで構築されるメニュー、HUD、オーバーレイ。
* `src/config/`: **定数管理。** 座標、色、時間、設定値。**マジックナンバーの避難所。**
* `src/hooks/`: **ロジック抽出。** 状態変化、計算、イベントリスナー。
* `src/store/`: **グローバル状態。** Zustandによるストア定義。
* `src/types/`: **型定義。** DBスキーマおよび共有インターフェース。

---

## 4. CODING CONSTITUTION (開発憲法)

すべてのAIアシスタント（Gems）が遵守すべき**絶対的なルール**です。

### 🚨 RULE 01: マジックナンバーの禁止

* コード内に数値を直接書き込まないこと（例: `position={[0, 5, 0]}` や `delay: 0.2` はNG）。
* すべての数値は `src/config/` 内の定数ファイルからインポートする。
* 新しい数値が必要な場合、AIは「どのconfigに何を追記すべきか」をまず提案すること。

### 🚨 RULE 02: 250行の壁

* 1ファイルの行数が **250行** を超える場合、即座に機能の切り出し（Component/Hooks化）を行う。
* 3Dモデル（GLB）1つにつき、1つのtsxコンポーネントを維持する。

### 🚨 RULE 03: 責任の分離

* `Canvas` 要素の中に直接HTML要素を書かない。
* 3DとDOMの連携は、Propsバケツリレーではなく **Zustandストア** を経由させる。

### 🚨 RULE 04: 日本語解説の付与

* 生成コードには、設計意図（Why）を含む日本語コメントを詳細に記述すること。

---

## 5. AI EXECUTION GUIDELINES (AIへの命令)

1. **分析から開始:** ユーザーの依頼に対し、まず「どのファイルが影響を受け、どのルールが適用されるか」を箇条書きで回答せよ。
2. **リファクタリング優先:** 新機能を追加する前に、既存コードの冗長性を排除するリファクタリング案があれば提示せよ。
3. **整合性チェック:** コード生成後、上記の「開発憲法」に違反していないかセルフチェック結果を報告せよ。
