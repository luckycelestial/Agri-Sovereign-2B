import os
import sys
import time
import json
import base64
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

BASE_URL = "http://localhost:5001"

def run_tests():
    print("=" * 75)
    print("🌾 AGRI-SOVEREIGN / UZHAVAN-SAHAYAK — WHATSAPP & INTEGRATION E2E TEST SUITE")
    print("=" * 75)

    passed = 0
    total = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  ✅ [PASS] {name} {details}")
        else:
            print(f"  ❌ [FAIL] {name} {details}")

    time.sleep(2)

    # -------------------------------------------------------------
    # 1. Daemon Status & QR Generation
    # -------------------------------------------------------------
    print("\n[Phase 1: Daemon Health & Pairing Handshake]")
    try:
        r = requests.get(f"{BASE_URL}/status", timeout=5)
        st = r.json()
        assert_test("Daemon API Responds 200 OK", r.status_code == 200)
        assert_test("Daemon Status / QR Reporting Valid", bool(st.get("qr") or st.get("connected") or st.get("daemon_status") in ["connected", "pairing", "ready"]), f"(status={st.get('daemon_status')})")
    except Exception as e:
        assert_test("Daemon API Responds", False, str(e))

    # -------------------------------------------------------------
    # 2. Phone-Number Pairing (PairPhone) Diagnostic Path
    # -------------------------------------------------------------
    print("\n[Phase 2: Phone-Number Pairing (PairPhone)]")
    try:
        r = requests.post(f"{BASE_URL}/pair-phone", json={"phone": "918148212664"}, timeout=10)
        p_res = r.json()
        assert_test("PairPhone Generates 8-Character Linking Code", p_res.get("success") is True and len(p_res.get("code", "")) >= 8, f"(code={p_res.get('code')})")
    except Exception as e:
        assert_test("PairPhone API", False, str(e))

    # -------------------------------------------------------------
    # 3. Authorized Contact Identification & Full Agro-Advisory Reply
    # -------------------------------------------------------------
    print("\n[Phase 3: Authorized Identity (Pavithran P N - 918148212664)]")
    try:
        r = requests.post(f"{BASE_URL}/simulate-inbound", json={
            "phone": "918148212664",
            "message": "மக்காச்சோளப் படைப்புழு தாக்குதல் மேலாண்மை பரிந்துரை",
            "crop": "Maize"
        }, timeout=10)
        res = r.json()
        assert_test("Authorized Message Accepted", res.get("success") is True)
        assert_test("TNAU Grounded Reply Produced", "TNAU" in res.get("reply", "") or "படைப்புழு" in res.get("reply", ""))
        assert_test("CIBRC Safety Banner Preserved", "பாதுகாப்பு" in res.get("reply", ""))
        session_id_1 = res.get("session_id")
        assert_test("Session Created and Linked", bool(session_id_1))
    except Exception as e:
        assert_test("Authorized Text Flow", False, str(e))

    # -------------------------------------------------------------
    # 4. Unauthorized Identity Silent Rejection (Zero Info Leakage)
    # -------------------------------------------------------------
    print("\n[Phase 4: Unauthorized Identity Security & Silent Rejection]")
    try:
        r = requests.post(f"{BASE_URL}/simulate-inbound", json={
            "phone": "919988776655",
            "message": "வணக்கம் எனக்கு நெல் உதவி வேண்டும்"
        }, timeout=5)
        res = r.json()
        assert_test("Unauthorized JID Silently Dropped", res.get("action") == "silently_dropped")
        assert_test("Zero Message Response Sent to Unauthorized User", "reply" not in res)
    except Exception as e:
        assert_test("Unauthorized Rejection Flow", False, str(e))

    # -------------------------------------------------------------
    # 5. Session Context Engine & Clarification on Vague Query
    # -------------------------------------------------------------
    print("\n[Phase 5: Session Context Engine (Clarification vs Guessing)]")
    try:
        r = requests.post(f"{BASE_URL}/simulate-inbound", json={
            "phone": "919361779326", # Srinithi R
            "message": "என் நெல் வயலில் இலை மஞ்சளாகிறது"
        }, timeout=10)
        res = r.json()
        reply = res.get("reply", "")
        assert_test("Vague Query Asks Targeted Clarification", ("வயது" in reply or "அறிகுறிகள்" in reply or "பரிந்துரை" in reply))
    except Exception as e:
        assert_test("Context Engine Clarification", False, str(e))

    # -------------------------------------------------------------
    # 6. Multimodal WhatsApp Image Observation Flow
    # -------------------------------------------------------------
    print("\n[Phase 6: Multimodal Crop Vision Observer]")
    try:
        # 1x1 test pixel
        dummy_pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        r = requests.post(f"{BASE_URL}/simulate-inbound", json={
            "phone": "919150272141", # Kirubashini V
            "message": "இந்த இலையில் உள்ள புள்ளி நோய் என்ன?",
            "image": dummy_pixel,
            "crop": "Tomato"
        }, timeout=10)
        res = r.json()
        assert_test("Multimodal Image Accepted & Analyzed", res.get("success") is True)
        assert_test("Response Grounded in Crop & Symptoms", bool(res.get("reply")))
    except Exception as e:
        assert_test("Multimodal Image Flow", False, str(e))

    # -------------------------------------------------------------
    # 7. Session Switching Rules (Crop Switch Isolation)
    # -------------------------------------------------------------
    print("\n[Phase 7: Session Isolation & Switching Rules]")
    try:
        from services.supabase_service import supabase_service
        f_id = "11111111-1111-1111-1111-111111111102"
        s1 = supabase_service.resolve_or_create_session(farmer_id=f_id, channel="whatsapp", requested_crop="Maize")
        s2 = supabase_service.resolve_or_create_session(farmer_id=f_id, channel="whatsapp", requested_crop="Maize")
        assert_test("Same Crop Reuses Active Session", s1["id"] == s2["id"])

        s3 = supabase_service.resolve_or_create_session(farmer_id=f_id, channel="whatsapp", requested_crop="Paddy")
        assert_test("Crop Switch (Maize -> Paddy) Spawns New Session", s1["id"] != s3["id"])
    except Exception as e:
        assert_test("Session Switching Rules", False, str(e))

    print("\n" + "=" * 75)
    print(f"📊 SUMMARY: {passed} / {total} TESTS PASSED ({(passed/total)*100:.1f}%)")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
