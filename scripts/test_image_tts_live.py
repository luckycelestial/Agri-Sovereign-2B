import os
import sys
import json
import requests
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

print("--- Testing /api/query Image + Question Query ---")
r = requests.post('http://localhost:8000/api/query', json={
    'query': 'இந்த பயிரில் என்ன பிரச்சனை உள்ளது? என்ன மருந்து தெளிக்க வேண்டும்?',
    'image': f"data:image/png;base64,{TEST_IMAGE_BASE64}",
    'crop': 'Tomato',
    'district': 'Dindigul'
})

data = r.json()
print("Status Code:", r.status_code)
print("visual_observations:", json.dumps(data.get("visual_observations"), ensure_ascii=False))
print("answer_ta length:", len(data.get("answer_ta", "")))
print("spoken_ta length:", len(data.get("spoken_ta", "")))
print("spoken_ta preview:\n", data.get("spoken_ta", ""))
print("audio_id:", data.get("audio_id"))
print("audio_url:", data.get("audio_url"))
print("audio_status:", data.get("audio_status"))

audio_id = data.get("audio_id")
if audio_id:
    for attempt in range(10):
        t_res = requests.get(f"http://localhost:8000/api/tts/{audio_id}")
        t_data = t_res.json()
        print(f"TTS Poll attempt {attempt+1}: status={t_data.get('status')}, audio_url={t_data.get('audio_url')}")
        if t_data.get("status") == "ready":
            break
        time.sleep(1)

    audio_url = f"http://localhost:8000/audio/resp_{audio_id}.mp3"
    a_res = requests.get(audio_url)
    print("Audio file HTTP status:", a_res.status_code)
    print("Audio file size bytes:", len(a_res.content))
