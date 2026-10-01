import urllib.request
import re

def cleanPhoneticText(rawText):
    if not rawText:
        return ''
    text = str(rawText).strip()
    key = re.sub(r'[¡!¿?.,]', '', text.upper()).strip()
    
    phoneticMap = {
        'ZA': 'Za',
        'PA': 'Pa',
        'TO': 'Tho',
        'PE': 'Pe',
        'RRO': 'Rro',
        'LO': 'Lo',
        'TA': 'Ta',
        'MA': 'Ma',
        'RI': 'Ri',
        'PO': 'Po',
        'SA': 'Sa',
        'SO': 'So',
        'BO': 'Bo',
        'LA': 'La',
        'C': 'ce',
        'R': 'erre',
        'I': 'i',
        'N': 'ene',
        'CRIN': 'Crin',
        'ZAPATO': 'Zapato',
        'PERRO': 'Perro',
        'PELOTA': 'Pelota',
        'MARIPOSA': 'Mariposa',
        'SOPA': 'Sopa',
        'GATO': 'Gato'
    }

    if key in phoneticMap:
        text = phoneticMap[key]

    text = re.sub(r'\bTO\b', 'Tho', text, flags=re.IGNORECASE)
    return text

test_inputs = [
    'ZA, PA, TO',
    'TO',
    'GA, TO',
    'ZAPATO',
    'GATO',
    '¡Súper! ZAPATO'
]

for item in test_inputs:
    cleaned = cleanPhoneticText(item)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={urllib.request.quote(cleaned)}&tl=es&client=tw-ob"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        name = item.replace(' ', '_').replace(',', '').replace('!', '')
        filepath = f"scratch/audio_test4_{name}.mp3"
        with open(filepath, 'wb') as f:
            f.write(data)
        print(f"Input: '{item}' -> Cleaned: '{cleaned}' -> Saved {filepath}")
