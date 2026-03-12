import json
import random
from django.conf import settings

CUISINE_OPTIONS = [
    "Italian", "Mexican", "Japanese", "Chinese", "Indian", "Thai",
    "Korean", "Vietnamese", "Mediterranean", "American", "French",
    "Ethiopian", "Greek", "Turkish", "Peruvian", "Brazilian",
    "Jamaican", "Lebanese", "Spanish", "Filipino",
]

SYSTEM_PROMPT = f"""You are a fun, opinionated food recommender. The user will describe their mood, 
vibe, or craving in their own words. Your job is to pick the BEST cuisine type for them.

Available cuisines: {', '.join(CUISINE_OPTIONS)}

Respond with ONLY valid JSON in this exact format, nothing else:
{{"cuisine": "Italian", "reason": "One fun sentence explaining why this matches their mood"}}

Be creative and playful with your reasons. Match the energy of their message."""


def get_cuisine_from_mood_openai(mood_text):
    """Use OpenAI to pick a cuisine based on mood."""
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": mood_text},
        ],
        temperature=0.9,
        max_tokens=100,
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


def get_cuisine_from_mood_gemini(mood_text):
    """Use Gemini to pick a cuisine based on mood."""
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash-lite")

    response = model.generate_content(
        f"{SYSTEM_PROMPT}\n\nUser mood: {mood_text}",
        generation_config=genai.GenerationConfig(
            temperature=0.9,
            max_output_tokens=100,
        ),
    )

    text = response.text.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


def get_cuisine_from_mood_groq(mood_text):
    """Use Groq (Llama 3) to pick a cuisine based on mood."""
    from groq import Groq

    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": mood_text},
        ],
        temperature=0.9,
        max_tokens=100,
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


def get_cuisine_from_mood(mood_text):
    """Route to the configured AI provider, with fallback."""
    try:
        if settings.AI_PROVIDER == "openai":
            return get_cuisine_from_mood_openai(mood_text)
        elif settings.AI_PROVIDER == "groq":
            return get_cuisine_from_mood_groq(mood_text)
        else:
            return get_cuisine_from_mood_gemini(mood_text)
    except Exception as e:
        print(f"AI fallback triggered: {e}")
        pick = random.choice(CUISINE_OPTIONS)
        fallback_reasons = [
            f"AI is taking a nap, but trust me - {pick} is the move right now",
            f"Couldn't read your vibe, but the universe says {pick} tonight",
            f"AI quota hit, but fate chose {pick} for you. Don't fight it",
            f"The food gods whispered {pick}. Who are we to argue?",
        ]
        return {"cuisine": pick, "reason": random.choice(fallback_reasons)}