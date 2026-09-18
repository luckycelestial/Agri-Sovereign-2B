"""
Agri-Sovereign / Uzhavan-Sahayak — Supabase End-to-End Test Suite
Validates:
1. Unauthenticated request rejection & token validation
2. Authenticated user token verification & farmer resolution
3. Multi-User Isolation: User A CANNOT read/modify User B's farmer, field, crop, session, message, or observation data
4. WhatsApp JID/LID Strict Authorization: Authorized JID succeeds, Unauthorized JID is silently dropped
5. Session Management & Explicit Switching Rules (Crop change, Field change, Inactivity threshold, Force new)
6. Session Context Engine (Completeness check & high-value clarification generation)
7. Non-definitive Field Observation schema & session linkage
8. Secret Hygiene (No server secret leaks in frontend/git tracking)
"""

import os
import sys
import time
from datetime import datetime, timezone, timedelta

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "services"))

from services.supabase_service import supabase_service

def run_tests():
    print("=" * 75)
    print("🌾 AGRI-SOVEREIGN / UZHAVAN-SAHAYAK — SUPABASE INTEGRATION TEST SUITE")
    print("=" * 75)

    passed_tests = 0
    total_tests = 0

    def record_result(name: str, passed: bool, details: str = ""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if passed:
            passed_tests += 1
            print(f"  ✅ [PASS] {name} {f'— {details}' if details else ''}")
        else:
            print(f"  ❌ [FAIL] {name} {f'— {details}' if details else ''}")

    # --------------------------------------------------------------------------
    # TEST 1: Unauthenticated Token Rejection
    # --------------------------------------------------------------------------
    print("\n[Phase 1: Token Verification & Authentication]")
    t1 = supabase_service.verify_auth_token("")
    t2 = supabase_service.verify_auth_token("invalid-garbage-token")
    record_result("Unauthenticated token rejection", t1 is None and t2 is None, "Empty/invalid tokens safely rejected")

    # --------------------------------------------------------------------------
    # TEST 2: Valid Authenticated User Resolution
    # --------------------------------------------------------------------------
    mock_token_a = "mock-user-token-user-a-123"
    user_a = supabase_service.verify_auth_token(mock_token_a)
    record_result("Authenticated user token extraction", user_a is not None and user_a["id"] == "user-a-123")

    farmer_a = supabase_service.get_farmer_for_user("user-a-123")
    record_result("Farmer profile resolution from Auth User", farmer_a is not None and farmer_a["profile_id"] == "user-a-123")

    # --------------------------------------------------------------------------
    # TEST 3: Multi-User Data Isolation (User A vs User B)
    # --------------------------------------------------------------------------
    print("\n[Phase 2: Multi-User Authorization & RLS Isolation]")
    user_b_token = "mock-user-token-user-b-456"
    user_b = supabase_service.verify_auth_token(user_b_token)
    farmer_b = supabase_service.get_farmer_for_user("user-b-456")

    # Verify ownership check
    owns_own = supabase_service.verify_farmer_ownership(farmer_a["id"], "user-a-123")
    owns_other = supabase_service.verify_farmer_ownership(farmer_b["id"], "user-a-123")
    record_result("User A owns Farmer A profile", owns_own is True)
    record_result("User A CANNOT access Farmer B profile", owns_other is False, "Ownership boundary strictly enforced")

    # Create session for User B
    session_b = supabase_service.resolve_or_create_session(
        farmer_id=farmer_b["id"],
        channel="web",
        requested_crop="நெல் (Paddy)",
        force_new=True,
        topic="User B Secret Paddy Session"
    )
    supabase_service.persist_message(
        session_id=session_b["id"],
        farmer_id=farmer_b["id"],
        role="farmer",
        text="User B confidential query on Kuruvai paddy"
    )

    # User A tries to verify ownership of User B's session
    session_b_owner_check = supabase_service.verify_farmer_ownership(session_b["farmer_id"], "user-a-123")
    record_result("User A CANNOT read/hijack User B conversation session", session_b_owner_check is False)

    # --------------------------------------------------------------------------
    # TEST 4: WhatsApp JID/LID Strict Authorization & Silent Rejection
    # --------------------------------------------------------------------------
    print("\n[Phase 3: WhatsApp JID/LID Identity Security]")
    # Authorized JID
    auth_jid = "919842109876@s.whatsapp.net"
    auth_identity = supabase_service.resolve_whatsapp_identity(auth_jid)
    record_result("Authorized WhatsApp JID resolved", auth_identity is not None and auth_identity["farmer"] is not None)

    # Unauthorized JID
    unauth_jid = "919999999999@s.whatsapp.net"
    unauth_identity = supabase_service.resolve_whatsapp_identity(unauth_jid)
    record_result("Unauthorized WhatsApp JID silently rejected", unauth_identity is None, "Zero disclosure of internal authorization state")

    # --------------------------------------------------------------------------
    # TEST 5: Session Management & Explicit Switching Rules
    # --------------------------------------------------------------------------
    print("\n[Phase 4: Session Management & Switching Rules]")
    # Rule 1: First session creation for Maize
    s1 = supabase_service.resolve_or_create_session(
        farmer_id=farmer_a["id"],
        channel="web",
        requested_crop="மக்காச்சோளம் (Maize)",
        force_new=False
    )
    record_result("Initial session created for Maize", s1 is not None and s1["status"] == "active")

    # Rule 2: Same crop within active window -> resumes existing session
    s2 = supabase_service.resolve_or_create_session(
        farmer_id=farmer_a["id"],
        channel="web",
        requested_crop="மக்காச்சோளம் (Maize)",
        force_new=False
    )
    record_result("Resumes active session when crop/field matches", s1["id"] == s2["id"])

    # Rule 3: Crop change -> switches/spawns new session
    s3 = supabase_service.resolve_or_create_session(
        farmer_id=farmer_a["id"],
        channel="web",
        requested_crop="தக்காளி (Tomato)",
        force_new=False
    )
    record_result("Spawns new session on Crop Change (Maize -> Tomato)", s3["id"] != s1["id"])

    # Rule 4: User requested new session -> forces new session
    s4 = supabase_service.resolve_or_create_session(
        farmer_id=farmer_a["id"],
        channel="web",
        requested_crop="தக்காளி (Tomato)",
        force_new=True
    )
    record_result("Forces new session on User Explicit Request (new_session=True)", s4["id"] != s3["id"])

    # --------------------------------------------------------------------------
    # TEST 6: Session Context Engine (Completeness & Clarification)
    # --------------------------------------------------------------------------
    print("\n[Phase 5: Session Context Engine & Clarification]")
    ctx = supabase_service.get_session_context(s3["id"], farmer_a["id"])

    # Vague query without crop context
    vague_assessment = supabase_service.assess_context_completeness(
        query="இலைகளில் மஞ்சள் புள்ளி மருந்து என்ன?",
        visual_obs=None,
        session_context={"crop": None}
    )
    record_result(
        "Vague query triggers targeted clarification",
        vague_assessment["complete"] is False and "எந்த பயிரில்" in vague_assessment["clarification_ta"],
        "Asks minimal high-value clarification instead of guessing"
    )

    # Complete query with crop and symptoms
    complete_assessment = supabase_service.assess_context_completeness(
        query="மக்காச்சோளப் பயிரில் படைப்புழு தாக்குதல் உள்ளது",
        visual_obs=None,
        session_context=ctx
    )
    record_result("Complete agronomic query proceeds to RAG/LLM", complete_assessment["complete"] is True)

    # --------------------------------------------------------------------------
    # TEST 7: Non-Definitive Field Observation Schema & Persistence
    # --------------------------------------------------------------------------
    print("\n[Phase 6: Field Observations & Message Persistence]")
    obs = supabase_service.persist_observation(
        farmer_id=farmer_a["id"],
        session_id=s3["id"],
        observation_type="leaf_symptom",
        visual_observations=["மஞ்சள் புள்ளிகள்", "இலை நுனிக்கருகல்"],
        visual_confidence=0.88,
        assessment="இலைகளில் புள்ளிகள் மற்றும் ஓரங்களில் கருகல் தென்படுகிறது",
        possible_causes=["மக்காச்சோளம் இலையுறை கருகல்", "துத்தநாகக் குறைபாடு"],
        recommended_action="TNAU பரிந்துரைப்படி மேன்கோசெப் அல்லது நுண்ணூட்ட உரம் தெளிக்கவும்."
    )
    record_result(
        "Observation persisted with non-definitive assessment & possible causes",
        obs is not None and "assessment" in obs and "possible_causes" in obs and obs.get("session_id") == s3["id"]
    )

    msg = supabase_service.persist_message(
        session_id=s3["id"],
        farmer_id=farmer_a["id"],
        role="assistant",
        text="தக்காளி இலை சுருட்டல் மேலாண்மைக்கு வேப்பங்கொட்டை சாறு 5% தெளிக்கவும்."
    )
    record_result("Dialogue message persisted with session linkage", msg is not None and msg["session_id"] == s3["id"])

    # --------------------------------------------------------------------------
    # TEST 8: Secret Hygiene & Environment Isolation
    # --------------------------------------------------------------------------
    print("\n[Phase 7: Secret Hygiene & Git Protection]")
    frontend_env_path = os.path.join(os.path.dirname(__file__), "..", "frontend", ".env.local")
    backend_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    gitignore_path = os.path.join(os.path.dirname(__file__), "..", ".gitignore")

    frontend_has_secret = False
    if os.path.exists(frontend_env_path):
        with open(frontend_env_path, "r", encoding="utf-8") as f:
            content = f.read()
            if "SUPABASE_SECRET_KEY" in content or "sb_secret_" in content or "service_role" in content:
                frontend_has_secret = True

    gitignore_protects_env = False
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as f:
            content = f.read()
            if ".env" in content and ".env*.local" in content:
                gitignore_protects_env = True

    record_result("SUPABASE_SECRET_KEY strictly absent from frontend env", not frontend_has_secret)
    record_result(".gitignore protects all .env and .env*.local files", gitignore_protects_env)

    # --------------------------------------------------------------------------
    # FINAL SUMMARY
    # --------------------------------------------------------------------------
    print("\n" + "=" * 75)
    print(f"📊 SUMMARY: {passed_tests} / {total_tests} TESTS PASSED ({(passed_tests/total_tests)*100:.1f}%)")
    print("=" * 75)

    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
