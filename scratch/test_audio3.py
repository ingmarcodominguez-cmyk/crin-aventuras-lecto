import urllib.request
import os

os.makedirs('scratch/audio_test3', exist_ok=True)

test_phrases = {
    'tho_alone': 'Tho',
    'tho_lower_alone': 'tho',
    'gato_syll_tho': 'Ga, Tho',
    'gato_syll_tho_lower': 'ga, tho',
    'zapato_syll_tho': 'Za, Pa, Tho',
    'pelota_syll_tho': 'Pe, Lo, Ta',
    'mariposa_syll': 'Ma, Ri, Po, Sa',
    'perro_syll': 'Pe, Rro'
}

for name, phrase in test_phrases.items():
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={urllib.request.quote(phrase)}&tl=es&client=tw-ob"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            filepath = f"scratch/audio_test3/{name}.mp3"
            with open(filepath, 'wb') as f:
                f.write(data)
            print(f"Saved {filepath}")
    except Exception as e:
        print(f"Error {name}: {e}")
