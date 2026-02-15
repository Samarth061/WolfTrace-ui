## Project Context: WolfTrace

**IMPORTANT: This is the PRIMARY UI codebase** with full backend integration (wolf-trace-backend). This is the source of truth for WolfTrace UI.

**What is WolfTrace?**
A noir, detective-themed tool that turns tips into cases and turns case evidence into a connected evidence trail—with a fun corkboard Case Wall as the home screen.

**Key Features:**
- Public tip intake (anonymous or named) → Reference ID (WT-####)
- Investigator access via hidden streetlamp puzzle
- Corkboard Case Wall: free-moveable pinned cases (home screen)
- Evidence Board: noir-styled sticky notes/polaroids with relationship connections
- Walkie-talkie "Leads" panel for radio chatter-style updates
- Witness Inbox: global tip browsing and assignment
- Forensics Lab: media analysis + RAG chat grounded in evidence ✅
- ~~Archive: casefile previews with story summaries~~ (REMOVED - deprecated)
- Alerts Desk: draft and publish campus alerts

**Workflow (End-to-End):**
1. **Public Landing** → Tip intake (text/image/video)
2. **Bureau Entry** → Streetlamp puzzle → Case Wall view
3. **New Witness Drops** → Drawer with fresh tips to assign
4. **Case View** → Evidence Board with connectable evidence nodes
5. **Walkie-talkie Panel** → Leads tracking (persistent in case view)
6. **Witness Inbox** → Browse, filter, attach tips to cases
7. **Forensics Lab** → Analyze media, RAG chat with evidence ✅
8. ~~**Archive** → Read-only closed cases with evidence trails~~ (REMOVED)
9. **Alerts Desk** → Draft/publish public alerts

---

## Implementation Status

### ✅ FULLY IMPLEMENTED (~60-70% of features)

**Landing Page:**
- Hero with streetlamp puzzle (double-click → bureau door)
- Tip submission form (text/image/video, location, category, anonymous)
- Reference code generation (WT-####)
- Bureau door modal with 3x3 pattern puzzle
- Badge ID + role selection (Detective/Admin)

**Bureau Core:**
- Protected routes (cookie-based auth)
- Sidebar navigation (role-based access)
- **Case Wall** (corkboard):
  - Drag-and-drop positioning
  - Pan/zoom (0.3x-2x)
  - Search + status filtering
  - Case-to-case connections (bezier strings)
  - Heat indicators
  - Case peek drawer
  - New Tips drawer

**Case Management:**
- Case creation (auto-generated IDs)
- Status management (5 statuses)
- **Case workspace** (triple view):
  - **Evidence Network**: Force-directed graph (Canvas)
    - Physics simulation
    - Interactive drag/pan/zoom
    - Authenticity styling (verified/suspicious/unknown - colors: #6aad6e, #c45c5c, #A17120)
    - Relation types (supports/contradicts/related)
  - **Story View**: Narrative timeline with evidence cards
  - **Forensics Lab** ✅: Media upload + forensic analysis
    - File upload (image/video/audio)
    - Forensic metrics (Authenticity, Deepfake Risk, Manipulation, Quality, ML Accuracy)
    - Predictions with confidence scores
    - Evidence Assistant chat sidebar (mock responses)
    - Key findings display

**Evidence:**
- Add evidence modal
- Evidence detail panel
- Mark as reviewed
- Connection data (UI partial)

**Pages:**
- Solved Wall (resolved cases grid)
- ~~Archive (searchable closed cases)~~ REMOVED
- Admin Dashboard (stats, role-restricted)
- Settings (profile, preferences)

**Data:**
- TypeScript types
- React Context state
- 10 mock cases + 27 evidence items
- Mock connections + tips

---

### 🟡 PARTIALLY IMPLEMENTED

- **Tips Management**: UI exists, handlers empty (no create/attach workflow)
- **Evidence Connections**: ✅ Manual creation UI now available via connect-evidence-modal
- **Settings**: Toggles work in-memory only (no persistence)
- **Video Analysis**: Transcripts mocked (no processing)
- **Backend Integration**: ✅ WebSocket real-time updates working, API client functional

---

### ❌ MISSING

**Major Features:**
1. ~~**Forensics Lab**~~ ✅ IMPLEMENTED (Feb 2026)
2. **Alerts Desk** - No alert creation/publishing UI (backend endpoints exist)
3. **Walkie-talkie Leads** - Not implemented
4. **Witness Inbox** - Only drawer exists (no full page/workflow)

**Infrastructure:**
5. ~~**Backend**~~ ✅ INTEGRATED (Feb 2026) - API working, WebSocket real-time updates, in-memory graph state
6. **Media Processing** - ✅ File upload working (`POST /api/upload`), transcription/analysis in progress
7. **AI/LLM** - ✅ Backend has Blackboard AI pipelines, RAG chat UI mocked in Forensics Lab
8. ~~**Real-time**~~ ✅ WORKING (Feb 2026) - WebSocket `/ws/caseboard` operational
9. **Email** - No confirmations, reference lookup
10. **Authentication** - Cookie-based auth in UI, no JWT backend yet

---

### 🔧 CONFLICTS: None
Current implementation aligns with plan. Missing features are gaps, not conflicts.

---

### 📋 PRIORITY ROADMAP

**Phase 1: Backend Foundation**
1. API routes + database (cases, evidence, tips, users)
2. Authentication (JWT/sessions)
3. File upload/storage (S3/Cloudinary)
4. CRUD endpoints

**Phase 2: Core Features**
5. Witness Inbox full page
6. Tip-to-case workflow
7. Evidence connection UI
8. Alerts Desk
9. Settings persistence

**Phase 3: AI/Media**
10. Media processing (metadata, thumbnails)
11. Transcription (Whisper)
12. Image analysis
13. Forensics Lab structure
14. RAG (vector DB + LLM chat)

**Phase 4: Real-time**
15. Walkie-talkie panel
16. WebSocket notifications
17. Email system
18. Collaboration

**Phase 5: Polish**
19. Audit logs
20. Export/reports
21. Mobile optimization
22. Performance tuning
23. Security hardening

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -> then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management
1. **Plan First**: Write plan to 'tasks/todo.md' with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review to 'tasks/todo.md'
6. **Capture Lessons**: Update 'tasks/lessons.md' after corrections

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
---

## UI Integration (February 2026)

### This is the PRIMARY UI codebase

**wolf-trace-ui-design** is now the **source of truth** for the WolfTrace UI with full backend integration.

### Recent UI Integration Changes

**✅ Completed (Feb 15, 2026):**
1. **Forensics Lab Component**: Imported complete Forensics Lab UI from WolfTrace-ui (510 lines)
   - File upload dropzone (image/video/audio)
   - Forensic analysis with scanning animation
   - Metrics display: Authenticity Score, Deepfake Risk, Manipulation Risk, Quality Score, ML Accuracy
   - Color-coded metrics: Green (>80%), Orange (50-80%), Red (<50%)
   - Predictions section with confidence bars
   - Key findings list
   - Evidence Assistant chat sidebar
   - Metadata display (file size, format, dimensions, duration)
   
2. **Forensics Lab Integration**: Fully integrated into Case Workspace as third tab
   - Added "Forensics Lab" tab to case workspace (alongside Evidence Network and Story View)
   - Accessible via Sparkles icon in tab bar
   - Connected to case ID for context-aware analysis

3. **Backend File Upload Endpoint**: Created `/api/upload` endpoint
   - File upload router: `wolf-trace-backend/app/routers/files.py`
   - Saves uploads to `/tmp/wolftrace-uploads/`
   - Returns file URL for evidence creation
   - Validates file types (image/video/audio only)

4. **Archive Section Removal**: Completely deprecated
   - Deleted `/app/bureau/archive/` directory
   - Removed Archive icon import from sidebar
   - Removed Archive navigation item
   - Updated navigation: Wall → Case → Solved → Admin → Settings

5. **Evidence Node Color Schema Verification**: ✅ Colors already matched
   - Verified identical color schema between implementations
   - Green: `#6aad6e` (verified/supports)
   - Red: `#c45c5c` (suspicious/contradicts)
   - Amber: `#A17120` (unknown/related)

6. **Type Definitions Added**:
   - `ForensicAnalysis` interface (lib/types.ts)
   - `ChatMessage` interface (lib/types.ts)
   - `generateMockForensicAnalysis()` function (lib/mock-data.ts)

### Component Sources

- **From wolf-trace-ui-design**: All backend integration, data mapping, WebSocket, API client
- **From WolfTrace-ui**: Forensics Lab UI component
- **Shared**: Case wall, workspace, evidence network (visual parity achieved)

### Backend Integration

**Environment Variables** (`.env.local`):
```bash
NEXT_PUBLIC_USE_BACKEND=true
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**API Client**: `lib/api-client.ts`
- ShadowBureauAPI class with full REST client
- ShadowBureauWebSocket class for real-time updates
- Type mappers for backend ↔ frontend data

**Backend Endpoints Used**:
- `POST /api/upload` - File upload (NEW)
- `POST /api/report` - Submit tips
- `GET /api/cases` - List cases
- `POST /api/cases/{id}/evidence` - Add evidence
- `POST /api/cases/{id}/edges` - Create connections
- `WS /ws/caseboard` - Real-time updates

### Critical Files Modified

**High Priority**:
1. `components/bureau/forensics-lab.tsx` - NEW FILE (transferred from WolfTrace-ui)
2. `components/bureau/case-workspace.tsx` - Added Forensics Lab tab
3. `components/bureau/sidebar.tsx` - Removed Archive navigation
4. `lib/types.ts` - Added ForensicAnalysis and ChatMessage types
5. `lib/mock-data.ts` - Added generateMockForensicAnalysis function

**Backend**:
6. `wolf-trace-backend/app/routers/files.py` - NEW FILE (file upload endpoint)
7. `wolf-trace-backend/app/main.py` - Registered files router

**Removed**:
8. `app/bureau/archive/` - DELETED (entire directory)

### Current Forensics Lab Implementation

**Status**: Mock data mode (ready for backend connection)
- File uploads work with browser FileReader API
- Forensic analysis uses `generateMockForensicAnalysis()` with randomized metrics
- Evidence Assistant chat uses keyword-based mock responses
- Backend integration prepared but using mock data for MVP

**Future Backend Integration** (Optional):
- Connect file upload to `POST /api/upload`
- Submit evidence with media_url to backend
- Poll/fetch forensic analysis from evidence node metadata
- Map backend forensics data (pHash, EXIF, ELA, TwelveLabs) to UI metrics
- Integrate Evidence Assistant chat with Backboard.io RAG

### Testing Notes

To test the Forensics Lab:
1. Start backend: `cd wolf-trace-backend && uv run uvicorn app.main:app --reload`
2. Start frontend: `cd wolf-trace-ui-design && npm run dev`
3. Navigate to any case → Click "Forensics Lab" tab
4. Upload an image/video/audio file
5. Click "Scan Forensics" to analyze (2.5s mock delay)
6. View metrics, predictions, findings
7. Chat with Evidence Assistant in sidebar

### Color Schema Reference

**Evidence Nodes**:
- Verified: `#6aad6e` (green) - fill: `#1a3a1a`, stroke: `#6aad6e`, glow: `rgba(106, 173, 110, 0.3)`
- Suspicious: `#c45c5c` (red) - fill: `#3a1a1a`, stroke: `#c45c5c`, glow: `rgba(196, 92, 92, 0.3)`
- Unknown: `#A17120` (amber) - fill: `#2a2010`, stroke: `#A17120`, glow: `rgba(161, 113, 32, 0.2)`

**Edge Colors**:
- Supports: `#6aad6e` (green)
- Contradicts: `#c45c5c` (red)
- Related: `#A17120` (amber)

**Forensics Metrics**:
- High (>80%): `text-[#6aad6e]` (green)
- Medium (50-80%): `text-[#A17120]` (amber)
- Low (<50%): `text-[#c45c5c]` (red)

---

## Recent Changes Summary (Feb 2026)

### ✅ PHASE 1-7 IMPLEMENTATION (Complete - Feb 15, 2026)

**All 10 requested features successfully implemented across 7 phases:**

#### Phase 1: Forensic Analysis Integration (CRITICAL) ✅
1. **Real Forensic APIs** - Replaced all mock analysis with production AI:
   - **Backboard Vision** for image forensics (authenticity, manipulation detection)
   - **TwelveLabs Marengo 2.6** for video deepfake detection
   - Context-aware analysis with evidence metadata (claims, entities, locations)
   - Graceful degradation with fallback scores when APIs unavailable

2. **Backend Endpoints Added**:
   - `POST /api/cases/{case_id}/evidence/{evidence_id}/forensics` - Trigger forensic analysis
   - `GET /api/cases/{case_id}/evidence/{evidence_id}/forensics` - Get forensic results
   - `POST /api/cases/{case_id}/chat` - Evidence chat with AI

3. **Frontend Integration**:
   - Connected Forensics Lab to real APIs (`forensics-lab.tsx`)
   - Real-time forensic scoring with ML accuracy metrics
   - Evidence chat with AI using Backboard Claim Analyst

4. **Enhanced Forensics Pipeline**:
   - AI scoring integrated into media processing pipeline (`pipelines/forensics.py`)
   - Combined traditional forensics (pHash, EXIF, ELA) with AI analysis
   - Both image and video processing enhanced

#### Phase 2: Evidence Structure Fixes ✅
5. **Text-Only Add Evidence** (`add-evidence-modal.tsx`):
   - Removed media upload from Add Evidence modal
   - Now accepts only text input (title, key points, entities, locations)
   - Media upload exclusively through Forensics Lab

6. **Delete Node Functionality**:
   - Backend: Cascade deletion of edges when deleting nodes (`graph_state.py`)
   - Backend: `DELETE /api/cases/{case_id}/evidence/{evidence_id}` endpoint
   - Frontend: Delete button in evidence detail panel (`evidence-detail.tsx`)
   - Frontend: Confirmation dialog showing connection count
   - WebSocket broadcasting of deletions
   - Store action: `deleteEvidence()` in `wolftrace-provider.tsx`

#### Phase 3: Confidence & Review System ✅
7. **Reviewed = 100% Confidence**:
   - Backend: `PATCH /api/cases/{case_id}/evidence/{evidence_id}` sets confidence=1.0 when reviewed
   - Frontend: Provider updates confidence on review (`wolftrace-provider.tsx`)
   - Type system: Added `confidence?: number` to Evidence interface

8. **Confidence Display** (`evidence-detail.tsx`):
   - Visual confidence score with percentage display (0-100%)
   - Progress bar showing confidence level
   - Badge showing "Verified" for reviewed evidence
   - Distinguishes "Officer verified" (100%) vs "AI-generated score"

#### Phase 4: Better Node Representation ✅
9. **Dynamic Node Labels** (`evidence-network.tsx`):
   - Changed from generic "T" to first letter of evidence title
   - Example: "F" for "Fire report", "S" for "Suspicious activity"
   - `getNodeLabel()` function extracts first letter dynamically

#### Phase 5: Enhanced Inference System ✅
10. **Backend Inference Enhancement** (`cases.py`):
    - Added summary statistics: total connections, avg confidence, strongest connection
    - Connection types breakdown (supports/contradicts/related counts)
    - Enhanced reasoning with explicit temporal/geo/semantic scores
    - Human-readable reasoning: "Events occurred within minutes (temporal: 85%), same location (geo: 92%)"

11. **Frontend Inference Display** (`evidence-detail.tsx`):
    - **Summary Card** showing connection statistics at a glance
    - Total connections and average confidence displayed prominently
    - Connection types breakdown with counts
    - Individual inferences with detailed component scores (temporal/geo/semantic)

#### Phase 6: Story Generation ✅
12. **Backend Story Endpoint** (`cases.py`):
    - `GET /api/cases/{case_id}/story` - Generate AI narrative
    - Timeline-based narrative using AI synthesis
    - Identifies key moments based on connection patterns
    - Sections: Origin, Progression, Current Status
    - Uses Backboard Case Synthesizer for coherent narratives

13. **Frontend Story View** (`story-panel.tsx`):
    - Fetches and displays AI-generated case narratives
    - Key moments section with star icons
    - Loading state while narrative generates
    - Seamless integration with evidence timeline

#### Phase 7: New Case Modal ✅
14. **Verified Existing Implementation**:
    - `CreateCaseModal` already integrated with Case Wall
    - "Pin New Case" button functional
    - Backend `POST /api/cases` endpoint working
    - Full integration verified (no changes needed)

### 🔧 Files Modified (15+ files)

**Backend:**
- `app/routers/cases.py` - 6 new endpoints (forensics, chat, delete, story, inference enhancement)
- `app/services/backboard_client.py` - Image forensic analysis (`analyze_image_forensics`)
- `app/services/twelvelabs.py` - Deepfake detection (`detect_deepfake`, `wait_for_indexing`)
- `app/pipelines/forensics.py` - AI scoring integration for images and videos
- `app/graph_state.py` - Delete with cascade (`delete_node`)

**Frontend:**
- `components/bureau/forensics-lab.tsx` - Real API integration (replaced mocks)
- `components/bureau/evidence-detail.tsx` - Delete UI, confidence display, inference summary
- `components/bureau/evidence-network.tsx` - Dynamic node labels
- `components/bureau/story-panel.tsx` - Narrative display
- `components/bureau/add-evidence-modal.tsx` - Text-only input
- `components/wolftrace-provider.tsx` - Delete action, confidence updates
- `lib/api-client.ts` - New API methods (forensics, chat, delete)
- `lib/types.ts` - Added confidence field to Evidence
- `lib/store.ts` - Added deleteEvidence action

### 📊 Feature Status

**✅ FULLY WORKING:**
- Real AI forensic analysis (Backboard + TwelveLabs)
- Evidence deletion with cascade
- Confidence scoring (reviewed = 100%)
- Dynamic node labels (first letter of title)
- Enhanced inference with summary cards
- Story generation with AI narratives
- Text-only evidence addition
- All WebSocket real-time updates

**❌ Still TODO:**
- Alerts Desk UI (backend ready)
- Witness Inbox full page
- Walkie-talkie Leads panel
- JWT authentication
- Settings persistence

### 🎯 Handoff Notes for Cursor

**Testing the Implementation:**
1. Start backend: `cd wolf-trace-backend && uv run uvicorn app.main:app --reload`
2. Start frontend: `cd WolfTrace-ui && pnpm dev`
3. Seed data: `curl -X POST http://localhost:8000/api/seed`
4. Access at: http://localhost:3000

**Key Implementation Patterns:**
- All AI services gracefully degrade (fallback scores when APIs unavailable)
- WebSocket broadcasts for all mutations (real-time updates)
- Context-aware AI prompts (evidence metadata passed to all AI calls)
- Comprehensive error handling with user-friendly messages

**API Keys Required** (`.env` in backend):
```bash
BACKBOARD_API_KEY=<your-key>          # For image forensics
TWELVELABS_API_KEY=<your-key>         # For video analysis
TWELVELABS_INDEX_ID=<your-index-id>   # Create index first
GEMINI_API_KEY=<your-key>             # Fallback AI
```

### ✅ Major Additions (Previous Work)

1. **Backend Integration Complete**
   - API client (`lib/api-client.ts`) with full REST and WebSocket support
   - Real-time updates via `/ws/caseboard` working
   - Environment flag: `NEXT_PUBLIC_USE_BACKEND=true`
   - API base URL: `NEXT_PUBLIC_API_URL=http://localhost:8000`

2. **Forensics Lab Fully Implemented**
   - File upload (image/video/audio)
   - Real forensic analysis with Backboard + TwelveLabs
   - Evidence Assistant chat sidebar
   - Integrated as 3rd tab in Case Workspace
   - File: `components/bureau/forensics-lab.tsx` (510 lines)

3. **Connect Evidence Modal**
   - Manual evidence connection creation UI
   - Relationship type selector (supports/contradicts/related)
   - Note field for context
   - File: `components/bureau/connect-evidence-modal.tsx` (187 lines)

4. **Archive Section Removed**
   - Deprecated per user requirements
   - `app/bureau/archive/` directory deleted
   - Navigation updated (5 items instead of 6)

5. **Robust Evidence Mapping**
   - 9 helper functions for data extraction
   - 7-level priority fallback for evidence titles
   - Development logging for missing backend fields
   - No more random IDs showing in Story Mode

### 🔧 Key Files Modified

**New Files:**
- `components/bureau/forensics-lab.tsx` - Forensics Lab component
- `components/bureau/connect-evidence-modal.tsx` - Evidence connection UI
- `INTEGRATION_CHANGELOG.md` - Comprehensive integration documentation

**Modified Files:**
- `components/bureau/case-workspace.tsx` - Added Forensics Lab tab
- `components/bureau/sidebar.tsx` - Removed Archive navigation
- `components/bureau/evidence-detail.tsx` - Enhanced with connection UI
- `lib/api-client.ts` - Fixed WebSocket URL, improved error handling, added 9 mapping helpers
- `lib/types.ts` - Added ForensicAnalysis, ChatMessage types
- `lib/mock-data.ts` - Added generateMockForensicAnalysis(), case-011 "Phantom Fire"
- `components/wolftrace-provider.tsx` - Fixed WebSocket connection, added backend data loading

**Deleted Files:**
- `app/bureau/archive/page.tsx` - Archive deprecated

### 📊 Integration Status

**Working:**
- ✅ WebSocket real-time updates
- ✅ Case listing from backend
- ✅ Evidence graph loading
- ✅ Tip submission
- ✅ File uploads
- ✅ Case creation
- ✅ Evidence addition
- ✅ Manual edge creation

**Pending:**
- ❌ Alerts Desk UI (backend endpoints ready)
- ❌ Witness Inbox full page
- ❌ Walkie-talkie Leads panel
- ❌ JWT authentication
- ❌ Settings persistence

### 🧪 Testing

**Start Backend:**
```bash
cd /home/harsha/Documents/temp/hackathon/wolf-trace-backend
uv run uvicorn app.main:app --reload
```

**Start Frontend:**
```bash
cd /home/harsha/Documents/temp/hackathon/WolfTrace-ui
pnpm dev
```

**Seed Mock Data:**
```bash
curl -X POST http://localhost:8000/api/seed
# Seeds 11 cases, 30 evidence nodes, 19 connections, 4 tips
```

**View in Browser:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/cases
- Health check: http://localhost:8000/health

---

## Development Notes

### Backend Connection
- Set `NEXT_PUBLIC_USE_BACKEND=true` in `.env.local` to use live backend
- Set `NEXT_PUBLIC_USE_BACKEND=false` to use mock data
- Restart dev server after changing environment variables

### Mock Data vs Backend
- Mock data: 11 cases with full evidence graphs pre-defined
- Backend data: Real AI inference, automatic edge creation via Blackboard pipelines
- Backend creates cases dynamically from tip submissions

### WebSocket Behavior
- Automatically connects on component mount when backend enabled
- Receives initial snapshots of all cases
- Real-time updates for: `add_node`, `add_edge`, `update_node`
- Auto-reconnect with exponential backoff (max 5 attempts)

### Known Issues
- Backend uses in-memory storage (data lost on restart)
- Frontend env variables require dev server restart to reload
- Location format: frontend sends `{building: string}`, backend expects `{building, lat?, lng?}`

For detailed integration history, see [INTEGRATION_CHANGELOG.md](INTEGRATION_CHANGELOG.md)
