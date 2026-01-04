import speech_recognition as sr
from gtts import gTTS
import os
import uuid

def speech_to_text(audio_file_path):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(audio_file_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return text
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")
        return None
    except Exception as e:
        print(f"Error in speech_to_text: {e}")
        return None

def text_to_speech(text, output_dir="static/audio"):
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(output_dir, filename)
        
        tts = gTTS(text=text, lang='en')
        tts.save(filepath)
        
        return filepath
    except Exception as e:
        print(f"Error in text_to_speech: {e}")
        return None
