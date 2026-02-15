# WolfTrace Backend AI Inference Guide

## Overview

WolfTrace uses a **Blackboard Architecture** for automatic AI-powered inference on evidence networks. When evidence is added to the system, multiple AI pipelines automatically analyze it and create relationships with other evidence.

This guide explains how the inference system works and how to use it effectively.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Knowledge Source Pipelines](#knowledge-source-pipelines)
- [Automatic vs Manual Edge Creation](#automatic-vs-manual-edge-creation)
- [Edge Types and Mapping](#edge-types-and-mapping)
- [API Endpoints Reference](#api-endpoints-reference)
- [WebSocket Events](#websocket-events)
- [Using the Setup Script](#using-the-setup-script)
- [Confidence Scores](#confidence-scores)
- [Debugging Inference](#debugging-inference)

---

## Architecture Overview

### Blackboard Architecture

The **Blackboard** is a shared data structure (the evidence graph) that multiple **Knowledge Sources** (inference pipelines) read from and write to. When new evidence is added:

1. **Event is published** to the event bus
2. **Blackboard Controller evaluates** which Knowledge Sources should run
3. **Knowledge Sources execute** in priority order
4. **Results are written** back to the graph (new nodes and edges)
5. **WebSocket broadcasts** updates to connected clients

### Event-Driven Processing

```
Evidence Added → Event Published → Blackboard Evaluates → Pipelines Run → Graph Updated → WebSocket Broadcast
```

**Key Insight:** There is **no explicit `/infer` endpoint**. Inference happens automatically when evidence is POSTed via:
- `/api/report` - Submit a new tip/report (creates REPORT node)
- `/api/cases/{case_id}/evidence` - Add evidence to existing case

---

## Knowledge Source Pipelines

### 1. CLUSTERING Pipeline (Priority: CRITICAL)

**Purpose:** Finds similar evidence based on temporal, geospatial, and semantic analysis.

**Triggers:** When a new REPORT node is added

**Analysis:**
- **Temporal:** Compares timestamps (30-minute window)
- **Geospatial:** Compares locations (200m radius)
- **Semantic:** Extracts keywords and measures overlap

**Scoring:**
```python
temporal_score = 0.3 * decay_function(time_difference)  # 0-30 min
geo_score = 0.3 * (1 if distance < 200m else 0)
semantic_score = 0.4 * (keyword_overlap / total_keywords)

total_score = temporal_score + geo_score + semantic_score
if total_score >= 0.4:
    create_edge(SIMILAR_TO, confidence=total_score)
```

**Creates:**
- `SIMILAR_TO` edges with confidence scores
- Connects evidence that are temporally, geographically, and semantically related

**Example:**
```
Student report (22:15) + Official report (22:22) = 7 min ✓
Same location (40.7489, -73.9681) ✓
Keywords overlap ("Science Building", "fire") ✓
→ SIMILAR_TO edge (confidence: 0.78)
```

---

### 2. NETWORK Pipeline (Priority: MEDIUM)

**Purpose:** Extracts claims from evidence and performs fact-checking.

**Triggers:** When a new REPORT node is added

**Analysis:**
1. **Claim Extraction:**
   - Uses Backboard Claim Analyst or Gemini AI
   - Identifies factual assertions in text
   - Assigns confidence scores to claims

2. **Fact-Checking:**
   - Queries Google Fact Check API
   - Searches web for corroborating/contradicting sources
   - Creates EXTERNAL_SOURCE nodes for found articles

3. **Edge Creation:**
   - `DEBUNKED_BY` edges when fact-checks contradict claims
   - `CONTAINS` edges linking evidence to extracted claims
   - Edges to EXTERNAL_SOURCE nodes

**Creates:**
- CLAIM nodes (extracted assertions)
- FACT_CHECK nodes (from Google API)
- EXTERNAL_SOURCE nodes (web articles)
- `DEBUNKED_BY`, `CONTAINS` edges

**Example:**
```
Report: "Fire detected in Science Building"
→ Extract claim: "Fire in Science Building" (confidence: 0.9)
→ Fact-check API: No matches
→ Web search: Find official campus safety bulletin
→ Create EXTERNAL_SOURCE node
→ Create edge: EXTERNAL_SOURCE → REPORT (debunked_by)
```

---

### 3. CLASSIFIER Pipeline (Priority: LOW)

**Purpose:** Assigns semantic roles to evidence based on content and context.

**Triggers:** When a new node is added

**Roles:**
- **Originator:** First to report information (earliest timestamp)
- **Amplifier:** Spreads existing information without modification
- **Mutator:** Modifies or alters information (edits images, changes details)
- **Unwitting Sharer:** Unknowingly spreads misinformation

**Analysis:**
- Timestamp order (earlier = more likely Originator)
- Content similarity (high similarity = Amplifier)
- Content differences (modifications = Mutator)
- Account credibility signals

**Creates:**
- Updates node `data.semantic_role` field

**Example:**
```
Student report (22:15) → Originator (first to report)
Official report (22:22) → Originator (authoritative source)
Fake image (22:25) → Mutator (modified existing image)
```

---

### 4. FORENSICS Pipeline (Priority: HIGH)

**Purpose:** Analyzes images and videos for manipulation and authenticity.

**Triggers:** When media nodes (IMAGE, VIDEO) are added

**Analysis:**

**For Images:**
- **ELA (Error Level Analysis):** Detects editing artifacts
- **pHash (Perceptual Hash):** Enables reverse image search
- **EXIF Extraction:** Metadata (camera, location, timestamp)
- **Reverse Image Search:** Find original sources

**For Videos:**
- **TwelveLabs Integration:** Video understanding API
- **Frame analysis:** Detect deepfakes, splicing
- **Audio analysis:** Voice manipulation detection

**Creates:**
- MEDIA_VARIANT nodes (if duplicates found)
- FORENSIC_ANALYSIS nodes (with results)
- `MUTATION_OF` edges (if edited version detected)

**Example:**
```
Fake fire image uploaded
→ ELA analysis: High error levels around building signage
→ Reverse image: Match to 2019 Ohio warehouse fire
→ EXIF: Stripped (suspicious)
→ Create MEDIA_VARIANT node for original image
→ Create edge: fake-image → original (mutation_of)
```

---

### 5. Recluster Debunk Pipeline (Priority: MEDIUM)

**Purpose:** Re-evaluates edges when new debunking evidence arrives.

**Triggers:** When FACT_CHECK or official sources are added

**Analysis:**
- Finds evidence connected to debunked claims
- Updates edge types (SIMILAR_TO → DEBUNKED_BY)
- Recalculates confidence scores

---

### 6. Case Synthesizer Pipeline (Priority: LOW)

**Purpose:** Groups related evidence into cohesive cases.

**Triggers:** When multiple SIMILAR_TO edges form a cluster

**Analysis:**
- Identifies evidence clusters via graph analysis
- Proposes case boundaries
- Generates case summaries and timelines

**Creates:**
- CASE nodes (containers for evidence)
- Case metadata (summary, location, status)

---

## Automatic vs Manual Edge Creation

### Automatic Edges (Preferred)

**How:** POST evidence via `/api/report` or `/api/cases/{id}/evidence` and let pipelines run.

**Advantages:**
- ✅ AI-powered analysis
- ✅ Confidence scores
- ✅ Multiple evidence aspects considered
- ✅ Automatic updates as new evidence arrives
- ✅ Consistent methodology

**Created By:**
- CLUSTERING: `SIMILAR_TO`
- NETWORK: `DEBUNKED_BY`, `CONTAINS`
- FORENSICS: `MUTATION_OF`

**Wait Time:** 3-5 seconds between POSTs for pipelines to process

---

### Manual Edges

**When to Use:**
- Pipelines don't detect a relationship (threshold not met)
- Cross-case connections needed
- Expert knowledge not captured by AI
- Override automatic inference

**How:**
```bash
curl -X POST http://localhost:8000/api/cases/{case_id}/edges \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "evidence-1",
    "target_id": "evidence-2",
    "type": "similar_to",
    "note": "Explanation for this edge",
    "confidence": 0.8
  }'
```

**Note:** Manual edges may not have the same confidence score methodology as automatic edges.

---

## Edge Types and Mapping

### Backend Edge Types (EdgeType Enum)

Defined in `wolf-trace-backend/app/models/graph.py`:

```python
class EdgeType(str, Enum):
    SIMILAR_TO = "similar_to"      # Related evidence
    REPOST_OF = "repost_of"        # Duplicate/repost
    MUTATION_OF = "mutation_of"    # Edited version
    DEBUNKED_BY = "debunked_by"    # Contradicted by fact-check
    AMPLIFIED_BY = "amplified_by"  # Spread by influencer
    CONTAINS = "contains"          # Evidence contains claim
```

### Frontend Relation Mapping

Defined in `WolfTrace-ui/lib/api-client.ts`:

```typescript
Backend Edge Type → Frontend Relation → Visual
------------------   -------------------   ------
SIMILAR_TO         → related            → Gray line
DEBUNKED_BY        → contradicts        → Red line
CONTAINS           → supports           → Blue line
REPOST_OF          → related            → Gray line
MUTATION_OF        → related            → Gray line
AMPLIFIED_BY       → related            → Gray line
```

**Visual Indicators:**
- **Red lines:** Contradictions (official debunks claim)
- **Blue lines:** Support (evidence supports claim)
- **Gray lines:** Related but neutral relationship

---

## API Endpoints Reference

### Health & Status

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "controller_running": true,
  "knowledge_sources": 7
}
```

---

### Create Case

```bash
POST /api/cases
Content-Type: application/json

{
  "case_id": "my-case-id",
  "title": "Case Title",
  "description": "Description text"
}
```

Response:
```json
{
  "id": "my-case-id",
  "case_id": "my-case-id",
  "title": "Case Title",
  "status": "active",
  "node_count": 0
}
```

---

### Submit Report (Triggers Pipelines)

```bash
POST /api/report
Content-Type: application/json

{
  "text_body": "Report text",
  "location": {
    "building": "Building Name",
    "lat": 40.7489,
    "lng": -73.9681
  },
  "timestamp": "2026-02-13T22:15:00Z",
  "anonymous": true,
  "contact": null
}
```

Response:
```json
{
  "report_id": "RPT-ABC123",
  "case_id": "CASE-XYZ-456",
  "status": "submitted"
}
```

**Important:**
- `contact` field: Use `null` if anonymous, or `"Name <email>"` string (NOT object)
- Pipelines run asynchronously (3-5 sec delay)
- Check case graph after waiting to see inferred edges

---

### Add Evidence to Case

```bash
POST /api/cases/{case_id}/evidence
Content-Type: application/json

{
  "id": "my-evidence-id",
  "type": "image",
  "content": "Description of evidence",
  "url": "https://example.com/image.jpg",
  "timestamp": "2026-02-13T22:25:00Z"
}
```

---

### Get Case Graph

```bash
GET /api/cases/{case_id}
```

Response:
```json
{
  "case_id": "CASE-XYZ-456",
  "title": "Case Title",
  "nodes": [
    {
      "id": "RPT-ABC123",
      "node_type": "report",
      "data": {
        "text_body": "...",
        "claims": [...],
        "semantic_role": "Originator"
      },
      "created_at": "2026-02-13T22:15:00Z"
    }
  ],
  "edges": [
    {
      "source_id": "RPT-ABC123",
      "target_id": "RPT-DEF456",
      "edge_type": "similar_to",
      "confidence": 0.78,
      "created_at": "2026-02-13T22:20:00Z"
    }
  ]
}
```

---

### Create Manual Edge

```bash
POST /api/cases/{case_id}/edges
Content-Type: application/json

{
  "source_id": "evidence-1",
  "target_id": "evidence-2",
  "type": "similar_to",
  "note": "Manual connection",
  "confidence": 0.8
}
```

---

### List All Cases

```bash
GET /api/cases
```

Response:
```json
[
  {
    "case_id": "CASE-XYZ-456",
    "report_count": 3,
    "node_count": 9,
    "edge_count": 8,
    "status": "active",
    "summary": "...",
    "location": "Science Building"
  }
]
```

---

## WebSocket Events

### Connection

```typescript
ws://localhost:8000/ws/caseboard
```

Connect on frontend mount when `NEXT_PUBLIC_USE_BACKEND=true`.

---

### Event: Initial Snapshots

```json
{
  "type": "snapshots",
  "payload": [
    {
      "case_id": "CASE-XYZ-456",
      "title": "Case Title",
      "nodes": [...],
      "edges": [...]
    }
  ]
}
```

**Trigger:** Immediately after connection established

**Frontend Action:** Load all cases into state

---

### Event: Graph Update (Add Node)

```json
{
  "type": "graph_update",
  "action": "add_node",
  "payload": {
    "id": "RPT-NEW",
    "node_type": "report",
    "case_id": "CASE-XYZ-456",
    "data": {...}
  }
}
```

**Trigger:** New evidence added to a case

**Frontend Action:** Add node to evidence array

---

### Event: Graph Update (Add Edge)

```json
{
  "type": "graph_update",
  "action": "add_edge",
  "payload": {
    "source_id": "RPT-ABC",
    "target_id": "RPT-DEF",
    "edge_type": "similar_to",
    "confidence": 0.78
  }
}
```

**Trigger:** Pipeline creates new relationship

**Frontend Action:** Add edge to connections array, update Evidence Network visualization

---

### Event: Graph Update (Update Node)

```json
{
  "type": "graph_update",
  "action": "update_node",
  "payload": {
    "id": "RPT-ABC",
    "node_type": "report",
    "data": {
      "semantic_role": "Originator"
    }
  }
}
```

**Trigger:** Pipeline updates node metadata (e.g., CLASSIFIER assigns role)

**Frontend Action:** Update node in evidence array

---

## Using the Setup Script

### Quick Start

```bash
cd /home/harsha/Documents/temp/hackathon/WolfTrace-ui
./setup-fire-scenario.sh
```

### What the Script Does

1. **Checks dependencies** (curl, jq)
2. **Verifies backend health** at http://localhost:8000
3. **POSTs evidence sequentially:**
   - Student fire report
   - Official false alarm
   - Fabricated fire image
4. **Waits 4 seconds** between POSTs for pipeline processing
5. **Creates manual cross-case edges** if evidence split across cases
6. **Displays case graph** with colored output

### Script Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WolfTrace Fire Misinformation Scenario Setup
  Backend AI Inference via Blackboard Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Checking dependencies...
✓ Dependencies checked
ℹ Checking backend health at http://localhost:8000...
✓ Backend is healthy (Blackboard Controller: running, Knowledge Sources: 7)
ℹ Creating fire misinformation scenario...

ℹ [1/3] Adding student fire report...
✓ Created student report: RPT-69ACB1E920BF (case: CASE-Cold-Code-1335)
ℹ Waiting 4 seconds for CLUSTERING and NETWORK pipelines to process...

ℹ [2/3] Adding official Campus Safety report...
✓ Created official report: RPT-D4D879BC5E04 (case: CASE-Iron-Asset-6425)
ℹ Waiting 4 seconds for pipelines to detect temporal/geo/semantic similarity...

ℹ [3/3] Adding fabricated fire image...
✓ Created fake image evidence: fake-fire-image
ℹ Waiting 4 seconds for FORENSICS and CLUSTERING pipelines...

✓ All evidence created!
⚠ Evidence was assigned to different cases:
  Student report: CASE-Cold-Code-1335
  Official report: CASE-Iron-Asset-6425
ℹ Creating cross-case edges to connect the evidence...
✓ Manual edges created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fire Misinformation Scenario - Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Graph Summary:
{
  "case_id": "CASE-Cold-Code-1335",
  "title": "CASE-Cold-Code-1335",
  "nodes": 9,
  "edges": 8,
  "node_types": [
    {"type": "report", "count": 2},
    {"type": "external_source", "count": 6},
    {"type": "media_variant", "count": 1}
  ],
  "edge_types": [
    {"type": "similar_to", "count": 8}
  ]
}

✓ Setup complete! 🎉
```

---

## Confidence Scores

### CLUSTERING Confidence

Formula:
```
confidence = 0.3 * temporal + 0.3 * geo + 0.4 * semantic
```

**Interpretation:**
- `0.8-1.0`: Very strong similarity (same event, different perspectives)
- `0.6-0.8`: Strong similarity (related events, similar context)
- `0.4-0.6`: Moderate similarity (possibly related)
- `< 0.4`: Not similar enough (no edge created)

**Example:**
```
Student report (22:15) vs Official report (22:22):
- Temporal: 0.28 (7 min gap, close to max 30 min)
- Geo: 0.30 (exact same location)
- Semantic: 0.35 (high keyword overlap)
Total: 0.93 → SIMILAR_TO edge created
```

---

### NETWORK Confidence (Claim Extraction)

**Interpretation:**
- `0.9-1.0`: Explicit factual assertion ("The fire started at 10:15 PM")
- `0.7-0.9`: Strong claim with clear intent ("Flames visible from windows")
- `0.5-0.7`: Implied claim ("Someone should call 911")
- `< 0.5`: Opinion or speculation ("I think it might be a fire")

---

### FORENSICS Confidence (Image Analysis)

**Interpretation:**
- `0.9-1.0`: Strong evidence of manipulation (ELA shows clear editing)
- `0.7-0.9`: Likely manipulated (EXIF stripped, reverse match found)
- `0.5-0.7`: Suspicious indicators (metadata inconsistencies)
- `< 0.5`: Insufficient evidence of manipulation

---

## Debugging Inference

### Check Blackboard Controller Status

```bash
curl http://localhost:8000/health | jq
```

Expected:
```json
{
  "status": "ok",
  "controller_running": true,
  "knowledge_sources": 7
}
```

If `controller_running: false`:
- Backend started with error
- Check backend logs for exceptions
- Restart backend

---

### Check Pipeline Logs

**Backend terminal should show:**
```
INFO: Blackboard evaluating: node:report for RPT-69ACB1E920BF
INFO: Running knowledge source: clustering (priority: CRITICAL)
INFO: Running knowledge source: network (priority: MEDIUM)
INFO: Running knowledge source: classifier (priority: LOW)
INFO: Created edge: RPT-69ACB... → EXT-FC6... (similar_to, conf=0.82)
INFO: Extracted 2 claims from report RPT-69ACB...
```

If no pipeline logs appear:
- Event bus not publishing events
- Pipelines not registered
- Check backend startup logs

---

### Verify Edge Creation

```bash
curl http://localhost:8000/api/cases/{case_id} | jq '.edges'
```

Expected:
```json
[
  {
    "source_id": "RPT-ABC",
    "target_id": "RPT-DEF",
    "edge_type": "similar_to",
    "confidence": 0.78,
    "created_at": "2026-02-13T22:20:00Z"
  }
]
```

If no edges:
- Threshold not met (confidence < 0.4)
- Pipelines didn't run (check logs)
- Evidence too dissimilar (timestamps far apart, different locations, no keyword overlap)

---

### Common Issues

**Issue:** CLUSTERING doesn't create edges

**Solutions:**
- ✅ Reduce timestamp gap (< 30 min)
- ✅ Use identical lat/lng coordinates
- ✅ Add overlapping keywords ("fire", "Science Building")
- ✅ Check combined score >= 0.4

---

**Issue:** NETWORK doesn't extract claims

**Solutions:**
- ✅ Use declarative sentences ("Fire detected") not questions
- ✅ Include factual details (location, time, entities)
- ✅ Check backend has Backboard/Gemini API credentials
- ✅ Review backend logs for AI API errors

---

**Issue:** FORENSICS doesn't analyze image

**Solutions:**
- ✅ Provide accessible image URL (not localhost)
- ✅ Use supported image format (JPG, PNG)
- ✅ Check backend has TwelveLabs API key (if needed)
- ✅ Verify image is not too large (< 10 MB)

---

## Summary

**Key Takeaways:**

1. **Automatic inference** via Blackboard Architecture pipelines (no manual /infer endpoint)
2. **6 pipelines** run automatically when evidence is added (CLUSTERING, NETWORK, CLASSIFIER, FORENSICS, recluster_debunk, case_synthesizer)
3. **Wait 3-5 seconds** between evidence POSTs for pipelines to process
4. **WebSocket broadcasts** real-time updates to frontend
5. **Confidence scores** determine if edges are created (threshold: 0.4)
6. **Use setup script** for quick scenario demos
7. **Frontend restart required** when changing NEXT_PUBLIC_USE_BACKEND env variable

**Next Steps:**

- Run `./setup-fire-scenario.sh` to see inference in action
- Check browser console for WebSocket messages
- View Evidence Network in frontend to see AI-inferred relationships
- Experiment with different evidence to understand pipeline behavior

For more information, see:
- [DATA_MODE_GUIDE.md](DATA_MODE_GUIDE.md) - Switching between mock and backend modes
- [INTEGRATION_CHANGELOG.md](INTEGRATION_CHANGELOG.md) - Recent changes and implementation details
