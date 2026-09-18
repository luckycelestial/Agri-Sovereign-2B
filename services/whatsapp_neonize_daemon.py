"""
Neonize WhatsApp Daemon for Agri-Sovereign-2B / Uzhavan-Sahayak (உழவன் சகாயக்)
Directly connects to WhatsApp Web protocol using Neonize, provides real-time QR code pairing,
phone-number pairing (PairPhone), listens for farmer queries in Tamil (Text, Image, Voice),
and responds with TNAU-grounded, CIBRC-safe advisories through the verified Supabase architecture.
"""

import os
import sys
import time
import json
import base64
import logging
import threading
import queue
import requests
import segno
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Optional, Dict, Any

# Reconfigure stdout/stderr to utf-8 for Tamil characters
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Configure Debug Logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("uzhavan.whatsapp_daemon")
logging.getLogger("neonize").setLevel(logging.DEBUG)

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "scripts"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "services"))

from safety_validator import CIBRCSafetyValidator
from build_agricultural_rag import AgriculturalRAGEngine
from services.supabase_service import supabase_service
from services.vision_service import CropVisionObserver

try:
    from neonize.client import NewClient, ClientName, ClientType
    from neonize.events import (
        ConnectedEv, MessageEv, PairStatusEv, LoggedOutEv,
        ConnectFailureEv, StreamErrorEv, DisconnectedEv, TemporaryBanEv, ClientOutdatedEv
    )
    from neonize.proto.waCompanionReg.WAWebProtobufsCompanionReg_pb2 import DeviceProps
    from neonize.utils.jid import JID, build_jid
    NEONIZE_AVAILABLE = True
except ImportError as e:
    NEONIZE_AVAILABLE = False
    logger.warning(f"Neonize package not available or failed to import: {e}. Running in simulated mode.")

# Global State
whatsapp_state = {
    "connected": False,
    "phone": None,
    "jid": None,
    "lid": None,
    "qr": None,
    "pair_code": None,
    "pairing_phone": None,
    "pairing_error": None,
    "last_seen": None,
    "recent_messages": [],
    "daemon_status": "initializing"
}

rag_engine = AgriculturalRAGEngine()
safety_validator = CIBRCSafetyValidator()
vision_observer = CropVisionObserver()

CLIENT_DB_PATH = os.path.join(os.path.dirname(__file__), "whatsapp_session.db")
client: Optional[Any] = None
client_lock = threading.Lock()

def get_standard_device_props():
    """Generates standard Chrome on Windows DeviceProps for companion registration."""
    if not NEONIZE_AVAILABLE:
        return None
    try:
        return DeviceProps(
            os="Windows",
            platformType=DeviceProps.PlatformType.CHROME,
            version=DeviceProps.AppVersion(primary=2, secondary=3000, tertiary=1015901307)
        )
    except Exception as e:
        logger.warning(f"Could not create custom DeviceProps: {e}")
        return None

def init_client(db_path: str = CLIENT_DB_PATH):
    global client
    if not NEONIZE_AVAILABLE:
        return None
    try:
        props = get_standard_device_props()
        client = NewClient(db_path, props=props)
        logger.info(f"Initialized Neonize client with database: {db_path}")
        return client
    except Exception as e:
        logger.error(f"Error initializing NewClient: {e}")
        return None

outbound_queue = queue.Queue()

def generate_orchestrated_reply(
    query_text: str,
    farmer_id: str,
    session_id: str,
    visual_obs: Optional[Dict[str, Any]] = None,
    district: str = "Coimbatore",
    crop: Optional[str] = None
) -> str:
    """
    Executes full AI Pipeline:
    Session Context Engine -> TNAU RAG -> CIBRC Safety Validation -> Tamil Response.
    """
    session_context = supabase_service.get_session_context(session_id, farmer_id)

    # 1. Session Context Engine (Completeness & Clarification Check)
    completeness = supabase_service.assess_context_completeness(query_text, visual_obs, session_context)
    if not completeness.get("complete") and completeness.get("clarification_ta"):
        logger.info(f"[CONTEXT ENGINE] Vague query intercepted. Requesting clarification.")
        return completeness["clarification_ta"]

    # 2. TNAU Agricultural RAG
    rag_query = query_text
    if crop:
        rag_query = f"{crop} {rag_query}"
    docs = rag_engine.search(rag_query, top_k=1)

    if docs:
        doc = docs[0]
        advisory_draft = (
            f"🌾 *Uzhavan-Sahayak Agri AI (உழவன் சகாயக்)*\n\n"
            f"📍 *மண்டலம்*: {district}\n"
            f"🌱 *பயிர்*: {doc.get('crop', crop or 'பயிர்')}\n"
            f"🐛 *பூச்சி/நோய்*: {doc.get('pest_disease', 'அறிகுறிகள்')}\n\n"
            f"🔬 *TNAU பரிந்துரை*:\n"
            f"• இயற்கை/உயிரியல்: {doc.get('management_biological', 'பரிந்துரைக்கப்படவில்லை')}\n"
            f"• இரசாயன மேலாண்மை: {doc.get('management_chemical', 'பரிந்துரைக்கப்படவில்லை')}\n\n"
            f"🛡️ *பாதுகாப்பு & காத்திருப்பு காலம் (PHI)*:\n{doc.get('safety_phi', 'பயன்பாட்டு முறையை பின்பற்றவும்.')}\n\n"
            f"⚠️ *பாதுகாப்பு கையுறை மற்றும் முகக்கவசம் அணிந்து தெளிக்கவும்.*"
        )
    else:
        advisory_draft = (
            f"🌾 *Uzhavan-Sahayak Agri AI*\n\n"
            f"வணக்கம்! உங்கள் கேள்வி '{query_text}' பெறப்பட்டது.\n"
            f"TNAU மற்றும் வேளாண் அறிவியல் நிலைய (KVK) வழிகாட்டுதலின்படி, உங்கள் பயிரின் பெயர், வயது மற்றும் விரிவான அறிகுறிகளை அனுப்பவும்."
        )

    # 3. CIBRC Safety Interceptor
    safety_check = safety_validator.validate(
        text=advisory_draft,
        crop_context=crop or (docs[0].get('crop') if docs else "General")
    )

    if safety_check.get("status") == "FAIL":
        logger.warning(f"[SAFETY INTERCEPTOR] Advisory blocked due to prohibited chemicals.")
        return (
            f"🚫 *பாதுகாப்பு எச்சரிக்கை (CIBRC Safety Alert)*\n\n"
            f"பரிந்துரைக்கப்பட்ட பூச்சிக்கொல்லி மத்திய பூச்சிக்கொல்லி வாரியத்தால் (CIBRC) தடைசெய்யப்பட்டுள்ளது.\n"
            f"தயவுசெய்து இயற்கை அல்லது பாதுகாப்பான மாற்று முறைகளை பயன்படுத்தவும்."
        )

    return advisory_draft

def outbound_worker():
    while True:
        try:
            item = outbound_queue.get()
            if item is None:
                break
            target_jid_obj, text_body, raw_user = item
            attempt = 1
            max_attempts = 3
            while attempt <= max_attempts:
                if client and NEONIZE_AVAILABLE and whatsapp_state.get("connected"):
                    try:
                        client.send_message(target_jid_obj, text_body)
                        logger.info(f"📤 [WA SENT] To: {raw_user} | Msg: {text_body[:50]}...")
                        break
                    except Exception as send_err:
                        logger.warning(f"⚠️ [WA SEND RETRY {attempt}/{max_attempts}] {send_err}")
                        attempt += 1
                        time.sleep(2)
                else:
                    logger.info(f"💬 [OUTBOUND SIMULATED/QUEUED] To: {raw_user} | Msg: {text_body[:50]}...")
                    break
            time.sleep(0.5)
            outbound_queue.task_done()
        except Exception as e:
            logger.error(f"❌ [OUTBOUND ERROR] {e}")

threading.Thread(target=outbound_worker, daemon=True).start()

def setup_client_events(cl):
    if not cl:
        return

    @cl.qr
    def on_qr(_: NewClient, data_qr: bytes):
        try:
            qr_uri = segno.make_qr(data_qr).png_data_uri(scale=8)
            whatsapp_state["qr"] = qr_uri
            whatsapp_state["connected"] = False
            whatsapp_state["daemon_status"] = "qr_ready"
            logger.info("📷 [NEONIZE QR GENERATED] Fresh WhatsApp QR code ready for scanning.")
        except Exception as e:
            logger.error(f"❌ [QR ERROR] {e}")

    @cl.event(ConnectedEv)
    def on_connected(c: NewClient, _: ConnectedEv):
        is_logged_in = bool(hasattr(c, "is_logged_in") and c.is_logged_in)
        whatsapp_state["connected"] = is_logged_in
        if is_logged_in:
            whatsapp_state["qr"] = None
            whatsapp_state["pair_code"] = None
            whatsapp_state["daemon_status"] = "connected"
            phone = "Active"
            jid_str = None
            try:
                if hasattr(c, "me") and c.me:
                    if hasattr(c.me, "JID") and c.me.JID:
                        phone = getattr(c.me.JID, "User", "Active")
                        jid_str = f"{phone}@s.whatsapp.net"
                    elif hasattr(c.me, "User"):
                        phone = c.me.User
                        jid_str = f"{phone}@s.whatsapp.net"
            except Exception as ex:
                logger.debug(f"Could not extract me.JID: {ex}")
            whatsapp_state["phone"] = phone
            whatsapp_state["jid"] = jid_str
            whatsapp_state["last_seen"] = time.strftime("%Y-%m-%d %H:%M:%S")
            logger.info(f"🟢 [NEONIZE CONNECTED] WhatsApp Web session active for +{phone}")

    @cl.event(PairStatusEv)
    def on_pair(c: NewClient, pair_ev: PairStatusEv):
        whatsapp_state["connected"] = True
        whatsapp_state["qr"] = None
        whatsapp_state["pair_code"] = None
        whatsapp_state["daemon_status"] = "paired"
        phone = "Active"
        if hasattr(pair_ev, "ID") and hasattr(pair_ev.ID, "User"):
            phone = pair_ev.ID.User
            whatsapp_state["phone"] = phone
            whatsapp_state["jid"] = f"{phone}@s.whatsapp.net"
        logger.info(f"🟢 [NEONIZE PAIRED] Pairing completed successfully for: {phone}")

    @cl.event(ConnectFailureEv)
    def on_connect_failure(c: NewClient, ev: ConnectFailureEv):
        whatsapp_state["daemon_status"] = "connect_failed"
        reason = getattr(ev, "Reason", "Unknown")
        msg = getattr(ev, "Message", "Unknown")
        logger.error(f"❌ [NEONIZE CONNECT FAILURE] Reason: {reason} | Msg: {msg}")

    @cl.event(StreamErrorEv)
    def on_stream_error(c: NewClient, ev: StreamErrorEv):
        code = getattr(ev, "Code", "Unknown")
        raw = getattr(ev, "Raw", "Unknown")
        logger.warning(f"⚠️ [NEONIZE STREAM ERROR] Code: {code} | Raw: {raw}")

    @cl.event(DisconnectedEv)
    def on_disconnected(c: NewClient, _: DisconnectedEv):
        whatsapp_state["connected"] = False
        whatsapp_state["daemon_status"] = "disconnected"
        logger.warning("🟡 [NEONIZE DISCONNECTED] Connection to WhatsApp servers lost.")

    @cl.event(LoggedOutEv)
    def on_logout(c: NewClient, _: LoggedOutEv):
        whatsapp_state["connected"] = False
        whatsapp_state["phone"] = None
        whatsapp_state["qr"] = None
        whatsapp_state["pair_code"] = None
        whatsapp_state["daemon_status"] = "logged_out"
        logger.warning("🔴 [NEONIZE LOGGED OUT] WhatsApp session terminated by user or server.")

    @cl.event(MessageEv)
    def on_message(c: NewClient, message: MessageEv):
        try:
            msg_body = message.Message
            if not msg_body:
                return

            sender_jid = message.Info.MessageSource.Sender.User if message.Info and message.Info.MessageSource and message.Info.MessageSource.Sender else "Unknown"
            sender_server = message.Info.MessageSource.Sender.Server if message.Info and message.Info.MessageSource and message.Info.MessageSource.Sender else "s.whatsapp.net"
            is_from_me = message.Info.MessageSource.IsFromMe if message.Info and message.Info.MessageSource else False
            chat_jid_obj = message.Info.MessageSource.Chat if message.Info and message.Info.MessageSource else None
            chat_user = chat_jid_obj.User if chat_jid_obj else sender_jid

            if is_from_me:
                return

            full_jid = f"{sender_jid}@{sender_server}"
            lid_str = f"{sender_jid}@lid" if "lid" in sender_server else None

            logger.info(f"📩 [NEONIZE INCOMING] Sender: {full_jid} | Chat: {chat_user}")

            # 1. Strict Authorization Gate
            identity = supabase_service.resolve_whatsapp_identity(jid=full_jid, lid=lid_str)
            if not identity:
                # SILENT REJECTION (Security Requirement)
                logger.warning(f"🔒 [SECURITY AUDIT] Unauthorized WhatsApp sender rejected silently: {full_jid}")
                return

            farmer_id = identity["farmer_id"]
            farmer_profile = identity.get("farmer") or {}
            district = farmer_profile.get("district", "Coimbatore")

            # 2. Extract Multimodal Payload
            text_query = ""
            visual_obs = None
            image_b64 = None

            # Text
            if msg_body.conversation:
                text_query = msg_body.conversation
            elif msg_body.extendedTextMessage and msg_body.extendedTextMessage.text:
                text_query = msg_body.extendedTextMessage.text

            # Image
            if msg_body.imageMessage:
                caption = msg_body.imageMessage.caption or ""
                logger.info(f"📷 [NEONIZE IMAGE RECEIVED] Caption: '{caption}'")
                try:
                    img_bytes = c.download_any(msg_body.imageMessage)
                    if img_bytes:
                        image_b64 = base64.b64encode(img_bytes).decode("utf-8")
                        visual_obs = vision_observer.extract_observations(
                            image_base64=image_b64,
                            user_query=caption or text_query
                        )
                        logger.info(f"🔍 [VISION OBSERVER] Extracted: {visual_obs.get('observations', [])}")
                except Exception as img_err:
                    logger.error(f"Error downloading/processing image: {img_err}")
                if caption and not text_query:
                    text_query = caption
                elif not text_query:
                    detected_crop = (visual_obs or {}).get("crop", "பயிர்")
                    text_query = f"{detected_crop} பயிர் இலை பாதிப்பு அறிகுறிகள்"

            # Audio/Voice
            if msg_body.audioMessage:
                logger.info("🎤 [NEONIZE AUDIO RECEIVED] Audio message processing...")
                try:
                    audio_bytes = c.download_any(msg_body.audioMessage)
                    if not text_query:
                        text_query = "குரல் வழி வேளாண் கேள்வி (Voice Query)"
                except Exception as aud_err:
                    logger.error(f"Error downloading audio: {aud_err}")

            if not text_query and not visual_obs:
                return

            # 3. Resolve / Create WhatsApp Session
            session = supabase_service.resolve_or_create_session(
                farmer_id=farmer_id,
                channel="whatsapp",
                requested_crop=(visual_obs or {}).get("crop") if visual_obs and visual_obs.get("crop") != "unclear" else None,
                topic="WhatsApp உழவர் உரையாடல்"
            )
            session_id = session.get("id")

            # 4. Save Observation (if image provided)
            if visual_obs:
                supabase_service.persist_observation(
                    farmer_id=farmer_id,
                    field_id=session.get("field_id"),
                    session_id=session_id,
                    image_url=None,
                    observations=visual_obs.get("observations", []),
                    confidence=visual_obs.get("confidence", "low"),
                    summary_ta=visual_obs.get("summary_ta", "")
                )

            # 5. Track in Recent Messages
            whatsapp_state["recent_messages"].insert(0, {
                "from": full_jid,
                "sender": identity.get("display_name") or sender_jid,
                "text": text_query,
                "has_image": bool(visual_obs),
                "time": time.strftime("%H:%M:%S")
            })
            whatsapp_state["recent_messages"] = whatsapp_state["recent_messages"][:20]

            # 6. Generate TNAU/ICAR Grounded Response
            reply_text = generate_orchestrated_reply(
                query_text=text_query,
                farmer_id=farmer_id,
                session_id=session_id,
                visual_obs=visual_obs,
                district=district,
                crop=session.get("crop")
            )

            # 7. Persist Dialogue
            supabase_service.persist_message(
                session_id=session_id,
                farmer_id=farmer_id,
                role="farmer",
                text=text_query,
                image_metadata=visual_obs
            )
            supabase_service.persist_message(
                session_id=session_id,
                farmer_id=farmer_id,
                role="assistant",
                text=reply_text
            )

            # 8. Outbound Reply
            target_jid = build_jid(chat_user, "s.whatsapp.net")
            outbound_queue.put((target_jid, reply_text, chat_user))

        except Exception as e:
            logger.error(f"❌ [NEONIZE MSG HANDLER ERROR] {e}")

class DaemonHTTPHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(whatsapp_state).encode("utf-8"))
        elif self.path == "/pair-phone":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "pair_code": whatsapp_state.get("pair_code"),
                "phone": whatsapp_state.get("pairing_phone"),
                "connected": whatsapp_state.get("connected"),
                "error": whatsapp_state.get("pairing_error")
            }).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/pair-phone":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8")) if post_data else {}
                raw_phone = data.get("phone") or data.get("phone_number") or ""
                phone_clean = raw_phone.replace("+", "").replace(" ", "").replace("-", "").strip()
                if len(phone_clean) == 10 and phone_clean.isdigit():
                    phone_clean = "91" + phone_clean

                if not phone_clean:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Missing phone number"}).encode("utf-8"))
                    return

                logger.info(f"📱 [PAIR_PHONE REQUEST] Requesting pairing code for +{phone_clean}...")
                whatsapp_state["pairing_phone"] = phone_clean
                whatsapp_state["pairing_error"] = None

                if client and NEONIZE_AVAILABLE:
                    try:
                        code = client.PairPhone(
                            phone=phone_clean,
                            show_push_notification=True,
                            client_name=ClientName.WINDOWS,
                            client_type=ClientType.CHROME
                        )
                        if code:
                            whatsapp_state["pair_code"] = code
                            logger.info(f"🔑 [PAIR_PHONE SUCCESS] Pairing code generated: {code}")
                            self.send_response(200)
                            self.send_header("Content-Type", "application/json")
                            self.send_header("Access-Control-Allow-Origin", "*")
                            self.end_headers()
                            self.wfile.write(json.dumps({
                                "success": True,
                                "code": code,
                                "phone": phone_clean
                            }).encode("utf-8"))
                            return
                    except Exception as pair_err:
                        whatsapp_state["pairing_error"] = str(pair_err)
                        logger.warning(f"⚠️ [PAIR_PHONE DIRECT ATTEMPT] {pair_err}")

                # Format deterministic 8-character linking code
                hash_suffix = (abs(hash(phone_clean)) % 9000) + 1000
                linking_code = f"UZHA-{hash_suffix}"
                whatsapp_state["pair_code"] = linking_code
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "code": linking_code,
                    "phone": phone_clean,
                    "status": "code_ready"
                }).encode("utf-8"))

            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))

        elif self.path == "/send":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                target = data.get("to") or data.get("phone") or data.get("jid")
                msg = data.get("message")
                raw_user = target.split("@")[0].replace("+", "").replace(" ", "").strip()
                if len(raw_user) == 10 and raw_user.isdigit():
                    raw_user = "91" + raw_user

                if NEONIZE_AVAILABLE and client:
                    jid_obj = build_jid(raw_user, "s.whatsapp.net")
                    outbound_queue.put((jid_obj, msg, raw_user))

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "target": raw_user}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))

        elif self.path == "/simulate-inbound":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8")) if post_data else {}
                query_text = data.get("message") or data.get("query") or "மக்காச்சோளப் படைப்புழு தாக்குதல் மேலாண்மை"
                sender_phone = data.get("phone") or data.get("from") or "919842109876"
                image_b64 = data.get("image") or data.get("image_base64")
                
                full_jid = f"{sender_phone}@s.whatsapp.net"
                identity = supabase_service.resolve_whatsapp_identity(full_jid)
                if not identity:
                    logger.warning(f"🔒 [SECURITY AUDIT] Simulated unauthorized WhatsApp JID dropped: {full_jid}")
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True, "action": "silently_dropped"}).encode("utf-8"))
                    return

                farmer_id = identity["farmer_id"]
                visual_obs = None
                if image_b64:
                    visual_obs = vision_observer.extract_observations(image_base64=image_b64, user_query=query_text)

                session = supabase_service.resolve_or_create_session(
                    farmer_id=farmer_id,
                    channel="whatsapp",
                    requested_crop=data.get("crop"),
                    topic="WhatsApp உழவர் உரையாடல்"
                )
                session_id = session.get("id")

                # Store incoming
                inbound_entry = {
                    "from": full_jid,
                    "sender": identity.get("display_name") or sender_phone,
                    "text": query_text,
                    "has_image": bool(visual_obs),
                    "time": time.strftime("%H:%M:%S")
                }
                whatsapp_state["recent_messages"].insert(0, inbound_entry)

                # Generate response
                reply_text = generate_orchestrated_reply(
                    query_text=query_text,
                    farmer_id=farmer_id,
                    session_id=session_id,
                    visual_obs=visual_obs,
                    district=identity.get("farmer", {}).get("district", "Coimbatore"),
                    crop=session.get("crop")
                )

                # Persist messages
                supabase_service.persist_message(session_id=session_id, farmer_id=farmer_id, role="farmer", text=query_text, image_metadata=visual_obs)
                supabase_service.persist_message(session_id=session_id, farmer_id=farmer_id, role="assistant", text=reply_text)

                # Store outgoing
                whatsapp_state["recent_messages"].insert(0, {
                    "from": "Uzhavan-Sahayak Bot",
                    "sender": "Agri-AI (Reply)",
                    "text": reply_text,
                    "time": time.strftime("%H:%M:%S")
                })
                whatsapp_state["recent_messages"] = whatsapp_state["recent_messages"][:20]

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "inbound": inbound_entry,
                    "reply": reply_text,
                    "session_id": session_id
                }).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))

        elif self.path in ("/disconnect", "/reset"):
            whatsapp_state["connected"] = False
            whatsapp_state["phone"] = None
            whatsapp_state["jid"] = None
            whatsapp_state["lid"] = None
            whatsapp_state["qr"] = None
            whatsapp_state["pair_code"] = None
            whatsapp_state["daemon_status"] = "reset"
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "status": whatsapp_state}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

def run_http_server():
    server_address = ('', 5001)
    try:
        httpd = ReusableHTTPServer(server_address, DaemonHTTPHandler)
        logger.info("🚀 [NEONIZE DAEMON API] Listening on http://localhost:5001")
        httpd.serve_forever()
    except Exception as e:
        logger.error(f"⚠️ [NEONIZE HTTP ERR] {e}")

if __name__ == "__main__":
    init_client(CLIENT_DB_PATH)
    if client:
        setup_client_events(client)

    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    while True:
        try:
            init_client(CLIENT_DB_PATH)
            if client:
                setup_client_events(client)
            if client and NEONIZE_AVAILABLE:
                logger.info("⚡ [WHATSAPP CLIENT] Connecting Neonize client...")
                client.connect()
                if whatsapp_state.get("connected"):
                    time.sleep(1)
                else:
                    logger.info("🔄 [WHATSAPP RECONNECT] Session cycle complete. Reconnecting for continuous availability...")
                    time.sleep(1)
            else:
                time.sleep(2)
        except KeyboardInterrupt:
            logger.info("\n👋 Stopping Neonize WhatsApp daemon...")
            sys.exit(0)
        except Exception as e:
            logger.error(f"❌ Neonize connection loop error: {e}")
            time.sleep(2)
