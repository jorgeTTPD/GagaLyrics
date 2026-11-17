import json, sys, whisperx

device = "cpu"
compute_type = "int8"
audio_path = "public/audio/chorus.mp3"

audio = whisperx.load_audio(audio_path)
model = whisperx.load_model("medium.en", device, compute_type=compute_type, vad_method="silero")
result = model.transcribe(audio, batch_size=8)
print("=== ASR ===")
for s in result["segments"]:
    print(f"[{s['start']:.2f}-{s['end']:.2f}] {s['text']}")

LINES = [
    (0.42, 4.49, "I bow down to pray"),
    (4.49, 7.63, "I try to make the worst seem better"),
    (7.63, 11.62, "Lord, show me the way"),
    (11.62, 15.17, "To cut through all his worn out leather"),
    (15.17, 21.79, "I've got a hundred million reasons to walk away"),
    (21.79, 27.30, "But baby, I just need one good one to stay"),
]
segments = [{"start": a, "end": b, "text": t} for a, b, t in LINES]
align_model, metadata = whisperx.load_align_model(language_code="en", device=device)
aligned = whisperx.align(segments, align_model, metadata, audio, device, return_char_alignments=False)
print("=== FORCED ALIGNMENT ===")
out = []
for seg in aligned["segments"]:
    words = []
    for w in seg["words"]:
        if "start" not in w or "end" not in w:
            continue
        words.append({"w": w["word"], "start": round(w["start"], 3), "end": round(w["end"], 3)})
    out.append({"text": seg["text"].strip(), "start": round(seg["start"], 3), "end": round(seg["end"], 3), "words": words})
    print(f"[{seg['start']:.2f}-{seg['end']:.2f}] {seg['text'].strip()}")
    for w in words:
        print(f"      {w['start']:6.2f}-{w['end']:6.2f}  {w['w']}")
json.dump(out, open("src/lyrics.json", "w"), indent=2, ensure_ascii=False)
print("saved src/lyrics.json")
