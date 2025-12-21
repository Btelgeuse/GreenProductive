import os 
import sys
import json
import pyaudio
from vosk import Model, KaldiRecognizer


# Model path
model_path = os.path.join("models", "vosk-model-small-en-us-0.15")
model = Model(model_path)
recognizer = KaldiRecognizer(model, 16000)

#Setup PyAudio
p = pyaudio.PyAudio()
stream = p.open(
    format=pyaudio.paInt16,
    channels=1,
    rate=16000,
    input=True,
    frames_per_buffer=8192
)
stream.start_stream()
print("Listening.. Press Ctrl+C to stop.")

try:
    while True:
        data = stream.read(8192, exception_on_overflow=False)
        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            if result["text"]:
                # Print to stdout with no extra spaces, flush immediately
                print(f"Text: {result['text']}", flush=True)
        else:
            partial = json.loads(recognizer.PartialResult())
            if partial['partial']:
                # Print to stdout with no extra spaces, flush immediately
                print(f"Partial: {partial['partial']}", flush=True)
except KeyboardInterrupt:
    print("\nStopping...")
finally:
    stream.stop_stream()
    stream.close()
    p.terminate()
