# README.md

This project was created using `Arkain Snap`.

## Environment and Technology Stack

| Component       | Version / Details                      |
|-----------------|-------------------------------------|
| Operating System| Ubuntu 22.04                        |
| Node.js         | 20.18.3                            |
| npm             | 10.8.2                             |
| Framework       | Next.js 14 with App Router          |
| Language        | TypeScript                         |
| Styling         | Tailwind CSS                       |
| UI Components   | shadcn/ui                         |
| Chat SDK        | AI SDK                            |
| Features        | Server-Sent Events (SSE) for real-time streaming chat, automatic session management, responsive desktop-first layout |

## How the Project Was Created

- Initialized a Next.js 14 project with TypeScript and Tailwind CSS support.
- Configured Tailwind CSS and integrated shadcn/ui components.
- Developed global styles and layout components including header, sidebar, and footer.
- Built chat UI components such as message list, input, session header, and chat container.
- Implemented backend API routes for chat streaming and session management.
- Created utility functions and custom hooks for session handling and API communication.
- Installed all necessary dependencies including Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, and AI SDK.
- Started the development server configured for container accessibility.

## How to Run the Project

1. Install dependencies:

   bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:3000`.

### Potential Errors and Solutions

- **Port 3000 already in use:**  
  If you encounter an error that port 3000 is occupied, either stop the conflicting service or change the port by running:  
  ```bash
  PORT=your_desired_port npm run dev
  ```

- **Node.js or npm version mismatch:**  
  Ensure you are using Node.js v20.18.3 and npm v10.8.2 as specified. Use `nvm` or similar tools to manage versions.

- **Tailwind CSS not applying styles:**  
  Verify that `tailwind.config.ts` and `postcss.config.js` are correctly configured and that global styles are imported in `app/globals.css`.

- **API routes not responding:**  
  Confirm the backend API routes (`app/api/chat/route.ts` and `app/api/sessions/route.ts`) are correctly implemented and the server is running without errors.

---

**From the top menu, navigate to 'Container -> Execution URL and Port -> Registered URL and Port -> Click the shortcut button on the selected row.'**

(Translated to English as the project environment is English-based.)

## Directory Structure

```
.
├── app
│   ├── api
│   │   ├── chat
│   │   │   └── route.ts
│   │   └── sessions
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── chat
│   │   ├── ChatContainer.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MessageList.tsx
│   │   └── SessionHeader.tsx
│   ├── layout
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── scroll-area.tsx
│       └── skeleton.tsx
├── hooks
│   └── useSession.ts
├── lib
│   ├── api.ts
│   └── utils.ts
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```