import json
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
    model = genai.GenerativeModel("gemini-2.0-flash")

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


def get_cuisine_from_mood(mood_text):
    """Route to the configured AI provider."""
    if settings.AI_PROVIDER == "openai":
        return get_cuisine_from_mood_openai(mood_text)
    else:
        return get_cuisine_from_mood_gemini(mood_text)