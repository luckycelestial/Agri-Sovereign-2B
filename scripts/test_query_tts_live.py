import os
import sys
import json
import requests
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

print("--- Testing /api/query Text Query ---")
r = requests.post('http://localhost:8000/api/query', json={
    'query': 'என் மக்காச்சோளத்தில் இலைகள் மஞ்சளாகிறது என்ன செய்ய வேண்டும்?',
    'crop': 'Maize',
    'district': 'Coimbatore'
})

data = r.json()
print("Status Code:", r.status_code)
print("answer_ta length:", len(data.get("answer_ta", "")))
print("spoken_ta length:", len(data.get("spoken_ta", "")))
print("spoken_ta preview:\n", data.get("spoken_ta", ""))
print("audio_id:", data.get("audio_id"))
print("audio_url:", data.get("audio_url"))
print("audio_status:", data.get("audio_status"))

# Poll for audio readiness if status is processing
audio_id = data.get("audio_id")
if audio_id:
    for attempt in range(10):
        t_res = requests.get(f"http://localhost:8000/api/tts/{audio_id}")
        t_data = t_res.json()
        print(f"TTS Poll attempt {attempt+1}: status={t_data.get('status')}, audio_url={t_data.get('audio_url')}")
        if t_data.get("status") == "ready":
            break
        time.sleep(1)

    # Test downloading the audio file
    audio_url = f"http://localhost:8000/audio/resp_{audio_id}.mp3"
    a_res = requests.get(audio_url)
    print("Audio file HTTP status:", a_res.status_code)
    print("Audio file size bytes:", len(a_res.content))
    print("Audio content type:", a_res.headers.get("content-type"))
