# Frontend Integration Changelog

## Overview
This document tracks changes made to integrate the WolfTrace frontend with the Shadow Bureau backend.

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
Converts backend node to frontend Evidence type:

```typescript
Backend (GraphNode)       → Frontend (Evidence)
-------------------         --------------------
id                        → id
case_id                   → caseId
node_type: "report"       → type: "text"
data.text_body (50 chars) → title
data.media_url            → contentUrl
data.reviewed             → reviewed
data.timestamp / created_at → timestamp
data.claims[].text        → extractedEntities, keyPoints
data.location.building    → extractedLocations
data.fact_check_results   → authenticitySignals
(derived)                 → authenticity (verified/suspicious/unknown)
node_type === "report"    → source: "Public Tip" | "Investigator"
```

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
