## Project Context: WolfTrace

**What is WolfTrace?**
A noir, detective-themed tool that turns tips into cases and turns case evidence into a connected evidence trail—with a fun corkboard Case Wall as the home screen.

**Key Features:**
- Public tip intake (anonymous or named) → Reference ID (WT-####)
- Investigator access via hidden streetlamp puzzle
- Corkboard Case Wall: free-moveable pinned cases (home screen)
- Evidence Board: noir-styled sticky notes/polaroids with relationship connections
- Walkie-talkie "Leads" panel for radio chatter-style updates
- Witness Inbox: global tip browsing and assignment
- Forensics Lab: media analysis + RAG chat grounded in evidence
- Archive: casefile previews with story summaries
- Alerts Desk: draft and publish campus alerts

**Workflow (End-to-End):**
1. **Public Landing** → Tip intake (text/image/video)
2. **Bureau Entry** → Streetlamp puzzle → Case Wall view
3. **New Witness Drops** → Drawer with fresh tips to assign
4. **Case View** → Evidence Board with connectable evidence nodes
5. **Walkie-talkie Panel** → Leads tracking (persistent in case view)
6. **Witness Inbox** → Browse, filter, attach tips to cases
7. **Forensics Lab** → Analyze media, RAG chat with evidence
8. **Archive** → Read-only closed cases with evidence trails
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
- **Case workspace** (dual view):
  - **Evidence Network**: Force-directed graph (Canvas)
    - Physics simulation
    - Interactive drag/pan/zoom
    - Authenticity styling (verified/suspicious/unknown)
    - Relation types (supports/contradicts/related)
  - **Story View**: Narrative timeline with evidence cards

**Evidence:**
- Add evidence modal
- Evidence detail panel
- Mark as reviewed
- Connection data (UI partial)

**Pages:**
- Solved Wall (resolved cases grid)
- Archive (searchable closed cases)
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
- **Evidence Connections**: Data exists, no creation UI
- **Settings**: Toggles work in-memory only (no persistence)
- **Video Analysis**: Transcripts mocked (no processing)

---

### ❌ MISSING

**Major Features:**
1. **Forensics Lab** - No AI/RAG, no media analysis, no chat
2. **Alerts Desk** - No alert creation/publishing
3. **Walkie-talkie Leads** - Not implemented
4. **Witness Inbox** - Only drawer exists (no full page/workflow)

**Infrastructure:**
5. **Backend** - No API, database, auth backend
6. **Media Processing** - No upload, metadata, transcription
7. **AI/LLM** - No RAG chat, no suggestions
8. **Real-time** - No WebSocket, notifications
9. **Email** - No confirmations, reference lookup

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