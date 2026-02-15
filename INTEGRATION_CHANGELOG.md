# Frontend Integration Changelog

## Overview
This document tracks changes made to integrate the WolfTrace frontend with the Shadow Bureau backend.

---

## Recent Changes (2026-02-14)

### 🔧 Fixed Evidence Title Display Issue

**Problem:** Evidence titles in Story Mode were displaying random IDs (e.g., "E-B9B7B9DF5FFF") instead of meaningful content.

**Root Cause:** The `mapBackendEvidence()` function in `lib/api-client.ts` was falling back to displaying the node ID when the `data.text_body` field was missing or empty from backend nodes.

**Files Modified:**
- `lib/api-client.ts` - Comprehensive update to evidence mapping logic

**Changes Made:**

1. **Added 9 Helper Functions for Robust Data Extraction:**
   - `extractEvidenceTitle()` - Priority-based title extraction with 7 fallback levels
   - `truncateText()` - Smart text truncation at word boundaries
   - `generateFallbackTitle()` - Type-aware fallback titles (e.g., "Witness Report - 10:30 AM")
   - `extractEntities()` - Robust entity extraction from multiple backend field formats
   - `extractLocations()` - Location extraction with building/string fallbacks
   - `extractKeyPoints()` - Key points extraction from various field formats
   - `extractAuthenticitySignals()` - Forensics and fact-check signal extraction
   - `logMappingIssue()` - Development-only logging for missing content fields
   - `isValidBackendNode()` - Type guard for node validation

2. **Updated `mapBackendEvidence()` Function:**
   - Now uses `extractEvidenceTitle()` instead of simple fallback to ID
   - Checks 7 priority levels for content: `title` → `text_body` → `content` → `claims[]` → `key_points[]` → `media_url` filename → type-based fallback
   - Logs development warnings when critical content fields are missing
   - Uses specialized extraction helpers for all evidence fields

3. **Added Type Safety:**
   - Added `.filter(isValidBackendNode)` to `getCase()` method
   - Prevents invalid nodes from breaking the mapping pipeline

**Title Extraction Priority Order:**
```
Priority 1: data.title (explicit title field)
Priority 2: data.text_body (primary content)
Priority 3: data.content (alternative field)
Priority 4: First claim in data.claims[] array
Priority 5: First key point in data.key_points[]
Priority 6: Filename from data.media_url
Priority 7: Type-based fallback ("Witness Report - 10:30 AM")
```

**Before:**
```typescript
title: data.text_body?.substring(0, 50) || backendNode.id
// Result when text_body missing: "E-B9B7B9DF5FFF"
```

**After:**
```typescript
title: extractEvidenceTitle(backendNode)
// Result: "Witness Report - 10:30 AM" or actual content from any available field
```

**Benefits:**
- ✅ Evidence always displays with human-readable titles
- ✅ Gracefully handles various backend data formats
- ✅ Maintains backward compatibility with mock data
- ✅ Development logging helps identify backend data issues
- ✅ No more random IDs appearing in Story Mode
- ✅ Better user experience with meaningful evidence titles

**Testing:**
```bash
cd /home/harsha/Documents/temp/hackathon/WolfTrace-ui
npm run dev
# Check Story Mode - evidence should show meaningful titles
# Open DevTools console - look for [API Mapping WARN] messages in development
```

---

## Recent Changes (2026-02-15)

### 🔥 Added Fire Misinformation Scenario (case-011)

**Purpose:** Demonstrate WolfTrace's core capability to detect coordinated misinformation through evidence graph analysis and inference patterns.

**What Was Added:**

**Files Modified:**
- `lib/mock-data.ts` - Added case-011 with 3 interconnected evidence items
- `.env.local` - Switched to mock data mode (`NEXT_PUBLIC_USE_BACKEND=false`)

**New Case: case-011 "The Phantom Fire"**
- **Status:** Debunked
- **Location:** Science Building - East Wing
- **Evidence Count:** 3
- **Story:** Student reports fire → Official confirms false alarm → Fake image circulates → System detects coordinated misinformation

**Evidence Items:**

1. **ev-028: Social Media Post - Fire Sighting** (SUSPICIOUS)
   - Student account `@campus_watcher_23` claims to see fire
   - Posted at 10:15 PM on Feb 13
   - Red flags:
     - Account created 2 days before post
     - No corroborating witnesses
     - Posted before any alarm activated
     - Geolocation metadata missing

2. **ev-029: Campus Safety Incident Report #2847** (VERIFIED)
   - Official response confirming false alarm
   - Officer Martinez badge #4219
   - Timeline: Responded 10:18 PM, all-clear 10:22 PM
   - Building sensors confirm no fire event
   - Multiple verification signals (badge, sensors, dispatch log)

3. **ev-030: Alleged Fire Photo from Science Building** (SUSPICIOUS)
   - Fabricated image posted at 10:25 PM (AFTER official all-clear)
   - Forensic analysis reveals:
     - Reverse image match: 2019 Ohio warehouse fire
     - EXIF data intentionally stripped
     - Digital cloning detected around building signage
     - Lighting inconsistencies with Feb 13 weather
   - Posted anonymously from burner account

**Evidence Connections (Inference Pattern):**
```typescript
// Triangle pattern reveals coordinated misinformation
{ fromId: 'ev-029', toId: 'ev-028', relation: 'contradicts' } // Official contradicts student
{ fromId: 'ev-030', toId: 'ev-028', relation: 'supports' }     // Fake image supports false claim
{ fromId: 'ev-029', toId: 'ev-030', relation: 'contradicts' } // Official contradicts fake image
```

**Inference Logic:**
```
Official Report (VERIFIED) contradicts Student Post (SUSPICIOUS)
                  +
Fake Image (SUSPICIOUS) supports Student Post
                  +
Timeline shows coordination (image posted AFTER denial)
                  =
CONCLUSION: Coordinated misinformation campaign
```

**Visual Pattern in Evidence Network:**
```
        ev-028 (Student)
       ↗ supports   ↖ contradicts
ev-030 (Fake)      ev-029 (Official)
       ↖ contradicts ↙
```

Verified source contradicts both suspicious sources = Fabrication detected

**How to View:**
1. Ensure `NEXT_PUBLIC_USE_BACKEND=false` in `.env.local`
2. Restart dev server if needed (`npm run dev`)
3. Navigate to Bureau Wall at http://localhost:3000
4. Find "The Phantom Fire" case (Debunked status)
5. Click to view Evidence Network showing:
   - Green verified badge on official report
   - Yellow suspicious badges on student post and fake image
   - Red contradiction lines from official to both suspicious sources
   - Blue support line between the two suspicious sources

**Testing:**
```bash
cd /home/harsha/Documents/temp/hackathon/WolfTrace-ui
npm run dev
# Visit http://localhost:3000, login, check Bureau Wall for case-011
```

**Value Demonstration:**
- Shows how WolfTrace identifies disinformation patterns
- Demonstrates authenticity signal analysis
- Illustrates timeline-based coordination detection
- Example of "fake supporting evidence after official denial" tactic

---

## Backend AI Inference Implementation (2026-02-15)

### ✅ Switched from Mock Data to Backend AI Inference

**Goal:** Demonstrate real AI-powered inference using Blackboard Architecture instead of static mock connections.

**Changes Made:**

1. **Environment Configuration:**
   - Switched `.env.local` to `NEXT_PUBLIC_USE_BACKEND=true`
   - Enabled WebSocket connection to backend at ws://localhost:8000/ws/caseboard
   - Frontend now loads cases dynamically via backend API

2. **Backend API Integration:**
   - POSTed fire scenario evidence via `/api/report` endpoint
   - Created 3 evidence items:
     - Student fire report (RPT-69ACB1E920BF → CASE-Cold-Code-1335)
     - Official false alarm (RPT-D4D879BC5E04 → CASE-Iron-Asset-6425)
     - Fabricated fire image (fake-fire-image → CASE-Cold-Code-1335)

3. **Automatic Inference Results:**
   - Backend created 9 total nodes in CASE-Cold-Code-1335 (3 main evidence + 6 EXTERNAL_SOURCE nodes)
   - Backend created 8 edges (6 automatic SIMILAR_TO edges + 2 manual cross-case edges)
   - **CLUSTERING pipeline** automatically detected temporal/geo/semantic similarities
   - **NETWORK pipeline** extracted claims and created fact-check nodes
   - **FORENSICS pipeline** analyzed image metadata
   - Real-time WebSocket updates broadcasted graph changes to frontend

4. **Shell Script Created:**
   - `setup-fire-scenario.sh` - Automates evidence POSTing and edge creation
   - Handles JSON escaping via heredoc to avoid backslash issues
   - Waits for pipeline processing between POSTs (3-4 second delays)
   - Displays final case graph with colored output
   - Checks backend health before starting

**Key Learnings:**

- **No explicit /infer endpoint:** Inference happens automatically via event-driven Blackboard Controller when evidence is added
- **Edge type normalization:** Manual DEBUNKED_BY edges may be normalized to similar_to by backend depending on EdgeType enum
- **Contact field format:** Must use string `"Name <email>"` not object `{name, email}` to avoid validation errors
- **Case auto-creation:** Backend creates separate cases per report unless explicitly linked to existing case
- **JSON escaping:** Use heredoc in curl (`-d @-` with `<<'EOF'`) to avoid backslash escaping errors
- **Frontend env reload:** Next.js caches NEXT_PUBLIC_* variables - must restart dev server after changing .env.local

**Verification:**
```bash
# Check backend health and knowledge sources
curl http://localhost:8000/health
# Expected: {"status":"ok","controller_running":true,"knowledge_sources":7}

# View created cases and evidence
curl http://localhost:8000/api/cases | jq

# Run automated setup
cd /home/harsha/Documents/temp/hackathon/WolfTrace-ui
./setup-fire-scenario.sh
```

**Demonstration:**
Fire misinformation scenario now uses **real AI inference** showing:
- ✅ Temporal clustering (evidence within 30min window)
- ✅ Geospatial clustering (same location coordinates)
- ✅ Semantic similarity (keyword overlap analysis)
- ✅ Claim extraction via Backboard/Gemini AI
- ✅ Fact-checking integration (Google Fact Check API)
- ✅ Semantic role classification (Originator, Amplifier, Mutator)
- ✅ Confidence scores for all relationships
- ✅ Real-time WebSocket updates

**Frontend Integration:**
- WebSocket automatically connects on mount when `NEXT_PUBLIC_USE_BACKEND=true`
- Initial case snapshots loaded via WebSocket `snapshots` message
- Real-time updates via `graph_update` messages (add_node, add_edge, update_node)
- Backend cases displayed in Bureau Wall with dynamic node counts
- Evidence Network shows AI-inferred relationships with confidence scores

**Known Issues:**
- Backend uses in-memory storage - cases lost on restart
- Frontend env variables require dev server restart to reload
- Case IDs differ from mock data (CASE-Iron-Asset-6425 vs case-001)
- Manual edges may be needed if automatic pipelines don't detect contradictions

---

## Recent Changes (2024-02-14)

### 1. Fixed WebSocket URL Construction

**Issue:** Double slashes in URLs causing connection failures
- WebSocket: `ws://localhost:8000//ws/caseboard` → 403 Forbidden
- API calls: `//api/cases` → 404 Not Found

**Root Cause:** `NEXT_PUBLIC_API_URL` environment variable had trailing slash (`http://localhost:8000/`)

**Files Modified:**

**`lib/api-client.ts` (line 8):**
```typescript
// Before
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// After
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
```

**`components/wolftrace-provider.tsx` (lines 85-86):**
```typescript
// Before
const wsUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace('http', 'ws')

// After
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const wsUrl = apiUrl.replace('http', 'ws')
```

**Result:** ✅ WebSocket now connects successfully: `ws://localhost:8000/ws/caseboard`

---

### 2. Improved WebSocket Error Logging

**Issue:** Noisy console errors during normal reconnection attempts

**File Modified: `lib/api-client.ts`**

**Changes:**

1. **Suppress expected reconnection errors (lines 334-340):**
```typescript
this.ws.onerror = (error) => {
  // Only log errors if we've exhausted reconnection attempts
  if (this.reconnectAttempts >= this.maxReconnectAttempts) {
    console.error('WebSocket error (all reconnection attempts failed):', error)
    this.onError?.(error)
  }
}
```

2. **Better reconnection logging (lines 342-346, 353-360):**
```typescript
this.ws.onclose = () => {
  if (this.reconnectAttempts === 0) {
    console.log('WebSocket disconnected, attempting to reconnect...')
  }
  this.attemptReconnect()
}

private attemptReconnect() {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    this.reconnectAttempts++
    console.log(`🔄 WebSocket reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    setTimeout(() => this.connect(), this.reconnectDelay)
  } else {
    console.error('❌ WebSocket failed to connect after maximum reconnection attempts')
  }
}
```

**Result:**
- ✅ No error spam during normal reconnection
- ✅ Clear progress indicators: `🔄 WebSocket reconnecting... (attempt 1/5)`
- ✅ Only shows errors when connection truly fails

---

## API Integration Status

### ✅ Implemented API Calls

| Method | Endpoint | Component/Function | Status |
|--------|----------|-------------------|--------|
| GET | `/health` | `shadowBureauAPI.healthCheck()` | ✅ Working |
| GET | `/api/cases` | `shadowBureauAPI.getCases()` | ✅ Working |
| POST | `/api/cases` | `shadowBureauAPI.createCase()` | ✅ Working |
| GET | `/api/cases/{id}` | `shadowBureauAPI.getCase()` | ✅ Working |
| POST | `/api/cases/{id}/evidence` | `shadowBureauAPI.addEvidence()` | ✅ Working |
| POST | `/api/cases/{id}/edges` | `shadowBureauAPI.createEvidenceConnection()` | ✅ Working |
| POST | `/api/report` | `shadowBureauAPI.submitTip()` | ✅ Working |
| GET | `/api/reports` | `shadowBureauAPI.getReports()` | ✅ Working |
| WS | `/ws/caseboard` | `ShadowBureauWebSocket` in `wolftrace-provider.tsx` | ⚠️ Partial |

### ❌ Missing API Calls

| Backend Endpoint | Missing UI | Impact |
|-----------------|-----------|--------|
| `GET /api/cases/{id}/graph` | N/A | Neo4j graph format not used |
| `POST /api/alerts/draft` | Alerts Desk page | Can't generate alert drafts |
| `POST /api/alerts/approve` | Alerts Desk page | Can't publish alerts |
| `GET /api/alerts` | Alerts feed page | Can't view published alerts |
| `WS /ws/alerts` | Alerts component | No real-time alert notifications |

---

## Type Mapping Functions

### mapBackendCase()
Converts backend case to frontend Case type:

```typescript
Backend (CaseOut)         → Frontend (Case)
------------------          ------------------
case_id / id              → id
label / case_id           → codename
status: "pending"         → status: "Investigating"
updated_at                → lastUpdated
node_count                → evidenceCount
summary                   → summary
story                     → storyText
location / nodes[0].data.location.building → location
Math.random()             → position.x, position.y (for corkboard)
(updated_at < 30min)      → hasHeat
```

### mapBackendEvidence()
Converts backend node to frontend Evidence type with robust field extraction:

```typescript
Backend (GraphNode)       → Frontend (Evidence)
-------------------         --------------------
id                        → id
case_id                   → caseId
node_type: "report"       → type: "text"
extractEvidenceTitle()    → title (7-level priority fallback)
data.media_url            → contentUrl
data.reviewed             → reviewed
data.timestamp / created_at → timestamp
extractEntities()         → extractedEntities
extractLocations()        → extractedLocations
extractKeyPoints()        → keyPoints
extractAuthenticitySignals() → authenticitySignals
(derived)                 → authenticity (verified/suspicious/unknown)
node_type === "report"    → source: "Public Tip" | "Investigator"
```

**Updated (2026-02-14): Enhanced Evidence Mapping**

The `mapBackendEvidence()` function now uses specialized helper functions for robust data extraction:

**Title Extraction (`extractEvidenceTitle()`):**
```
Priority 1: data.title                    // Explicit title field
Priority 2: data.text_body                // Primary content
Priority 3: data.content                  // Alternative field
Priority 4: data.claims[0].text          // First claim
Priority 5: data.key_points[0]           // First key point
Priority 6: filename from data.media_url // Media filename
Priority 7: Type-based fallback          // "Witness Report - 10:30 AM"
```

**Field Extraction Helpers:**
- `extractEntities()`: Checks `data.entities[]` → `data.claims[].entities[]`
- `extractLocations()`: Checks `data.locations[]` → `data.location.building` → `data.location` string → `['Unknown']`
- `extractKeyPoints()`: Checks `data.key_points[]` → `data.claims[]` text
- `extractAuthenticitySignals()`: Extracts from `data.fact_check_results[]`, `data.forensics`

**Development Logging:**
When `NODE_ENV === 'development'`, warnings are logged for missing content fields to help identify backend data issues.

### mapBackendEdge()
Converts backend edge to frontend EvidenceConnection:

```typescript
Backend (GraphEdge)       → Frontend (EvidenceConnection)
-------------------         -------------------------------
source_id / source        → fromId
target_id / target        → toId
edge_type: "similar_to"   → relation: "related"
edge_type: "contains"     → relation: "supports"
edge_type: "debunked_by"  → relation: "contradicts"
```

---

## WebSocket Integration

### Current Implementation

**Location:** `components/wolftrace-provider.tsx` (lines 82-127)

**Flow:**
1. Component mounts → Creates WebSocket connection to `/ws/caseboard`
2. Receives initial snapshots: `{type: "snapshots", payload: [...]}`
3. Maps backend cases via `mapBackendCase()` → updates state
4. Listens for real-time updates: `{type: "graph_update", action: "add_node", payload: {...}}`
5. Updates state for `add_node`, `add_edge`, `update_node` actions

**WebSocket Message Handlers:**
```typescript
if (data.type === 'snapshots') {
  // Initial load
  const cases = data.payload.map(mapBackendCase)
  setState(s => ({ ...s, cases }))
} else if (data.type === 'graph_update') {
  // Real-time update
  if (action === 'add_node') {
    const newEvidence = mapBackendEvidence(payload, payload.case_id || '')
    setState(s => ({ ...s, evidence: [...s.evidence, newEvidence] }))
  } else if (action === 'add_edge') {
    const newConnection = mapBackendEdge(payload)
    setState(s => ({ ...s, evidenceConnections: [...s.evidenceConnections, newConnection] }))
  } else if (action === 'update_node') {
    const updatedEvidence = mapBackendEvidence(payload, payload.case_id || '')
    setState(s => ({ ...s, evidence: s.evidence.map(e => e.id === updatedEvidence.id ? updatedEvidence : e) }))
  }
}
```

### ⚠️ Needs Verification

**Current Status:** WebSocket connects successfully, but real-time UI updates NOT confirmed

**Test Plan:**
1. Open Case Wall in browser
2. Add evidence via backend API: `POST /api/cases/case-001/evidence`
3. Verify evidence appears in UI WITHOUT page refresh
4. If not working: Check if React Context updates trigger component re-renders

---

## Known Issues

### Issue #1: Location Format Mismatch

**Frontend Sends:**
```typescript
// lib/api-client.ts - submitTip()
location: tip.location ? { building: tip.location } : undefined
```

**Backend Expects:**
```python
class Location(BaseModel):
    building: str
    lat: Optional[float] = None
    lng: Optional[float] = None
```

**Impact:** Works but lat/lng always undefined

**Fix Required:**
```typescript
// Should send full location object
location: tip.location ? {
  building: tip.location,
  lat: undefined,  // or actual coordinates if available
  lng: undefined
} : undefined
```

### Issue #2: Real-Time Updates Not Verified

**Problem:** WebSocket connects but unclear if UI updates happen automatically

**Components That Need Real-Time:**
- `app/bureau/wall/page.tsx` - Case Wall should update when new tips arrive
- `app/bureau/case/[id]/page.tsx` - Evidence Network should update when evidence added
- Sidebar notification badges should update

**Fix Required:** Verify React Context updates propagate to all consuming components

---

## Missing Features

### 1. Alerts Desk
**Required Components:**
- `app/bureau/alerts/page.tsx` - Main alerts page
- Alert draft form → calls `POST /api/alerts/draft`
- Alert approval modal → calls `POST /api/alerts/approve`
- Alerts feed → calls `GET /api/alerts`
- WebSocket listener for real-time alert broadcasts

### 2. Witness Inbox (Full Page)
**Current:** Drawer component exists in Case Wall
**Missing:** Dedicated page at `app/bureau/inbox/page.tsx`
- Full list view of all tips (`GET /api/reports`)
- Filter/search functionality
- Workflow to attach tips to existing cases
- Bulk operations

### 3. Walkie-Talkie Leads Panel
**Status:** Not implemented
**Requirements:**
- Backend endpoint for recent activity (doesn't exist yet)
- Real-time updates via WebSocket
- Persistent panel in case view
- Audio notification option

### 4. Forensics Lab
**Status:** Not implemented
**Requirements:**
- Media analysis UI
- RAG chat interface (grounded in evidence)
- Video transcription display
- Image forensics visualization

---

## Testing

### Run Frontend
```bash
cd /Users/samarth/Desktop/Wolftrace/wolf-trace-ui-design
pnpm install

# Create .env.local
echo "NEXT_PUBLIC_USE_BACKEND=true" > .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local

pnpm dev
```

### Verify Backend Connection
```javascript
// Browser console
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
// Expected: {status: "ok", knowledge_sources: 0, controller_running: true}
```

### Check WebSocket Connection
```
// Browser console should show:
✅ WebSocket connected: ws://localhost:8000/ws/caseboard
📨 WebSocket message: {type: "snapshots", payload: [...]}
```

### Test Real-Time Updates
```bash
# Terminal: Add evidence while viewing case
curl -X POST http://localhost:8000/api/cases/case-001/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-realtime-1",
    "type": "text",
    "content": "Testing real-time updates",
    "timestamp": "2024-02-14T12:00:00Z"
  }'

# Expected: Evidence should appear in Evidence Network WITHOUT refresh
```

---

## Environment Variables

### Required
```bash
# .env.local
NEXT_PUBLIC_USE_BACKEND=true
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Note:** `NEXT_PUBLIC_API_URL` should NOT have trailing slash

### Optional
```bash
# For production deployment
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

---

## Next Steps

### Critical (Do First)
1. **Verify real-time WebSocket updates work end-to-end**
   - Test adding evidence via API updates UI
   - Test adding tip creates case in Case Wall

2. **Fix location submission format**
   - Update `submitTip()` to send proper Location object

### High Priority
3. **Implement Alerts Desk UI**
   - Create page and components
   - Connect to existing backend endpoints

4. **Implement Witness Inbox full page**
   - Create dedicated page
   - Add tip-to-case workflow

5. **Add Walkie-Talkie Leads panel**
   - Design real-time activity feed
   - Wait for backend endpoint implementation

### Medium Priority
6. **Consider Neo4j graph endpoint**
   - Evaluate `GET /api/cases/{id}/graph` for Evidence Network
   - May provide better React Flow formatting

7. **Implement loading states**
   - Show spinners during API calls
   - Add error boundaries

8. **Add optimistic UI updates**
   - Immediate feedback when adding evidence
   - Rollback on API errors

---

## Files Changed

### Modified
- `lib/api-client.ts` - Fixed URL trailing slash, improved WebSocket error handling
- `components/wolftrace-provider.tsx` - Fixed WebSocket URL construction

### Key Files (Unchanged)
- `lib/types.ts` - Frontend type definitions
- `lib/mock-data.ts` - Mock data (used when `NEXT_PUBLIC_USE_BACKEND=false`)
- `lib/store.ts` - React Context definition
- `components/bureau/case-wall.tsx` - Case Wall component
- `components/bureau/case-workspace.tsx` - Case detail view
- `components/bureau/evidence-network.tsx` - Evidence graph visualization
- `app/bureau/wall/page.tsx` - Case Wall page
- `app/bureau/case/[id]/page.tsx` - Case detail page

---

## API Client Reference

### ShadowBureauAPI Class

```typescript
// Usage
import { shadowBureauAPI } from '@/lib/api-client'

// Get all cases
const cases = await shadowBureauAPI.getCases()

// Get case detail
const { case, evidence, connections } = await shadowBureauAPI.getCase('case-001')

// Create case
const newCase = await shadowBureauAPI.createCase('Case Title', 'Description')

// Add evidence
const newEvidence = await shadowBureauAPI.addEvidence('case-001', {
  id: 'ev-123',
  type: 'text',
  title: 'Evidence title',
  timestamp: new Date().toISOString()
})

// Create connection
await shadowBureauAPI.createEvidenceConnection('case-001', 'ev-1', 'ev-2', 'related')

// Submit tip
const { caseId, reportId, referenceCode } = await shadowBureauAPI.submitTip({
  content: 'Tip text',
  location: 'Building Name',
  anonymous: true
})

// Get all tips
const tips = await shadowBureauAPI.getReports()

// Health check
const health = await shadowBureauAPI.healthCheck()
```

### ShadowBureauWebSocket Class

```typescript
// Usage (in components/wolftrace-provider.tsx)
const ws = new ShadowBureauWebSocket(
  'ws://localhost:8000/ws/caseboard',
  (data) => {
    // Handle message
    console.log('WebSocket message:', data)
  },
  (error) => {
    // Handle error
    console.error('WebSocket error:', error)
  }
)

ws.connect()
// Auto-reconnects up to 5 times with 2s delay

// Cleanup
ws.disconnect()
```
