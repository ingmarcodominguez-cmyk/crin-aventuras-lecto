# -*- coding: utf-8 -*-
"""
UTILIDAD CLÍNICA - GENERADOR AUTOMÁTICO DE AUDIOS DE FUSIÓN PARA EL TOBOGÁN
Genera archivos de audio neuronal de alta fidelidad ("Soooo... paaaa... ¡SOPA!")
para cualquier palabra que se sume en el futuro al léxico de CRIN.
"""

import asyncio
import os
import re
import unicodedata
import edge_tts

def clean_key(text):
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-zA-Z0-9_]', '', text).lower()

ACCENT_MAP = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u'
}
VOWELS = 'aeiouáéíóúAEIOUÁÉÍÓÚ'

def elongate_syllable(syl):
    s = syl.strip()
    if not s:
        return s
    
    last_v_idx = -1
    for i in range(len(s) - 1, -1, -1):
        if s[i] in VOWELS:
            last_v_idx = i
            break
            
    if last_v_idx != -1:
        v = s[last_v_idx]
        norm_v = ACCENT_MAP.get(v, v.lower())
        elongated = s[:last_v_idx] + v + (norm_v * 3) + s[last_v_idx+1:]
        return elongated
    return s + "..."

def build_fusion_text(word, syllables):
    parts = []
    for i, syl in enumerate(syllables):
        elongated = elongate_syllable(syl)
        if i == 0:
            parts.append(elongated.capitalize() + "...")
        else:
            parts.append(elongated.lower() + "...")
    parts.append(f"¡{word.upper()}!")
    return " ".join(parts)

async def generate_item(sem, item, voice, rate):
    key, fname, fpath, text = item
    if os.path.exists(fpath) and os.path.getsize(fpath) > 1000:
        return None # already exists
    
    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, voice, rate=rate)
                await comm.save(fpath)
                return f"[GENERADO] {fname} ({text})"
            except Exception as e:
                if attempt == 2:
                    return f"[ERROR] {fname}: {e}"
                await asyncio.sleep(1.0)

async def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    lexicon_path = os.path.join(root_dir, 'lexicon.js')
    out_dir = os.path.join(root_dir, 'assets', 'audio', 'tobogan')
    os.makedirs(out_dir, exist_ok=True)

    with open(lexicon_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(
        r"'([A-Z0-9ÁÉÍÓÚÑ_]+)':\s*\{\s*escritura:\s*'([^']+)',\s*pronunciacion:\s*'([^']+)',\s*letras:\s*\[([^\]]+)\],\s*silabas:\s*\[([^\]]+)\],\s*emoji:\s*'([^']+)'",
        re.MULTILINE
    )

    matches = pattern.findall(content)
    print(f"Total de palabras en léxico: {len(matches)}")

    to_generate = []
    for m in matches:
        key, esc, pron, letras_raw, silabas_raw, emoji = m
        silabas = [s.strip().replace("'", "").replace('"', '') for s in silabas_raw.split(',')]
        fname = f"{clean_key(key)}_fusion.mp3"
        fpath = os.path.join(out_dir, fname)
        if not os.path.exists(fpath) or os.path.getsize(fpath) < 1000:
            fusion_text = build_fusion_text(pron, silabas)
            to_generate.append((key, fname, fpath, fusion_text))

    if not to_generate:
        print("¡Todas las palabras ya tienen su audio de fusión generado! Todo al día.")
        return

    print(f"Palabras nuevas pendientes por generar: {len(to_generate)}")
    sem = asyncio.Semaphore(4)
    voice = "es-AR-ElenaNeural"
    rate = "-15%"

    tasks = [generate_item(sem, item, voice, rate) for item in to_generate]
    for fut in asyncio.as_completed(tasks):
        res = await fut
        if res:
            print(res)

    print("¡Generación completada con éxito!")

if __name__ == "__main__":
    asyncio.run(main())
