import sys
from TTS.api import TTS

if len(sys.argv) < 3:
    print("Usage: python tts.py <text> <language>")
    sys.exit(1)

text = sys.argv[1]
language = sys.argv[2]

# Select model based on language
if language == "sw":
    model = "tts_models/sw/cv/vits"
else:
    model = "tts_models/en/ljspeech/tacotron2-DDC"

# Load the model
tts = TTS(model).to("cuda" if torch.cuda.is_available() else "cpu")

# Generate and save audio
tts.tts_to_file(text=text, file_path="output.wav")

print("TTS audio generated successfully!")
