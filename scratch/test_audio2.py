import urllib.request
import os

os.makedirs('scratch/audio_test2', exist_ok=True)

test_phrases = {
    'c01_period': 'Za, Pa, To.',
    'c02_lower': 'Za, Pa, to.',
    'c03_dash': 'Za - Pa - To',
    'c04_periods': 'Za. Pa. To.',
    'c05_excl': 'Za! Pa! To!',
    'c06_t_o': 'Za, Pa, t-o',
    'c07_t_space_o': 'Za, Pa, T o',
    'c08_t_dash_o': 'Za, Pa, T-o.',
    'c09_t_dot_o': 'Za, Pa, T.O.',
    'c10_th_o': 'Za, Pa, Tho',
    'c11_tho_period': 'Za, Pa, Tho.',
    'c12_tau': 'Za, Pa, Tao',
    'c13_two_os': 'Za, Pa, Too',
    'c14_t_lowercas_o': 'Za, Pa, t o.',
    'c15_to_dot': 'To.',
    'c16_to_excl': 'To!',
    'c17_to_dash': 'T-o',
    'c18_to_lower_dot': 'to.',
    'c19_gato_syll_period': 'Ga, To.',
    'c20_gato_syll_lower': 'Ga, to.',
    'c21_gato_syll_excl': 'Ga! To!'
}

for name, phrase in test_phrases.items():
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={urllib.request.quote(phrase)}&tl=es&client=tw-ob"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            filepath = f"scratch/audio_test2/{name}.mp3"
            with open(filepath, 'wb') as f:
                f.write(data)
            print(f"Saved {filepath}")
    except Exception as e:
        print(f"Error {name}: {e}")
