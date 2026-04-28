# 🎨 SketchHive - Real-Time Collaborative Whiteboard

![SketchHive Banner](https://raw.githubusercontent.com/aliasgarjhalodwala/SketchHive/main/public/logo.svg) <!-- Assuming a logo exists based on common project structures, if not I'll adjust or just use text -->

SketchHive is a high-performance, real-time collaborative whiteboard application designed to empower teams to brainstorm, design, and visualize ideas together, no matter where they are.

---

## 🚀 Overview

SketchHive transforms the traditional brainstorming process into a dynamic, digital experience. Built with a focus on speed, reliability, and intuitive UX, it provides a seamless canvas for creative teams to collaborate in real-time.

### 🔴 The Problem
In a world of remote work, teams often lose the "magic" of a physical whiteboard. Existing digital solutions are either too complex, lack true real-time synchronization, or don't offer a clean way to organize collaborative assets within professional organizations.

### ✅ The Solution
SketchHive offers a "zero-friction" collaborative environment. It combines the simplicity of a physical whiteboard with the power of modern cloud technology.
- **Instant Collaboration**: See what your team is doing exactly as they do it.
- **Organized Creativity**: Manage boards by organization, ensuring the right people have access to the right ideas.
- **Natural Interaction**: Smooth drawing tools that feel like pen on paper.

---

## 🛠️ Tech Stack

SketchHive is built using the most modern and robust tools in the web development ecosystem:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Backend & Database**: [Convex](https://www.convex.dev/) (Reactive, real-time backend)
- **Authentication**: [Clerk](https://clerk.com/) (Secure, organization-ready auth)
- **Real-time Engine**: [Liveblocks](https://liveblocks.io/) (Presence, cursors, and state sync)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Drawing Logic**: [Perfect Freehand](https://github.com/steveruizok/perfect-freehand) for smooth, pressure-sensitive sketching.

---

## ✨ Features That Matter

- **Real-time Presence**: Interactive cursors and live participant avatars.
- **Advanced Canvas**: Support for freehand drawing, geometric shapes, text blocks, and sticky notes.
- **Multi-layered Organization**: Create and manage multiple boards within specific organizational contexts.
- **Favorites & Search**: Quick-access system for high-priority boards and powerful title-based search.
- **Image Exports**: Export your creative sessions into high-quality images.
- **Responsive Workspace**: Optimized for both desktop precision and tablet flexibility.
- **Optimistic Updates**: Zero-latency UI feel even on slower connections.

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- NPM / PNPM / Bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aliasgarjhalodwala/SketchHive.git
   cd SketchHive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   CONVEX_DEPLOYMENT_URL=
   NEXT_PUBLIC_CONVEX_URL=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   LIVEBLOCKS_SECRET_KEY=
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Start Convex**
   In a separate terminal, run:
   ```bash
   npx convex dev
   ```

---

## 🏗️ Project Structure

- `/app`: Next.js App Router routes and page layouts.
- `/components`: Reusable UI components (buttons, dialogs, etc.).
- `/convex`: Backend schema, mutations, and queries.
- `/hooks`: Custom React hooks for canvas logic and auth.
- `/lib`: Utility functions and configuration.
- `/store`: Zustand store for local state management.

---

## 🛡️ License
This project is licensed under the MIT License.

---

Built with ❤️ by [Aliasgar Jhalodwala](https://github.com/aliasgarjhalodwala)
