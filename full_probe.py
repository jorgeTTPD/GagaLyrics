import whisperx
device="cpu"; ct="int8"
audio = whisperx.load_audio("/home/jorge/Music/Lady Gaga - Million Reasons.flac")
model = whisperx.load_model("medium.en", device, compute_type=ct, vad_method="silero")
result = model.transcribe(audio, batch_size=8)
for s in result["segments"]:
    if 30 < s["start"] < 80:
        print(f"[{s['start']:7.2f}-{s['end']:7.2f}] {s['text']}")
