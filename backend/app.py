"""
Multilingual Hate Speech Detection API
Flask backend with two detection methods:
1. Translation + BERT (dehatebert-mono-english)
2. True Multilingual (XLM-RoBERTa)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import re
from typing import Dict, Any, Optional, Tuple

# ML imports
try:
    from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: transformers not installed. Using rule-based detection only.")

try:
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = 0  # For consistent results
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False
    print("Warning: langdetect not installed.")

try:
    from googletrans import Translator
    TRANSLATE_AVAILABLE = True
except ImportError:
    TRANSLATE_AVAILABLE = False
    print("Warning: googletrans not installed.")

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"])

# Global model variables
english_classifier = None
multilingual_classifier = None
translator = None

# Hate word dictionaries for rule-based fallback
HATE_WORDS = {
    'english': [
        'hate', 'kill', 'die', 'stupid', 'idiot', 'dumb', 'ugly', 'loser',
        'trash', 'garbage', 'worthless', 'pathetic', 'disgusting', 'horrible',
        'terrible', 'awful', 'racist', 'sexist', 'bigot', 'nazi', 'terrorist',
        'retard', 'moron', 'imbecile', 'scum', 'vermin', 'slur', 'abuse'
    ],
    'hindi': [
        'बेवकूफ', 'गधा', 'कुत्ता', 'सूअर', 'हरामी', 'कमीना', 'साला',
        'गंदा', 'नफरत', 'मारना', 'मरना', 'बदसूरत', 'घटिया', 'नीच'
    ],
    'tamil': [
        'முட்டாள்', 'நாய்', 'பன்றி', 'கேவலம்', 'அசிங்கம்', 'கொல்',
        'வெறுப்பு', 'அழி', 'கெட்டவன்', 'மோசம்'
    ],
    'malayalam': [
        'വിഡ്ഢി', 'നായ', 'പന്നി', 'വൃത്തികെട്ട', 'വെറുപ്പ്', 'കൊല്ലുക',
        'മോശം', 'നികൃഷ്ടം', 'അധമൻ'
    ]
}

LANGUAGE_MAP = {
    'en': 'english',
    'hi': 'hindi',
    'ta': 'tamil',
    'ml': 'malayalam'
}

def load_models():
    """Load ML models on startup"""
    global english_classifier, multilingual_classifier, translator
    
    if ML_AVAILABLE:
        try:
            print("Loading English hate speech model...")
            english_classifier = pipeline(
                "text-classification",
                model="Hate-speech-CNERG/dehatebert-mono-english",
                return_all_scores=True
            )
            print("English model loaded successfully!")
        except Exception as e:
            print(f"Failed to load English model: {e}")
            english_classifier = None
        
        try:
            print("Loading multilingual model...")
            multilingual_classifier = pipeline(
                "text-classification",
                model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
                return_all_scores=True
            )
            print("Multilingual model loaded successfully!")
        except Exception as e:
            print(f"Failed to load multilingual model: {e}")
            multilingual_classifier = None
    
    if TRANSLATE_AVAILABLE:
        translator = Translator()

def detect_language(text: str) -> Tuple[str, str]:
    """Detect language of input text"""
    if LANGDETECT_AVAILABLE:
        try:
            lang_code = detect(text)
            lang_name = LANGUAGE_MAP.get(lang_code, 'english')
            return lang_code, lang_name
        except:
            pass
    return 'en', 'english'

def translate_to_english(text: str, source_lang: str) -> Tuple[str, bool]:
    """Translate text to English"""
    if source_lang == 'en':
        return text, False
    
    if TRANSLATE_AVAILABLE and translator:
        try:
            result = translator.translate(text, src=source_lang, dest='en')
            return result.text, True
        except Exception as e:
            print(f"Translation error: {e}")
    
    return text, False

def rule_based_detection(text: str, language: str) -> Dict[str, Any]:
    """Fallback rule-based hate speech detection"""
    text_lower = text.lower()
    
    # Check all languages
    hate_count = 0
    total_words = 0
    matched_words = []
    
    for lang, words in HATE_WORDS.items():
        for word in words:
            if word.lower() in text_lower:
                hate_count += 1
                matched_words.append(word)
    
    # Calculate score based on hate word density
    word_count = len(text.split())
    if word_count > 0:
        score = min(hate_count / word_count * 2, 1.0)
    else:
        score = 0.0
    
    # Boost score if multiple hate words found
    if hate_count >= 3:
        score = min(score + 0.3, 1.0)
    elif hate_count >= 2:
        score = min(score + 0.15, 1.0)
    
    label = "HATE" if score > 0.5 else "NOT HATE"
    
    return {
        "score": round(score, 4),
        "confidence": round(0.6 + (score * 0.3), 4),  # Lower confidence for rule-based
        "label": label,
        "method": "rule-based",
        "matched_keywords": matched_words[:5]  # Show up to 5 matched words
    }

def method1_detection(text: str) -> Dict[str, Any]:
    """
    Method 1: Translation + English BERT
    Translates non-English text to English, then uses dehatebert-mono-english
    """
    start_time = time.time()
    
    # Detect language
    lang_code, lang_name = detect_language(text)
    
    # Translate to English if needed
    translated_text, was_translated = translate_to_english(text, lang_code)
    
    result = {
        "original_text": text,
        "detected_language": lang_name,
        "language_code": lang_code,
        "translated_text": translated_text if was_translated else None,
        "was_translated": was_translated,
        "method": "Translation + BERT"
    }
    
    # Use ML model if available
    if english_classifier:
        try:
            predictions = english_classifier(translated_text)[0]
            
            # Find hate and non-hate scores
            hate_score = 0.0
            for pred in predictions:
                if pred['label'].lower() in ['hate', 'offensive', 'label_1', '1']:
                    hate_score = pred['score']
                    break
            
            # If no hate label found, use the highest score for negative sentiment
            if hate_score == 0:
                hate_score = max(p['score'] for p in predictions if p['label'].lower() not in ['non-hate', 'neither', 'label_0', '0'])
            
            result.update({
                "score": round(hate_score, 4),
                "confidence": round(max(p['score'] for p in predictions), 4),
                "label": "HATE" if hate_score > 0.5 else "NOT HATE",
                "raw_predictions": predictions
            })
        except Exception as e:
            print(f"Method 1 ML error: {e}")
            fallback = rule_based_detection(translated_text, 'english')
            result.update(fallback)
            result["fallback_reason"] = str(e)
    else:
        fallback = rule_based_detection(translated_text, 'english')
        result.update(fallback)
        result["fallback_reason"] = "ML model not available"
    
    result["processing_time"] = round(time.time() - start_time, 4)
    return result

def method2_detection(text: str) -> Dict[str, Any]:
    """
    Method 2: True Multilingual Detection
    Uses XLM-RoBERTa for direct multilingual hate speech detection
    """
    start_time = time.time()
    
    # Detect language
    lang_code, lang_name = detect_language(text)
    
    result = {
        "original_text": text,
        "detected_language": lang_name,
        "language_code": lang_code,
        "method": "True Multilingual (XLM-RoBERTa)"
    }
    
    # Use multilingual model if available
    if multilingual_classifier:
        try:
            predictions = multilingual_classifier(text)[0]
            
            # Map sentiment to hate speech (negative sentiment indicates potential hate)
            # XLM-RoBERTa sentiment: negative, neutral, positive
            hate_score = 0.0
            for pred in predictions:
                label = pred['label'].lower()
                if label in ['negative', 'label_0', '0']:
                    hate_score = pred['score']
                    break
            
            # Adjust score - pure negative sentiment doesn't always mean hate
            # Apply a scaling factor
            adjusted_score = hate_score * 0.8  # Scale down slightly
            
            result.update({
                "score": round(adjusted_score, 4),
                "confidence": round(max(p['score'] for p in predictions), 4),
                "label": "HATE" if adjusted_score > 0.5 else "NOT HATE",
                "raw_predictions": predictions
            })
        except Exception as e:
            print(f"Method 2 ML error: {e}")
            fallback = rule_based_detection(text, lang_name)
            result.update(fallback)
            result["fallback_reason"] = str(e)
    else:
        fallback = rule_based_detection(text, lang_name)
        result.update(fallback)
        result["fallback_reason"] = "ML model not available"
    
    result["processing_time"] = round(time.time() - start_time, 4)
    return result

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "ml_available": ML_AVAILABLE,
        "english_model_loaded": english_classifier is not None,
        "multilingual_model_loaded": multilingual_classifier is not None,
        "translation_available": TRANSLATE_AVAILABLE,
        "language_detection_available": LANGDETECT_AVAILABLE
    })

@app.route('/detect', methods=['POST'])
def detect_hate_speech():
    """
    Main detection endpoint
    Runs both methods and returns comparison results
    """
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data['text'].strip()
    
    if not text:
        return jsonify({"error": "Empty text provided"}), 400
    
    if len(text) > 5000:
        return jsonify({"error": "Text too long (max 5000 characters)"}), 400
    
    # Run both detection methods
    method1_result = method1_detection(text)
    method2_result = method2_detection(text)
    
    # Calculate reliability comparison
    score_diff = abs(method1_result['score'] - method2_result['score'])
    agreement = method1_result['label'] == method2_result['label']
    
    return jsonify({
        "input_text": text,
        "method1": method1_result,
        "method2": method2_result,
        "comparison": {
            "score_difference": round(score_diff, 4),
            "methods_agree": agreement,
            "reliability_note": "High agreement" if agreement and score_diff < 0.2 else 
                              "Moderate agreement" if agreement else "Methods disagree - review recommended"
        }
    })

@app.route('/detect/method1', methods=['POST'])
def detect_method1_only():
    """Translation + BERT method only"""
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data['text'].strip()
    if not text:
        return jsonify({"error": "Empty text provided"}), 400
    
    return jsonify(method1_detection(text))

@app.route('/detect/method2', methods=['POST'])
def detect_method2_only():
    """Multilingual method only"""
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data['text'].strip()
    if not text:
        return jsonify({"error": "Empty text provided"}), 400
    
    return jsonify(method2_detection(text))

@app.route('/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    return jsonify({
        "supported_languages": [
            {"code": "en", "name": "English", "script": "Latin"},
            {"code": "hi", "name": "Hindi", "script": "Devanagari"},
            {"code": "ta", "name": "Tamil", "script": "Tamil"},
            {"code": "ml", "name": "Malayalam", "script": "Malayalam"}
        ]
    })

@app.route('/examples', methods=['GET'])
def get_examples():
    """Get example texts for testing"""
    return jsonify({
        "examples": [
            {
                "language": "English",
                "hate": "I hate those people, they should all die",
                "not_hate": "I love spending time with my friends and family"
            },
            {
                "language": "Hindi",
                "hate": "वो सब बेवकूफ और गंदे लोग हैं",
                "not_hate": "आज का दिन बहुत अच्छा है"
            },
            {
                "language": "Tamil",
                "hate": "அவர்கள் எல்லாரும் முட்டாள்கள்",
                "not_hate": "இன்று நல்ல நாள்"
            },
            {
                "language": "Malayalam",
                "hate": "അവർ എല്ലാവരും വിഡ്ഢികളാണ്",
                "not_hate": "ഇന്ന് നല്ല ദിവസമാണ്"
            }
        ]
    })

if __name__ == '__main__':
    print("Starting Multilingual Hate Speech Detection API...")
    print("Loading models (this may take a few minutes)...")
    load_models()
    print("\nAPI ready!")
    print("Endpoints:")
    print("  POST /detect - Full detection with both methods")
    print("  POST /detect/method1 - Translation + BERT only")
    print("  POST /detect/method2 - Multilingual only")
    print("  GET /health - Health check")
    print("  GET /languages - Supported languages")
    print("  GET /examples - Example texts")
    app.run(debug=True, host='0.0.0.0', port=5000)
