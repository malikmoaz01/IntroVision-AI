import io
import logging
import socketio
import json
import requests
import tempfile
import os
from pydub import AudioSegment
import speech_recognition as sr
import eventlet
from eventlet import wsgi
from werkzeug.serving import WSGIRequestHandler
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)

sio = socketio.Server(cors_allowed_origins="*")
app = socketio.WSGIApp(sio)

recognizer = sr.Recognizer()
audio_buffer = io.BytesIO()


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")

def analyze_interview_with_grok(transcription):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are an expert interview coach and HR professional. Analyze this interview transcription and provide detailed feedback.
    
    Interview Transcription:
    "{transcription}"
    
    Please provide:
    1. Overall performance score (0-100)
    2. Detailed feedback on communication skills, confidence, clarity, and professionalism
    3. Specific areas for improvement (as a list)
    4. Positive aspects of the performance
    
    Format your response as constructive and encouraging feedback that will help the candidate improve.
    """
    
    data = {
        "model": "llama-3.1-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": "You are an expert interview coach providing constructive feedback to help candidates improve their interview performance."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            feedback_text = result['choices'][0]['message']['content']
            
            score = extract_score_from_feedback(feedback_text)
            improvements = extract_improvements_from_feedback(feedback_text)
            
            return {
                "feedback": feedback_text,
                "score": score,
                "improvements": improvements
            }
        else:
            logging.error(f"Groq API error: {response.status_code} - {response.text}")
            return generate_fallback_feedback()
    except Exception as e:
        logging.error(f"Error calling Groq API: {e}")
        return generate_fallback_feedback()

def extract_score_from_feedback(feedback):
    try:
        lines = feedback.split('\n')
        for line in lines:
            if 'score' in line.lower() and any(char.isdigit() for char in line):
                numbers = [int(s) for s in line.split() if s.isdigit() and 0 <= int(s) <= 100]
                if numbers:
                    return numbers[0]
        return 75
    except:
        return 75

def extract_improvements_from_feedback(feedback):
    try:
        improvements = []
        lines = feedback.split('\n')
        in_improvement_section = False
        
        for line in lines:
            line = line.strip()
            if 'improvement' in line.lower() or 'areas for' in line.lower():
                in_improvement_section = True
                continue
            if in_improvement_section and line:
                if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                    improvements.append(line[1:].strip())
                elif line[0].isdigit() and '.' in line:
                    improvements.append(line.split('.', 1)[1].strip())
                elif len(improvements) > 0 and not line[0].isupper():
                    continue
                else:
                    in_improvement_section = False
        
        if not improvements:
            improvements = [
                "Practice speaking more clearly and at a steady pace",
                "Prepare more specific examples from your experience",
                "Work on maintaining eye contact and confident body language"
            ]
        
        return improvements[:5]
    except:
        return [
            "Practice speaking more clearly and at a steady pace",
            "Prepare more specific examples from your experience",
            "Work on maintaining eye contact and confident body language"
        ]

def generate_fallback_feedback():
    return {
        "feedback": "Thank you for completing your interview! Based on general best practices, focus on speaking clearly, providing specific examples, and maintaining confident body language. Keep practicing to improve your interview skills!",
        "score": 75,
        "improvements": [
            "Practice speaking more clearly and at a steady pace",
            "Prepare more specific examples from your experience",
            "Work on maintaining eye contact and confident body language",
            "Research the company and role thoroughly before interviews"
        ]
    }

def simple_app(environ, start_response):
    path = environ.get("PATH_INFO")
    method = environ.get("REQUEST_METHOD")

    if method == "OPTIONS":
        headers = [
            ("Access-Control-Allow-Origin", "*"),
            ("Access-Control-Allow-Methods", "POST, OPTIONS"),
            ("Access-Control-Allow-Headers", "Content-Type"),
        ]
        start_response("200 OK", headers)
        return [b""]

    if path == "/process_video" and method == "POST":
        headers = [
            ("Content-Type", "application/json"),
            ("Access-Control-Allow-Origin", "*"),
            ("Access-Control-Allow-Methods", "POST, OPTIONS"),
            ("Access-Control-Allow-Headers", "Content-Type"),
        ]
        
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
            input_data = environ['wsgi.input'].read(content_length)
            
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
                temp_file.write(input_data)
                temp_file_path = temp_file.name
            
            try:
                audio = AudioSegment.from_file(temp_file_path)
                wav_path = temp_file_path.replace('.webm', '.wav')
                audio.export(wav_path, format="wav")
                
                with sr.AudioFile(wav_path) as source:
                    audio_data = recognizer.record(source)
                    transcription = recognizer.recognize_google(audio_data)
                
                ai_analysis = analyze_interview_with_grok(transcription)
                
                os.unlink(temp_file_path)
                os.unlink(wav_path)
                
                response_data = {
                    "message": "Video processed successfully!",
                    "transcription": transcription,
                    "feedback": ai_analysis["feedback"],
                    "score": ai_analysis["score"],
                    "improvements": ai_analysis["improvements"]
                }
                
            except Exception as e:
                logging.error(f"Processing error: {e}")
                os.unlink(temp_file_path)
                response_data = {
                    "error": "Failed to process video",
                    "feedback": "Unable to process the video file. Please try again with a different format.",
                    "score": 0,
                    "improvements": ["Try recording in a different format", "Ensure good audio quality"]
                }
            
        except Exception as e:
            logging.error(f"Request processing error: {e}")
            response_data = {
                "error": "Invalid request",
                "feedback": "There was an error processing your request.",
                "score": 0,
                "improvements": []
            }
        
        start_response("200 OK", headers)
        return [json.dumps(response_data).encode('utf-8')]

    return app(environ, start_response)

@sio.event
def connect(sid, environ):
    logging.info(f"Client connected: {sid}")
    sio.emit("feedback", "Connected to AI Interview Assistant!", to=sid)

@sio.event
def video_chunk(sid, data):
    global audio_buffer
    logging.info(f"Video chunk received: {len(data)} bytes")
    audio_buffer.write(data)

@sio.event
def video_complete(sid):
    global audio_buffer
    logging.info("Processing video for AI analysis...")
    
    try:
        # Step 1: Converting video to audio
        sio.emit("processing_step", {"step": 1}, to=sid)
        audio_buffer.seek(0)
        
        if audio_buffer.getvalue() == b'':
            logging.error("Empty audio buffer")
            sio.emit("ai_feedback", generate_fallback_feedback(), to=sid)
            return

        audio = AudioSegment.from_file(audio_buffer, format="webm")
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        wav_io.seek(0)

        # Step 2: Transcribing audio to text
        sio.emit("processing_step", {"step": 2}, to=sid)
        
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            transcription = recognizer.recognize_google(audio_data, timeout=10)
            
            logging.info(f"Transcription: {transcription}")
            sio.emit("transcription", {"text": transcription}, to=sid)
            
            # Step 3: AI Analysis
            sio.emit("processing_step", {"step": 3}, to=sid)
            logging.info("Analyzing with Grok AI...")
            
            # Quick timeout for AI analysis
            ai_analysis = analyze_interview_with_grok(transcription)
            
            # Step 4: Generating feedback
            sio.emit("processing_step", {"step": 4}, to=sid)
            
            sio.emit("ai_feedback", {
                "feedback": ai_analysis["feedback"],
                "score": ai_analysis["score"],
                "improvements": ai_analysis["improvements"],
                "transcription": transcription
            }, to=sid)

    except sr.UnknownValueError:
        logging.error("Could not understand audio")
        sio.emit("transcription", {"text": "Could not understand the audio clearly. Please try speaking more clearly."}, to=sid)
        fallback = generate_fallback_feedback()
        sio.emit("ai_feedback", fallback, to=sid)
    except sr.RequestError as e:
        logging.error(f"Speech recognition error: {e}")
        sio.emit("transcription", {"text": f"Speech recognition service error: {e}"}, to=sid)
        fallback = generate_fallback_feedback()
        sio.emit("ai_feedback", fallback, to=sid)
    except Exception as e:
        logging.error(f"Processing error: {e}")
        sio.emit("transcription", {"text": f"Processing error: {e}"}, to=sid)
        fallback = generate_fallback_feedback()
        sio.emit("ai_feedback", fallback, to=sid)
    finally:
        audio_buffer = io.BytesIO()

class QuietHandler(WSGIRequestHandler):
    def log_request(self, code='-', size='-'):
        pass

if __name__ == "__main__":
    logging.info("🚀 AI Interview Assistant Server running at http://localhost:5000")
    logging.info("🤖 Powered by Grok LLM for intelligent feedback")
    wsgi.server(eventlet.listen(("0.0.0.0", 5000)), simple_app, log=logging.getLogger('wsgi'))