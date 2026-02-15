#!/bin/bash
# setup-fire-scenario.sh
# Automates creation of the "Phantom Fire" misinformation scenario in WolfTrace backend
# Demonstrates real AI inference via Blackboard Architecture pipelines

set -euo pipefail

# Configuration
API_URL="${API_URL:-http://localhost:8000}"
FRONTEND_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# Check dependencies
check_dependencies() {
  log_info "Checking dependencies..."

  if ! command -v curl &> /dev/null; then
    log_error "curl is not installed. Please install curl first."
    exit 1
  fi

  if ! command -v jq &> /dev/null; then
    log_warning "jq is not installed. Install for better output formatting:"
    log_warning "  Ubuntu/Debian: sudo apt-get install jq"
    log_warning "  macOS: brew install jq"
    echo
  fi

  log_success "Dependencies checked"
}

# Check backend health
check_backend() {
  log_info "Checking backend health at $API_URL..."

  if ! HEALTH_RESPONSE=$(curl -sf "$API_URL/health" 2>&1); then
    log_error "Backend not running at $API_URL"
    log_error "Start backend:"
    echo "  cd /home/harsha/Documents/temp/hackathon/wolf-trace-backend"
    echo "  uv run uvicorn app.main:app --reload"
    exit 1
  fi

  if command -v jq &> /dev/null; then
    CONTROLLER_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.controller_running // "unknown"')
    KS_COUNT=$(echo "$HEALTH_RESPONSE" | jq -r '.knowledge_sources // 0')

    if [ "$CONTROLLER_STATUS" = "true" ]; then
      log_success "Backend is healthy (Blackboard Controller: running, Knowledge Sources: $KS_COUNT)"
    else
      log_warning "Backend is running but Blackboard Controller status: $CONTROLLER_STATUS"
    fi
  else
    log_success "Backend is reachable"
  fi
}

# Create evidence using heredoc to avoid JSON escaping issues
create_evidence() {
  log_info "Creating fire misinformation scenario..."
  echo

  # Evidence 1: Student fire report (anonymous, suspicious)
  log_info "[1/3] Adding student fire report..."
  STUDENT_RESPONSE=$(curl -sf -X POST "$API_URL/api/report" \
    -H "Content-Type: application/json" \
    -d @- <<'EOF'
{
  "text_body": "URGENT: Fire detected in Science Building East Wing! I can see flames coming from the third-floor windows near Lab 3E. Fire alarm is NOT activated. This is serious - someone needs to call 911 immediately! The flames are getting bigger. Posted by concerned student.",
  "location": {
    "building": "Science Building - East Wing",
    "lat": 40.7489,
    "lng": -73.9681
  },
  "timestamp": "2026-02-13T22:15:00Z",
  "anonymous": true,
  "contact": null
}
EOF
  )

  STUDENT_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.report_id // .id // "unknown"')
  STUDENT_CASE=$(echo "$STUDENT_RESPONSE" | jq -r '.case_id // "unknown"')

  if [ "$STUDENT_ID" != "unknown" ]; then
    log_success "Created student report: $STUDENT_ID (case: $STUDENT_CASE)"
  else
    log_error "Failed to create student report"
    echo "$STUDENT_RESPONSE" | jq '.' 2>/dev/null || echo "$STUDENT_RESPONSE"
    exit 1
  fi

  log_info "Waiting 4 seconds for CLUSTERING and NETWORK pipelines to process..."
  sleep 4

  # Evidence 2: Official Campus Safety report (verified, contradicts student)
  log_info "[2/3] Adding official Campus Safety report..."
  OFFICIAL_RESPONSE=$(curl -sf -X POST "$API_URL/api/report" \
    -H "Content-Type: application/json" \
    -d @- <<'EOF'
{
  "text_body": "Campus Safety Incident Report #2847. Responded to social media report of fire at Science Building East Wing at 22:18. Full building sweep completed by 22:22. NO fire, smoke, or elevated temperatures detected. Fire suppression system shows no activation. All sensors nominal. Building declared all-clear. FALSE ALARM confirmed in official log. Report filed by Officer Martinez, Badge #4219.",
  "location": {
    "building": "Science Building - East Wing",
    "lat": 40.7489,
    "lng": -73.9681
  },
  "timestamp": "2026-02-13T22:22:00Z",
  "anonymous": false,
  "contact": "Officer Martinez <martinez@campus-safety.edu>"
}
EOF
  )

  OFFICIAL_ID=$(echo "$OFFICIAL_RESPONSE" | jq -r '.report_id // .id // "unknown"')
  OFFICIAL_CASE=$(echo "$OFFICIAL_RESPONSE" | jq -r '.case_id // "unknown"')

  if [ "$OFFICIAL_ID" != "unknown" ]; then
    log_success "Created official report: $OFFICIAL_ID (case: $OFFICIAL_CASE)"
  else
    log_error "Failed to create official report"
    echo "$OFFICIAL_RESPONSE" | jq '.' 2>/dev/null || echo "$OFFICIAL_RESPONSE"
    exit 1
  fi

  log_info "Waiting 4 seconds for pipelines to detect temporal/geo/semantic similarity..."
  sleep 4

  # Evidence 3: Fabricated fire image (fake, posted after official denial)
  log_info "[3/3] Adding fabricated fire image..."

  # Try to add to the first case (student case)
  FAKE_IMAGE_RESPONSE=$(curl -sf -X POST "$API_URL/api/cases/$STUDENT_CASE/evidence" \
    -H "Content-Type: application/json" \
    -d @- <<'EOF'
{
  "id": "fake-fire-image",
  "type": "image",
  "content": "Photo circulated on messaging apps at 22:25 showing flames in Science Building windows. FORENSIC ANALYSIS: Reverse image search matches 2019 warehouse fire in Ohio. Image digitally edited to add Science Building signage. EXIF data intentionally stripped. Lighting inconsistencies with Feb 13 weather conditions. Posted from burner account.",
  "url": "https://example.com/fake-fire.jpg",
  "timestamp": "2026-02-13T22:25:00Z"
}
EOF
  )

  FAKE_ID=$(echo "$FAKE_IMAGE_RESPONSE" | jq -r '.id // "unknown"' 2>/dev/null || echo "fake-fire-image")

  if [ "$FAKE_ID" != "unknown" ]; then
    log_success "Created fake image evidence: $FAKE_ID"
  else
    log_warning "Fake image may not have been added (check backend logs)"
  fi

  log_info "Waiting 4 seconds for FORENSICS and CLUSTERING pipelines..."
  sleep 4

  echo
  log_success "All evidence created!"

  # Store case IDs for later use
  PRIMARY_CASE="$STUDENT_CASE"
  SECONDARY_CASE="$OFFICIAL_CASE"
}

# Create manual edges if cases are separate
create_manual_edges() {
  log_info "Checking if manual edges are needed..."

  if [ "$PRIMARY_CASE" != "$SECONDARY_CASE" ]; then
    log_warning "Evidence was assigned to different cases:"
    log_warning "  Student report: $PRIMARY_CASE"
    log_warning "  Official report: $SECONDARY_CASE"
    log_info "Creating cross-case edges to connect the evidence..."

    # Edge 1: Official report contradicts student claim
    log_info "Creating edge: Official → Student (similar_to/debunked_by)"
    EDGE1_RESPONSE=$(curl -sf -X POST "$API_URL/api/cases/$PRIMARY_CASE/edges" \
      -H "Content-Type: application/json" \
      -d @- <<EOF
{
  "source_id": "$OFFICIAL_ID",
  "target_id": "$STUDENT_ID",
  "type": "similar_to",
  "note": "Official report contradicts student fire claim (cross-case edge)"
}
EOF
    ) || log_warning "Edge creation may have failed"

    sleep 1

    # Edge 2: Fake image supports student claim
    log_info "Creating edge: Fake image → Student (similar_to)"
    EDGE2_RESPONSE=$(curl -sf -X POST "$API_URL/api/cases/$PRIMARY_CASE/edges" \
      -H "Content-Type: application/json" \
      -d @- <<EOF
{
  "source_id": "fake-fire-image",
  "target_id": "$STUDENT_ID",
  "type": "similar_to",
  "note": "Fabricated image appears to support false fire claim"
}
EOF
    ) || log_warning "Edge creation may have failed"

    log_success "Manual edges created"
  else
    log_info "All evidence in same case ($PRIMARY_CASE) - automatic edges should exist"
  fi
}

# Display results
display_results() {
  echo
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Fire Misinformation Scenario - Setup Complete!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo

  log_info "Retrieving case graph from backend..."

  if command -v jq &> /dev/null; then
    # Pretty print with jq
    log_info "Case: $PRIMARY_CASE"
    echo
    CASE_DATA=$(curl -sf "$API_URL/api/cases/$PRIMARY_CASE")

    echo "📊 Graph Summary:"
    echo "$CASE_DATA" | jq '{
      case_id: .case_id,
      title: .title,
      nodes: .nodes | length,
      edges: .edges | length,
      node_types: [.nodes[].node_type] | group_by(.) | map({type: .[0], count: length}),
      edge_types: [.edges[].edge_type] | group_by(.) | map({type: .[0], count: length})
    }'

    echo
    echo "🔗 Edges (Inferred Relationships):"
    echo "$CASE_DATA" | jq -r '.edges[] | "  \(.source_id | .[0:20])... → \(.target_id | .[0:20])... [\(.edge_type)]"'

    if [ "$PRIMARY_CASE" != "$SECONDARY_CASE" ]; then
      echo
      log_info "Secondary case: $SECONDARY_CASE"
      CASE2_DATA=$(curl -sf "$API_URL/api/cases/$SECONDARY_CASE")
      echo "$CASE2_DATA" | jq '{case_id, title, nodes: .nodes | length, edges: .edges | length}'
    fi
  else
    # Plain output without jq
    curl -sf "$API_URL/api/cases/$PRIMARY_CASE"
  fi

  echo
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo
  log_success "View in frontend: $FRONTEND_URL"
  log_info "Open browser console to see WebSocket real-time updates"
  log_info "Navigate to Bureau Wall to see the case appear"
  log_info "Click on the case to view the Evidence Network graph"
  echo
  log_info "Backend API endpoints:"
  echo "  Cases: curl $API_URL/api/cases | jq"
  echo "  Case detail: curl $API_URL/api/cases/$PRIMARY_CASE | jq"
  echo "  Health: curl $API_URL/health | jq"
  echo
}

# Main execution
main() {
  echo
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  WolfTrace Fire Misinformation Scenario Setup"
  echo "  Backend AI Inference via Blackboard Architecture"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo

  check_dependencies
  check_backend
  create_evidence
  create_manual_edges
  display_results

  log_success "Setup complete! 🎉"
  echo
}

# Run main function
main
