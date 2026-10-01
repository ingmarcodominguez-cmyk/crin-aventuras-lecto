import urllib.request
import os

os.makedirs('scratch/audio_test', exist_ok=True)

test_phrases = {
    'zapato_orig': 'ZAPATO',
    'zapato_syll_orig': 'Za, Pa, To',
    'zapato_syll_to_accent': 'Za, Pa, Tó',
    'zapato_syll_toh': 'Za, Pa, Toh',
    'zapato_syll_t_o': 'Za, Pa, T-O',
    'zapato_syll_too': 'Za, Pa, Too',
    'to_orig': 'TO',
    'to_accent': 'Tó',
    'to_toh': 'Toh',
    'to_too': 'Too',
    'gato_orig': 'GATO',
    'gato_syll_orig': 'Ga, To',
    'gato_syll_accent': 'Ga, Tó'
}

for name, phrase in test_phrases.items():
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={urllib.request.quote(phrase)}&tl=es&client=tw-ob"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            filepath = f"scratch/audio_test/{name}.mp3"
            with open(filepath, 'wb') as f:
                f.write(data)
            print(f"Saved {filepath} ({len(data)} bytes)")
    except Exception as e:
        print(f"Error {name}: {e}")
