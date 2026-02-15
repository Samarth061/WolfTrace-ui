# Wolf Trace UI - Bureau Interface

**Next.js 15 frontend for WolfTrace campus intelligence platform**

Noir-themed investigative interface built for Hack NCState 2026 (Siren's Call track).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Backend API running at http://localhost:8000

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

**Frontend runs on:** http://localhost:3000

---

## 🏗️ Project Structure

```
wolf-trace-ui-design/
├── app/
│   ├── bureau/              # Main application routes
│   │   ├── wall/            # Case wall (visual board)
│   │   │   └── page.tsx     # Kanban-style case overview
│   │   │
│   │   ├── caseboard/       # Knowledge graph
│   │   │   ├── [id]/        # Dynamic case route
│   │   │   └── page.tsx     # Graph visualization (React Flow)
│   │   │
│   │   ├── tips/            # Anonymous tips inbox
│   │   │   └── page.tsx     # Tip triage interface
│   │   │
│   │   ├── settings/        # Configuration
│   │   │   └── page.tsx     # LLM provider toggle
│   │   │
│   │   └── layout.tsx       # Bureau layout (sidebar nav)
│   │
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Tailwind CSS
│
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── case-card.tsx        # Case preview card
│   ├── evidence-panel.tsx   # Evidence details
│   ├── forensics-panel.tsx  # Forensic analysis display
│   └── graph-node.tsx       # Custom React Flow node
│
├── lib/
│   ├── api-client.ts        # Backend API client
│   ├── store.ts             # Zustand global state
│   └── utils.ts             # Helper functions
│
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
├── next.config.ts           # Next.js configuration
└── package.json             # Dependencies
```

---

## 🎨 UI Components

### Core Pages

#### 1. Wall (`/bureau/wall`)
**Kanban-style case overview**
- Active cases displayed as cards
- Status indicators (investigating, verified, debunked)
- Quick actions (open caseboard, draft alert)

#### 2. Caseboard (`/bureau/caseboard/[id]`)
**Interactive knowledge graph visualization**
- React Flow force-directed graph
- Node types: Reports, Evidence, FactChecks, MediaVariants
- Edge types: SIMILAR_TO, REPOST_OF, MUTATION_OF, DEBUNKED_BY
- Real-time WebSocket updates
- Red String mode (manual edge creation)

#### 3. Tips (`/bureau/tips`)
**Anonymous tip inbox**
- List of submitted tips
- Priority sorting
- Quick triage actions
- Evidence preview

#### 4. Settings (`/bureau/settings`)
**LLM provider configuration**
- GROQ API toggle (enabled by default)
- Profile information (Badge ID, Role)
- Preferences (notifications, heat indicators)

---

## 🔌 API Integration

### API Client (`lib/api-client.ts`)

```typescript
import { apiClient } from '@/lib/api-client'

// Get all cases
const cases = await apiClient.getCases()

// Create case
const newCase = await apiClient.createCase({
  title: 'Suspicious Activity',
  description: 'Report of...'
})

// Upload evidence (automatically includes LLM provider header)
const evidence = await apiClient.addEvidence(caseId, {
  media_url: fileUrl,
  text_body: 'Description',
  location: { building: 'Hunt Library' }
})

// Trigger forensics
await apiClient.analyzeForensics(caseId, evidenceId)

// Create edge (Red String)
await apiClient.createEdge(caseId, {
  source_id: nodeId1,
  target_id: nodeId2,
  edge_type: 'RELATED'
})
```

### LLM Provider Header

The API client automatically adds the `X-LLM-Provider` header based on localStorage:

```typescript
private getLLMProviderHeader(): Record<string, string> {
  const useGroq = localStorage.getItem('wolftrace_use_groq') === 'true'
  return { 'X-LLM-Provider': useGroq ? 'groq' : 'default' }
}
```

**Default:** GROQ is enabled by default (no user action needed).

---

## 🌐 WebSocket Integration

### Caseboard Real-time Updates

```typescript
// Connect to caseboard WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/caseboard')

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)

  // Handle different update types
  switch (update.type) {
    case 'add_node':
      // Add node to graph
      break
    case 'update_node':
      // Update existing node
      break
    case 'add_edge':
      // Add edge to graph
      break
  }
}
```

**Features:**
- Auto-reconnect on disconnect
- Optimistic UI updates
- Conflict resolution

---

## 🎨 Styling & Theme

### Tailwind CSS

**Color Palette:**
- **Background:** `#0d0804` (dark noir)
- **Accent:** `#A17120` (gold/amber)
- **Text:** `#e5dcc9` (cream)
- **Muted:** `#6b5e4f` (brown-gray)

### Custom Components (shadcn/ui)

```bash
# Add new shadcn component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

**Installed Components:**
- Button, Card, Dialog, Input, Select
- Dropdown Menu, Tooltip, Badge
- Separator, Scroll Area, Tabs

---

## 🔧 Configuration

### Environment Variables (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Next.js Config (`next.config.ts`)

```typescript
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: true,
  }
}
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Test Structure

```
__tests__/
├── components/
│   ├── case-card.test.tsx
│   └── evidence-panel.test.tsx
├── pages/
│   ├── wall.test.tsx
│   └── caseboard.test.tsx
└── lib/
    └── api-client.test.ts
```

---

## 📦 Dependencies

### Core
- **Next.js 15** - React framework (App Router, React 19)
- **React 19** - UI library
- **TypeScript** - Type safety

### State Management
- **Zustand** - Lightweight state management

### UI Components
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library (Radix UI primitives)
- **Lucide React** - Icon library

### Graph Visualization
- **React Flow** - Interactive graph rendering
- **D3** - Force-directed layout calculations

### Utilities
- **clsx** - Conditional className utility
- **tailwind-merge** - Tailwind class merging

**Full dependency list:** See `package.json`

---

## 🚀 Build & Deploy

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

**Development:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production:**
```bash
NEXT_PUBLIC_API_URL=https://api.wolftrace.io
```

### Deploy

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🎯 Key Features

### 1. Real-time Graph Updates
- WebSocket connection to backend
- Optimistic UI updates
- Conflict-free replicated data types (CRDT-inspired)

### 2. Red String Mode
- Manual evidence linking
- Drag-and-drop edge creation
- Contextual edge types (SIMILAR_TO, RELATED, DEBUNKED_BY)

### 3. Forensics Visualization
- ML accuracy scores
- Manipulation indicators
- Authenticity timeline

### 4. LLM Provider Selection
- GROQ (default, fast, no quota)
- Backboard (fallback)
- Settings page toggle
- localStorage persistence

---

## 🐛 Debugging

### Common Issues

**1. API Connection Failed**
```
Error: Failed to fetch
```
**Fix:** Ensure backend is running at `http://localhost:8000`

**2. WebSocket Not Connecting**
```
WebSocket connection to 'ws://localhost:8000/ws/caseboard' failed
```
**Fix:** Check CORS settings in backend `.env`

**3. React Flow Layout Issues**
```
Graph not rendering correctly
```
**Fix:** Ensure `react-flow-renderer` styles are imported:
```typescript
import 'reactflow/dist/style.css'
```

**4. localStorage Not Available (SSR)**
```
ReferenceError: localStorage is not defined
```
**Fix:** Use `useEffect` to access localStorage:
```typescript
useEffect(() => {
  const value = localStorage.getItem('key')
}, [])
```

---

## 🔐 Security

- **API Keys:** Never expose in client-side code
- **CORS:** Backend enforces allowed origins
- **WebSocket:** Secure connection (`wss://`) in production
- **File Uploads:** Validated on backend

---

## 📈 Performance

- **Bundle Size:** Optimized with Next.js tree-shaking
- **Code Splitting:** Route-based automatic splitting
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** React.lazy for heavy components

---

## 🔧 Development

### Code Style

```bash
# Format code
npm run lint

# Fix lint issues
npm run lint -- --fix
```

### Adding New Page

1. Create file in `app/bureau/`
2. Update navigation in `app/bureau/layout.tsx`
3. Add route to sidebar

### Adding New Component

1. Create in `components/`
2. Export from `components/index.ts`
3. Use in pages

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Support

For issues or questions:
1. Check backend API status: http://localhost:8000/docs
2. Review [API Client Guide](lib/api-client.ts)
3. Open an issue on GitHub

---

**Version:** 1.0.0
**Last Updated:** February 2026
**Built for:** Hack NCState 2026 (Siren's Call track)
