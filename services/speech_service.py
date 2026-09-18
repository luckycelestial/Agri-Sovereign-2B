"""
Tamil Speech Normalizer & Zero-Cost Edge-TTS Provider with Long Response Chunking
Person 2 Implementation: Converts safety-validated agricultural answers into natural, speakable Tamil audio.
Handles chunked synthesis across sentence boundaries and stitches audio without truncation.
"""

import os
import re
import time
import hashlib
import asyncio
import logging
from typing import Dict, Any, List, Optional
import edge_tts

logger = logging.getLogger("uzhavan.speech")

STATIC_AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "audio")
os.makedirs(STATIC_AUDIO_DIR, exist_ok=True)


class TamilSpeechNormalizer:
    """
    Normalizes agricultural numbers, units, abbreviations, and chemical dosages
    into phonetic Tamil text for clear speech synthesis, and breaks long text
    into natural sentence chunks.
    """

    TAMIL_NUMBERS = {
        0: "பூஜ்ஜியம்", 1: "ஒன்று", 2: "இரண்டு", 3: "மூன்று", 4: "நான்கு",
        5: "ஐந்து", 6: "ஆறு", 7: "ஏழு", 8: "எட்டு", 9: "ஒன்பது", 10: "பத்து",
        11: "பதினொன்று", 12: "பன்னிரண்டு", 13: "பதின்மூன்று", 14: "பதினான்கு", 15: "பதினைந்து",
        16: "பதினாறு", 17: "பதினேழு", 18: "பதினெட்டு", 19: "பத்தொன்பது", 20: "இருபது",
        21: "இருபத்தியொன்று", 25: "இருபத்தைந்து", 30: "முப்பது", 40: "நாற்பது",
        50: "ஐம்பது", 60: "அறுபது", 70: "எழுபது", 75: "எழுபத்தைந்து", 80: "எண்பது",
        90: "தொண்ணூறு", 100: "நூறு", 200: "இருநூறு", 500: "ஐந்நூறு", 1000: "ஆயிரம்"
    }

    @classmethod
    def num_to_tamil(cls, num_str: str) -> str:
        try:
            if "." in num_str:
                parts = num_str.split(".")
                int_part = int(parts[0])
                dec_part = parts[1]
                int_tamil = cls.TAMIL_NUMBERS.get(int_part, str(int_part))
                dec_tamils = " ".join([cls.TAMIL_NUMBERS.get(int(d), d) for d in dec_part])
                return f"{int_tamil} புள்ளி {dec_tamils}"
            else:
                val = int(num_str)
                return cls.TAMIL_NUMBERS.get(val, str(val))
        except Exception:
            return num_str

    @classmethod
    def create_spoken_ta(cls, text: str) -> str:
        """
        Creates a dedicated concise spoken Tamil response from answer_ta.
        Strips markdown, emojis, tables, links, and formatting.
        Preserves complete agronomic findings, management advice, and safety instructions
        with natural Tamil sentence boundaries.
        """
        if not text:
            return ""

        s = text

        # 1. Strip Markdown syntax
        s = re.sub(r'[*#_`~]', '', s)
        s = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', s)  # links
        s = re.sub(r'^\s*[-•\d+\.]+\s*', '', s, flags=re.MULTILINE)  # list markers
        s = re.sub(r'\|[^\n]+\|', ' ', s)  # markdown tables

        # 2. Strip emojis and non-speech visual indicators
        s = re.sub(r'[\U00010000-\U0010ffff]', '', s)
        s = re.sub(r'[\u2600-\u27bf\u2300-\u23ff\u2b50\u200d\ufe0f⛔🛡️✅⚠️💡📌🌾📍⏳🌽📋🧑‍🌾🌱🌿🧪🔍🔎]', '', s)

        # 3. Clean UI headers, symbols, and English parenthetical notes
        s = re.sub(r'&', ' மற்றும் ', s)
        s = re.sub(r'உழவன் சகாயக் வேளாண் AI.*?\n', '', s)
        s = re.sub(r'மண்டலம்:[^\n]+\n', '', s)
        s = re.sub(r'ஆதாரம்:[^\n]+', '', s)
        s = re.sub(r'https?://\S+', '', s)

        # 4. Check if this is an explicit Safety Block / Prohibited Chemical response
        is_safety_block = ("முழுமையாக தடைசெய்யப்பட்டுள்ளது" in s or 
                           "தடைசெய்யப்பட்ட பூச்சிக்கொல்லி" in s or 
                           ("CIBRC சட்டப்பூர்வ பாதுகாப்பு எச்சரிக்கை" in s and "தடைசெய்யப்பட்ட" in s))
        
        if is_safety_block:
            alert_parts = ["சட்டப்பூர்வ பாதுகாப்பு எச்சரிக்கை."]
            
            # Find reason for block
            for line in s.split('\n'):
                line = line.strip()
                if any(w in line for w in ["தடைசெய்யப்பட்ட", "அபாயகரமான", "நச்சுத்தன்மை", "காரணம்"]):
                    clean_l = re.sub(r'^[.\s:]+', '', line).strip()
                    if clean_l and len(clean_l) < 200:
                        alert_parts.append(clean_l)
                        break
            
            # Find safe alternative
            for line in s.split('\n'):
                line = line.strip()
                if any(w in line for w in ["பாதுகாப்பான மாற்று", "மாற்று மருந்து", "பரிந்துரைக்கப்படும் மருந்து", "பரிந்துரை:"]):
                    clean_l = re.sub(r'^[.\s:]+', '', line).strip()
                    if clean_l and len(clean_l) < 250:
                        alert_parts.append(clean_l)
                        break

            alert_parts.append("பாதுகாப்பு விதிமுறைகளை பின்பற்றி மட்டுமே மருந்துகளை தெளிக்கவும்.")
            combined = ". ".join(alert_parts)
            return cls.normalize(combined)

        # 5. Extract structured voice elements from standard advisory (Text and Multimodal Vision responses)
        clean_lines = []
        for l in s.split('\n'):
            cl = re.sub(r'^[.\s:\-–—]+', '', l).strip()
            if not cl or len(cl) < 4:
                continue
            # Skip boilerplate headers
            if any(b in cl for b in ["வேளாண் AI", "மண்டலம்:"]):
                continue
            clean_lines.append(cl)

        if not clean_lines:
            return ""

        combined = ". ".join(clean_lines)
        if "வேளாண்மை அலுவலரை" not in combined:
            combined += ". மேலதிக விவரங்களுக்கு உங்கள் பகுதி வேளாண்மை அலுவலரை அணுகவும்."

        return cls.normalize(combined)

    @classmethod
    def normalize(cls, text: str) -> str:
        """
        Normalizes acronyms, units, dosages, numbers, and cleans punctuation.
        """
        if not text:
            return ""

        s = text

        # 1. Acronyms & Institutional Abbreviations
        s = re.sub(r'\bTNAU\b', 'தமிழ்நாடு வேளாண்மை பல்கலைக்கழகம்', s)
        s = re.sub(r'\bICAR\b', 'இந்திய வேளாண் ஆராய்ச்சி கவுன்சில்', s)
        s = re.sub(r'\bCIBRC\b', 'மத்திய பூச்சிக்கொல்லி வாரியம்', s)
        s = re.sub(r'\bKVK\b', 'வேளாண் அறிவியல் நிலையம்', s)
        s = re.sub(r'\bPHI\b', 'அறுவடைக்கு முன் காத்திருப்பு காலம்', s)
        s = re.sub(r'\bNPK\b', 'என் பி கே சத்துக்கள்', s)
        s = re.sub(r'\bpH\b', 'கார அமிலத்தன்மை', s)
        s = re.sub(r'\bSC\b', 'எஸ் சி கரைசல்', s)
        s = re.sub(r'\bWP\b', 'டபிள்யூ பி தூள்', s)
        s = re.sub(r'\bSG\b', 'எஸ் ஜி குறுணை', s)
        s = re.sub(r'\bEC\b', 'இ சி திரவம்', s)
        s = re.sub(r'\bSP\b', 'எஸ் பி தூள்', s)
        s = re.sub(r'\bppm\b', 'பி பி எம்', s)

        # 2. Units & Dosages
        s = re.sub(r'(\d+(?:\.\d+)?)\s*(?:ml/L|ml/l|மில்லி/லிட்டர்)', lambda m: f"{cls.num_to_tamil(m.group(1))} மில்லி லிட்டர் ஒரு லிட்டருக்கு", s)
        s = re.sub(r'(\d+(?:\.\d+)?)\s*(?:g/L|g/l|கிராம்/லிட்டர்)', lambda m: f"{cls.num_to_tamil(m.group(1))} கிராம் ஒரு லிட்டருக்கு", s)
        s = re.sub(r'(\d+(?:\.\d+)?)\s*(?:ml|மில்லி)', lambda m: f"{cls.num_to_tamil(m.group(1))} மில்லி", s)
        s = re.sub(r'(\d+(?:\.\d+)?)\s*(?:g|gm|கிராம்)', lambda m: f"{cls.num_to_tamil(m.group(1))} கிராம்", s)
        s = re.sub(r'(\d+(?:\.\d+)?)\s*(?:kg|கிலோ)', lambda m: f"{cls.num_to_tamil(m.group(1))} கிலோ", s)
        s = re.sub(r'(\d+(?:\.\d+)?)\s*%', lambda m: f"{cls.num_to_tamil(m.group(1))} சதவீதம்", s)
        s = re.sub(r'(\d+)\s*நாட்கள்', lambda m: f"{cls.num_to_tamil(m.group(1))} நாட்கள்", s)
        s = re.sub(r'(\d+)\s*நாள்', lambda m: f"{cls.num_to_tamil(m.group(1))} நாள்", s)

        # 3. Clean punctuation, duplicate dots, and newlines
        s = re.sub(r'\n+', '. ', s)
        s = re.sub(r'[:\-–—]', ' ', s)
        s = re.sub(r'\.+', '.', s)
        s = re.sub(r'^[.\s]+', '', s)
        s = re.sub(r'\s*\.\s*\.', '.', s)
        s = re.sub(r'\s+', ' ', s).strip()

        return s

    @classmethod
    def chunk_spoken_text(cls, spoken_text: str, max_chunk_chars: int = 380) -> List[str]:
        """
        Splits spoken Tamil text cleanly at natural sentence/paragraph boundaries.
        Guarantees that 100% of sentences are included without truncation.
        """
        if not spoken_text:
            return []

        # Split on natural Tamil/English sentence terminators: . ? ! । \n
        raw_sentences = re.split(r'([.?!।]\s*)', spoken_text)
        
        sentences = []
        for i in range(0, len(raw_sentences)-1, 2):
            sent = (raw_sentences[i] + raw_sentences[i+1]).strip()
            if sent:
                sentences.append(sent)
        if len(raw_sentences) % 2 == 1 and raw_sentences[-1].strip():
            sentences.append(raw_sentences[-1].strip())

        chunks = []
        current_chunk = ""

        for s in sentences:
            if not s:
                continue
            if len(s) > max_chunk_chars:
                # Long sentence: split on comma/semicolon/conjunction boundaries
                sub_parts = re.split(r'([,;]\s*|\s+மற்றும்\s+|\s+அல்லது\s+)', s)
                sub_accum = ""
                for p in sub_parts:
                    if len(sub_accum) + len(p) <= max_chunk_chars:
                        sub_accum += p
                    else:
                        if sub_accum.strip():
                            chunks.append(sub_accum.strip())
                        sub_accum = p
                if sub_accum.strip():
                    if current_chunk and len(current_chunk) + len(sub_accum) + 1 <= max_chunk_chars:
                        current_chunk += " " + sub_accum.strip()
                    else:
                        if current_chunk.strip():
                            chunks.append(current_chunk.strip())
                        current_chunk = sub_accum.strip()
            else:
                if not current_chunk:
                    current_chunk = s
                elif len(current_chunk) + len(s) + 1 <= max_chunk_chars:
                    current_chunk += " " + s
                else:
                    chunks.append(current_chunk.strip())
                    current_chunk = s

        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks


class EdgeTTSProvider:
    """
    Asynchronous Edge-TTS Speech Service generating zero-cost Tamil audio.
    Supports instant cache lookup, sentence-boundary chunking, and chunk-stitched audio.
    """

    def __init__(self, voice: str = "ta-IN-ValluvarNeural"):
        self.voice = voice or os.getenv("TTS_VOICE", "ta-IN-ValluvarNeural")
        self.output_dir = STATIC_AUDIO_DIR
        self._tasks: Dict[str, Dict[str, Any]] = {}

    def get_audio_info(self, text: str, is_already_normalized: bool = False) -> Dict[str, Any]:
        """
        Fast non-blocking lookup: returns audio_id, cache status, and audio_url if cached.
        Uses full spoken_ta hash without character truncation.
        """
        if not text or not text.strip():
            return {
                "audio_id": None,
                "audio_url": None,
                "audio_status": "none",
                "spoken_ta": "",
                "cached": False,
                "voice": self.voice
            }

        spoken_text = text if is_already_normalized else TamilSpeechNormalizer.create_spoken_ta(text)

        audio_id = hashlib.md5(f"{self.voice}:{spoken_text}".encode("utf-8")).hexdigest()
        filename = f"resp_{audio_id}.mp3"
        filepath = os.path.join(self.output_dir, filename)
        audio_url = f"/audio/{filename}"

        if os.path.exists(filepath) and os.path.getsize(filepath) > 500:
            return {
                "audio_id": audio_id,
                "audio_url": audio_url,
                "audio_status": "ready",
                "spoken_ta": spoken_text,
                "cached": True,
                "voice": self.voice,
                "tts_ms": 1.0
            }

        return {
            "audio_id": audio_id,
            "audio_url": None,
            "audio_status": "processing",
            "spoken_ta": spoken_text,
            "cached": False,
            "voice": self.voice
        }

    async def _synthesize_chunk_with_retry(self, chunk: str, max_retries: int = 3) -> bytes:
        """
        Synthesize a single audio chunk with automatic retry on transient network errors.
        Uses communicate.save() with clean temporary files.
        """
        last_err = None
        tmp_path = os.path.join(self.output_dir, f"tmp_chunk_{int(time.time()*1000)}_{os.getpid()}.mp3")
        for attempt in range(max_retries):
            try:
                communicate = edge_tts.Communicate(chunk, self.voice)
                await communicate.save(tmp_path)
                if os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 100:
                    with open(tmp_path, "rb") as f:
                        chunk_bytes = f.read()
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass
                    return chunk_bytes
            except Exception as e:
                last_err = e
                logger.warning(f"[EDGE_TTS] Chunk attempt {attempt+1}/{max_retries} failed: {e}")
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass
                if attempt < max_retries - 1:
                    await asyncio.sleep(1.0)
        raise RuntimeError(f"Chunk synthesis failed: {last_err}")

    async def synthesize_async_task(self, audio_id: str, spoken_text: str) -> Dict[str, Any]:
        """
        Chunked background synthesis task for FastAPI BackgroundTasks.
        Splits long Tamil responses at natural sentence boundaries, synthesizes each chunk,
        verifies all chunks succeed, and combines them into one unified MP3 file.
        """
        filename = f"resp_{audio_id}.mp3"
        filepath = os.path.join(self.output_dir, filename)
        audio_url = f"/audio/{filename}"

        # If already on disk and complete, mark ready immediately
        if os.path.exists(filepath) and os.path.getsize(filepath) > 500:
            res = {
                "audio_id": audio_id,
                "status": "ready",
                "audio_url": audio_url,
                "tts_ms": 1.0,
                "cached": True,
                "num_chunks": 1
            }
            self._tasks[audio_id] = res
            return res

        self._tasks[audio_id] = {"status": "processing", "audio_id": audio_id, "start_time": time.monotonic()}
        t0 = time.monotonic()

        try:
            chunks = TamilSpeechNormalizer.chunk_spoken_text(spoken_text, max_chunk_chars=480)
            if not chunks:
                chunks = [spoken_text]

            chunk_audio_bytes: List[bytes] = []

            for idx, chunk in enumerate(chunks):
                chunk_bytes = await self._synthesize_chunk_with_retry(chunk)
                chunk_audio_bytes.append(chunk_bytes)
                if idx < len(chunks) - 1:
                    await asyncio.sleep(0.2)

            # Combine all chunk byte streams into a unified MP3
            combined_audio = b"".join(chunk_audio_bytes)
            with open(filepath, "wb") as f:
                f.write(combined_audio)

            latency_ms = round((time.monotonic() - t0) * 1000, 2)
            res = {
                "audio_id": audio_id,
                "status": "ready",
                "audio_url": audio_url,
                "tts_ms": latency_ms,
                "num_chunks": len(chunks),
                "audio_size_bytes": len(combined_audio),
                "cached": False
            }
            self._tasks[audio_id] = res
            logger.info(f"[EDGE_TTS] Chunked audio generated: {filename} ({len(chunks)} chunks, {len(combined_audio)} bytes) in {latency_ms}ms")
            return res

        except Exception as e:
            latency_ms = round((time.monotonic() - t0) * 1000, 2)
            logger.warning(f"[EDGE_TTS] Chunked audio synthesis error: {e}")
            res = {
                "audio_id": audio_id,
                "status": "failed",
                "audio_url": None,
                "error": str(e),
                "tts_ms": latency_ms
            }
            self._tasks[audio_id] = res
            return res

    def get_status(self, audio_id: str) -> Dict[str, Any]:
        """
        Poll status of an audio_id.
        """
        if not audio_id:
            return {"audio_id": None, "status": "failed", "audio_url": None}

        filename = f"resp_{audio_id}.mp3"
        filepath = os.path.join(self.output_dir, filename)

        if os.path.exists(filepath) and os.path.getsize(filepath) > 500:
            task_info = self._tasks.get(audio_id, {})
            return {
                "audio_id": audio_id,
                "status": "ready",
                "audio_url": f"/audio/{filename}",
                "tts_ms": task_info.get("tts_ms", 1.0),
                "num_chunks": task_info.get("num_chunks", 1),
                "audio_size_bytes": os.path.getsize(filepath)
            }

        if audio_id in self._tasks:
            return self._tasks[audio_id]

        return {"audio_id": audio_id, "status": "processing", "audio_url": None}

    async def synthesize(self, text: str) -> Dict[str, Any]:
        """
        Direct synthesis for testing or synchronous usage.
        """
        info = self.get_audio_info(text)
        if info["cached"]:
            return {
                "audio_id": info["audio_id"],
                "audio_url": info["audio_url"],
                "latency_ms": 1.0,
                "voice": self.voice,
                "spoken_ta": info["spoken_ta"],
                "cached": True
            }

        audio_id = info["audio_id"]
        spoken_text = info["spoken_ta"]
        res = await self.synthesize_async_task(audio_id, spoken_text)
        return {
            "audio_id": audio_id,
            "audio_url": res.get("audio_url"),
            "latency_ms": res.get("tts_ms", 0.0),
            "voice": self.voice,
            "spoken_ta": spoken_text,
            "num_chunks": res.get("num_chunks", 1),
            "audio_size_bytes": res.get("audio_size_bytes", 0),
            "cached": res.get("cached", False),
            "error": res.get("error")
        }


# Singleton instance
speech_service = EdgeTTSProvider()
