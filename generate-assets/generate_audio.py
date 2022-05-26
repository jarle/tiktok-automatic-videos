import json
import re
import subprocess
import sys
from pathlib import Path

from google.cloud import texttospeech
from mutagen.mp3 import MP3


def synthesize_audio(text, outfile, gender='female'):
    client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Wavenet-F" if gender.lower(
        )[0] == 'f' else "en-US-Wavenet-D"
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        pitch=3.8,
        speaking_rate=1.35
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    with open(outfile, "wb") as out:
        out.write(response.audio_content)


if __name__ == "__main__":
    file = sys.argv[1]
    main(Path(file).resolve())
