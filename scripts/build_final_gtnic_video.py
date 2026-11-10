#!/usr/bin/env python3
"""
scripts/build_final_gtnic_video.py
Full automated builder for PasokMataram GTNIC 2026 video walkthrough (3-5 minutes, 1080p).
Includes:
1. Voice cloning from the supplied Rasya reference recording through OmniVoice.
2. Native camera footage & original voice for Rasya Putra Pratama and Ibnu Sabil.
3. Smooth, elegant Rhodes piano ambient backsound bed (-18dB, non-stiff).
4. 18 comprehensive segments with high-resolution production screenshots across 5 personas.
"""

import os
import sys
import asyncio
import subprocess
import wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg
import soundfile as sf
import torch
from omnivoice import OmniVoice

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
PICS_DIR = r"C:\Users\inira\OneDrive\Pictures"
TMP_DIR = "tmp_gtnic_build"
OUT_FILE = "docs/PasokMataram_Video_Walkthrough_GTNIC_2026.mp4"

VOICE_REFERENCE = os.getenv("GTNIC_VOICE_REFERENCE", os.path.join(PICS_DIR, "suara_tama.aac"))
VOICE_MODEL = os.getenv("GTNIC_VOICE_MODEL", "k2-fsa/OmniVoice")
VOICE_DEVICE = os.getenv("GTNIC_VOICE_DEVICE", "cpu")
VOICE_REF_TEXT = os.getenv("GTNIC_VOICE_REF_TEXT")

os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs("docs", exist_ok=True)

W, H = 1920, 1080
FPS = 30

FONT_TAG = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 18)
FONT_TITLE = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 30)
FONT_SUB = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 22)
FONT_NAME = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 36)
FONT_ROLE = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 22)

DUB_TEXTS = {
    0: (
        "Halo Dewan Juri Garda Tech National Innovation Competition 2026. Kami dari Tim Abang Tukang Bakso, "
        "Universitas Teknologi Yogyakarta, mempersembahkan PasokMataram: Platform B2B SaaS Pengadaan Kolektif Pangan "
        "dan Ketahanan Rantai Pasok Agrikultur Terintegrasi Daerah Istimewa Yogyakarta."
    ),
    3: (
        "PasokMataram menghubungkan Gabungan Kelompok Tani, Stasiun Timbangan Tera Sentral Hub Sentolo, "
        "dan Dapur HoReKa dalam satu ekosistem rantai pasok tertutup dengan penegakan konteks tenant yang ketat dan aman."
    ),
    4: (
        "Latar belakang inovasi ini berakar dari tingginya disparitas harga komoditas pangan antar-kabupaten di DIY "
        "yang mencapai 35 persen, serta susut fisik bahan baku lebih dari 12 persen akibat ketiadaan standardisasi rantai dingin dan dominasi tengkulak."
    ),
    5: (
        "Sebagai solusi, PasokMataram menetapkan Minimum Transaction Value 500 ribu rupiah untuk efisiensi biaya payment gateway, "
        "skema PayFac transparan tanpa surcharge tersembunyi, serta proteksi rekening bersama escrow Bank BPD DIY."
    ),
    6: (
        "Modul pertama adalah Portal Publik berbasis Next.js 14 App Router. Mengadopsi sistem desain resmi Daun Tropis dan Bata Mataram "
        "yang memenuhi standar aksesibilitas WCAG 2.1 AA, tanpa karakter emoji sintetis, dan ramah pengguna lintas usia."
    ),
    7: (
        "Portal ini dilengkapi simulasi AI prediksi harga multivariat PasokML berbasis LightGBM dan anomali cuaca BMKG. "
        "Proyeksi harga 7, 30, dan 90 hari ini membantu petani menentukan jadwal panen dan restoran mengamankan biaya bahan baku."
    ),
    8: (
        "Memasuki Modul Pembeli HoReKa, pengelola restoran dapat mengakses meja kerja dapur yang adaptif peran. "
        "Data perputaran bahan baku dan pesanan dibaca langsung dari database MySQL 4NF tanpa ketergantungan mock runtime."
    ),
    9: (
        "Melalui fitur Pooling Reservasi, restoran dapat melakukan pembelian bersama atau group buying untuk mencapai harga grosir langsung dari petani. "
        "Alokasi kuota panen dilindungi distributed lock Redlock untuk mencegah alokasi ganda."
    ),
    10: (
        "Fitur Standing Orders memfasilitasi pengadaan bahan pokok rutin seperti daging sapi Segoroyoso, ayam Turi, "
        "dan susu Kaliurang dalam satu faktur terpadu untuk seluruh cabang gerai fisik di wilayah Yogyakarta."
    ),
    11: (
        "Modul ketiga dirancang khusus untuk mitra pemasok Gapoktan. Mempertimbangkan profil petani senior, "
        "antarmuka mengadopsi ukuran tombol minimal 48 piksel, kontras tinggi, dan bahasa operasional lugas bebas istilah teknis rumit."
    ),
    12: (
        "Petani dapat mendaftarkan jadwal alokasi pasokan ke Sentral Hub Sentolo sebelum batas sortasi malam pukul 21.00 WIB, "
        "dengan kepastian kuota serap dan harga kontrak yang terkunci transparan."
    ),
    13: (
        "Modul keempat berada di stasiun timbangan tera digital Sentral Hub Sentolo. "
        "Sistem mencatat otomatis berat bruto, tara keranjang, dan menguji toleransi susut berat di bawah 5 persen sesuai SNI rantai dingin komoditas."
    ),
    14: (
        "Bila terdapat komoditas afkir, petugas memindahkannya ke ruang karantina. "
        "Sistem otomatis menerbitkan penyesuaian dana prorata sehingga melindungi hak petani dan menjaga standar mutu dapur kuliner."
    ),
    15: (
        "Modul kelima adalah Pusat Komando Super Admin. Tim tata kelola daerah dapat memantau perputaran pasokan pangan di 5 kabupaten kota, "
        "mengawasi saldo escrow BPD DIY, dan memproses pencairan otomatis H+1 pasca verifikasi QC."
    ),
    16: (
        "Super Admin juga melakukan audit legalitas usaha KYB terhadap dokumen NIB dan Surat Keterangan Tani. "
        "Seluruh berkas dilindungi penyimpanan MinIO S3 dengan dynamic watermarking untuk mencegah pemalsuan identitas mitra."
    ),
    17: (
        "Demikian demonstrasi sistem PasokMataram dalam mewujudkan kedaulatan dan ketahanan pangan di Daerah Istimewa Yogyakarta. "
        "Terima kasih kepada Dewan Juri GTNIC 2026. Salam dari Tim Abang Tukang Bakso, Universitas Teknologi Yogyakarta."
    ),
}

def render_slide_image(screenshot_path, tag_text, title_text, subtitle_text, out_path):
    canvas = Image.new('RGB', (W, H), color='#122416')
    draw = ImageDraw.Draw(canvas)

    # Top banner
    draw.rectangle([(0, 0), (W, 105)], fill='#1B3622')
    draw.rectangle([(0, 103), (W, 106)], fill='#D48028')
    draw.text((60, 15), tag_text.upper(), fill='#D48028', font=FONT_TAG)
    draw.text((60, 45), title_text, fill='#FFFFFF', font=FONT_TITLE)

    # Center screenshot
    if os.path.exists(screenshot_path):
        sc = Image.open(screenshot_path).convert('RGB')
        max_w, max_h = 1760, 810
        ratio = min(max_w / sc.width, max_h / sc.height)
        new_w, new_h = int(sc.width * ratio), int(sc.height * ratio)
        sc_resized = sc.resize((new_w, new_h), Image.Resampling.LANCZOS)
        pos_x = (W - new_w) // 2
        pos_y = 110 + (840 - new_h) // 2
        draw.rectangle([(pos_x - 3, pos_y - 3), (pos_x + new_w + 2, pos_y + new_h + 2)], outline='#2E5339', width=3)
        canvas.paste(sc_resized, (pos_x, pos_y))

    # Bottom banner
    draw.rectangle([(0, 960), (W, H)], fill='#1B3622')
    draw.rectangle([(0, 958), (W, 960)], fill='#2E5339')
    draw.rectangle([(60, 985), (66, 1055)], fill='#D48028')
    draw.text((85, 985), subtitle_text, fill='#EAF0EB', font=FONT_SUB)

    canvas.save(out_path)
    return out_path

def render_video_overlay(name, role, campus, out_path):
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Top banner
    draw.rectangle([(0, 0), (W, 90)], fill=(27, 54, 34, 240))
    draw.text((60, 18), "GARDA TECH NATIONAL INNOVATION COMPETITION (GTNIC) 2026", fill='#D48028', font=FONT_TAG)
    draw.text((60, 42), "PasokMataram - Platform B2B SaaS Agrikultur D.I. Yogyakarta", fill='#FFFFFF', font=FONT_TITLE)

    # Lower-third box
    draw.rectangle([(60, 890), (1100, 1025)], fill=(18, 36, 22, 235), outline=(212, 128, 40, 255), width=3)
    draw.text((90, 905), name, fill='#FFFFFF', font=FONT_NAME)
    draw.text((90, 955), role, fill='#D48028', font=FONT_ROLE)
    draw.text((90, 985), campus, fill='#EAF0EB', font=FONT_ROLE)

    overlay.save(out_path)
    return out_path

def prepare_voice_reference():
    if not os.path.exists(VOICE_REFERENCE):
        raise FileNotFoundError(f"Voice reference not found: {VOICE_REFERENCE}")
    if VOICE_REFERENCE.lower().endswith(".wav"):
        return VOICE_REFERENCE
    reference_wav = os.path.join(TMP_DIR, "voice_reference.wav")
    subprocess.run(
        [FFMPEG, "-y", "-i", VOICE_REFERENCE, "-ar", "24000", "-ac", "1", reference_wav],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return reference_wav


def load_voice_cloner():
    print(f"Loading OmniVoice checkpoint: {VOICE_MODEL}")
    return OmniVoice.from_pretrained(VOICE_MODEL, device_map=VOICE_DEVICE, dtype=torch.float16)


def create_voice_clone_prompt(model, reference_wav):
    print("Transcribing voice reference once for reusable clone prompt")
    return model.create_voice_clone_prompt(ref_audio=reference_wav, ref_text=VOICE_REF_TEXT)


def generate_voice_dubbing(model, clone_prompt, text, out_wav):
    if os.path.exists(out_wav):
        return
    duration = max(3.0, min(20.0, len(text.split()) / 2.3 + 0.8))
    audio = model.generate(
        text=text,
        language="id",
        voice_clone_prompt=clone_prompt,
        duration=duration,
        num_step=8,
        speed=1.0,
    )
    sf.write(out_wav, audio[0], model.sampling_rate)

def get_audio_duration(audio_file):
    probe = subprocess.run([
        FFMPEG, "-i", audio_file
    ], capture_output=True, text=True)
    for line in probe.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    return 10.0

def create_slide_with_audio_clip(img_path, audio_wav, duration_sec, out_mp4):
    cmd = [
        FFMPEG, "-y",
        "-loop", "1", "-i", img_path,
        "-i", audio_wav,
        "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
        "-r", str(FPS),
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-t", str(duration_sec),
        out_mp4
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def create_person_clip(raw_mp4, overlay_png, duration_sec, out_mp4):
    filter_complex = (
        f"[0:v]scale=-1:820[scaled];"
        f"color=c=#122416:s=1920x1080:d={duration_sec}:r={FPS}[bg];"
        f"[bg][scaled]overlay=(W-w)/2:(H-h)/2[v1];"
        f"[1:v]scale=1920:1080[ov];"
        f"[v1][ov]overlay=0:0[outv];"
        f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=2.2[outa]"
    )
    cmd = [
        FFMPEG, "-y",
        "-i", raw_mp4,
        "-i", overlay_png,
        "-filter_complex", filter_complex,
        "-map", "[outv]", "-map", "[outa]",
        "-c:v", "libx264", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-r", str(FPS), "-t", str(duration_sec),
        out_mp4
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def generate_smooth_backsound(duration_sec, out_wav):
    sample_rate = 48000
    n_samples = int(sample_rate * duration_sec)
    t = np.linspace(0, duration_sec, n_samples, endpoint=False)
    chord_dur = 2.5
    chords = [
        [130.81, 196.00, 246.94, 293.66, 329.63], # Cmaj9
        [110.00, 164.81, 220.00, 261.63, 329.63], # Am7
        [87.31, 130.81, 174.61, 220.00, 261.63],  # Fmaj7
        [98.00, 146.83, 196.00, 246.94, 293.66],  # G7
    ]
    music = np.zeros(n_samples, dtype=np.float32)
    num_chords = int(duration_sec / chord_dur) + 1
    for i in range(num_chords):
        s_idx = int(i * chord_dur * sample_rate)
        e_idx = min(int((i + 1) * chord_dur * sample_rate), n_samples)
        if s_idx >= n_samples:
            break
        dur = (e_idx - s_idx) / sample_rate
        t_c = np.linspace(0, dur, e_idx - s_idx, endpoint=False)
        chord = chords[i % len(chords)]
        env = np.exp(-t_c * 0.9)
        att_samples = int(0.015 * sample_rate)
        env[:att_samples] *= np.linspace(0, 1, att_samples)
        chord_sig = np.zeros(e_idx - s_idx, dtype=np.float32)
        for idx, f in enumerate(chord):
            weight = 0.08 / (1.0 + 0.3 * idx)
            chord_sig += weight * np.sin(2 * np.pi * f * t_c)
            chord_sig += (weight * 0.3) * np.sin(2 * np.pi * 2 * f * t_c)
        root_f = chord[0] / 2.0
        bass_env = np.exp(-t_c * 0.6)
        chord_sig += 0.05 * np.sin(2 * np.pi * root_f * t_c) * bass_env
        music[s_idx:e_idx] += chord_sig * env

    # Master level: soft ambient pad (-18dB)
    music = (music / np.max(np.abs(music))) * 0.12
    audio_int16 = (music * 32767).astype(np.int16)
    stereo_int16 = np.column_stack((audio_int16, audio_int16))

    with wave.open(out_wav, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(stereo_int16.tobytes())

async def async_main():
    print("=== PASOKMATARAM GTNIC 2026 VIDEO BUILDER WITH VOICE DUBBING ===")
    print("Using FFmpeg:", FFMPEG)

    # 1. Overlays for Tama and Ibnu
    lt_rasya = render_video_overlay(
        "Rasya Putra Pratama",
        "Ketua Tim / Arsitek Sistem & Fullstack Engineer",
        "Universitas Teknologi Yogyakarta - Tim Abang Tukang Bakso",
        os.path.join(TMP_DIR, "lt_rasya.png")
    )
    lt_ibnu = render_video_overlay(
        "Ibnu Sabil",
        "Anggota Tim / UI/UX Designer & Quality Assurance",
        "Universitas Teknologi Yogyakarta - Tim Abang Tukang Bakso",
        os.path.join(TMP_DIR, "lt_ibnu.png")
    )

    tama_mp4 = os.path.join(PICS_DIR, "Tama.mp4")
    ibnu_mp4 = os.path.join(PICS_DIR, "Ibnu.mp4")

    # 2. Segment raw specs
    raw_segments = [
        ("slide", 0, "docs/screenshots/thumbnail_gtnic_2026.png",
         "GARDA TECH NATIONAL INNOVATION COMPETITION 2026",
         "PasokMataram: Platform B2B SaaS Agrikultur & Ketahanan Pangan DIY",
         "Karya Video Walkthrough Resmi | Kategori: Web Development & AI Application\nDisusun oleh Tim Abang Tukang Bakso (Universitas Teknologi Yogyakarta)"),

        ("person", 1, tama_mp4, lt_rasya, 9.46),
        ("person", 2, ibnu_mp4, lt_ibnu, 6.00),

        ("slide", 3, "docs/screenshots/production/05_public_alur_pengadaan.png",
         "ARSITEKTUR EKOSISTEM PASOKMATARAM",
         "Alur Rantai Pasok Pangan Tertutup D.I. Yogyakarta (Closed Logistics)",
         "Menghubungkan Gapoktan, Stasiun Timbangan Tera Sentral Hub Sentolo, dan Dapur HoReKa\nsecara transparan dengan penegakan tenant context di seluruh lapisan aplikasi."),

        ("slide", 4, "docs/screenshots/production/04_public_kalkulator.png",
         "LATAR BELAKANG & MASALAH DAERAH",
         "Disparitas Harga Pangan Tinggi & Rantai Distribusi Berlapis",
         "Fluktuasi harga cabai dan bawang antar-kabupaten DIY mencapai 35% dengan susut fisik >12%,\nserta risiko gagal bayar yang membebani petani lokal dan UMKM kuliner."),

        ("slide", 5, "docs/screenshots/production/06_public_paket_layanan.png",
         "SOLUSI TEKNOLOGI & MODEL BISNIS",
         "Minimum Transaction Value Rp 500.000 & Escrow Bank BPD DIY",
         "Mencegah transaksi mikro boros biaya payment gateway via batasan MTV Rp 500.000,\nmodel PayFac transparan (0.3% pembeli, 0.5% merchant), dan proteksi dana rekening bersama."),

        ("slide", 6, "docs/screenshots/production/01_public_landing_hero.png",
         "MODUL 1: PORTAL PUBLIK & KATALOG TERBUKA",
         "Antarmuka Modern, Inklusif, & Ramah Pengguna (Next.js 14 App Router)",
         "Desain sistem berakar filosofi Daun Tropis & Bata Mataram, kepatuhan WCAG 2.1 AA,\ntanpa emoji dekoratif sintetis, dengan kecepatan render tinggi pada seluruh breakpoint."),

        ("slide", 7, "docs/screenshots/production/03_public_prediksi_harga.png",
         "MODUL 1: PRAKIRAAN HARGA MULTIVARIAT (PASOKML)",
         "Simulasi Proyeksi Harga Pangan Berbasis LightGBM & BMKG Anomaly",
         "Membantu petani menentukan waktu panen dan restoran merencanakan biaya belanja\nmelalui proyeksi multi-horizon (7, 30, 90 hari) dengan akurasi MAPE di bawah 5%."),

        ("slide", 8, "docs/screenshots/production/12_buyer_dashboard.png",
         "MODUL 2: MEJA KERJA DAPUR HOREKA (RESTORAN, HOTEL, KAFE)",
         "Pusat Kendali Pengadaan Bahan Pangan Subuh & Standing Orders",
         "Tampilan adaptif peran staf dapur (Head Chef vs Purchasing Manager) membaca langsung\ndata database MySQL 4NF tanpa ketergantungan mock runtime sintetis."),

        ("slide", 9, "docs/screenshots/production/14_buyer_pooling.png",
         "MODUL 2: ALOKASI POOLING & GROUP BUYING",
         "Agregasi Kuota Pesanan untuk Mendapatkan Harga Grosir Petani",
         "Mengamankan kuota panen Gapoktan dengan sistem antrean fail-fast dan distributed lock Redlock\nsehingga terhindar dari konflik alokasi ganda di jam pengadaan sibuk."),

        ("slide", 10, "docs/screenshots/production/15_buyer_orders.png",
         "MODUL 2: STANDING ORDERS & FAKTUR TERPADU",
         "Otomasi Pengiriman Rutin & Manajemen Multi-Gerai Cabang",
         "Semua pengadaan bahan segar (daging sapi Segoroyoso, ayam Turi, susu Kaliurang)\nterekap dalam satu tagihan legalitas resmi KYB untuk seluruh cabang restoran."),

        ("slide", 11, "docs/screenshots/production/22_supplier_dashboard.png",
         "MODUL 3: DASBOR PETANI & GAPOKTAN (SENIOR-FRIENDLY UI)",
         "Antarmuka Khusus Ramah Lanjut Usia Berbasis Touch Target Besar >= 48px",
         "Tipografi kontras tinggi, navigasi operasional bahasa Indonesia lugas khas D.I. Yogyakarta,\ndan transparansi pencairan dana tanpa potongan liar tengkulak."),

        ("slide", 12, "docs/screenshots/production/23_supplier_allocations.png",
         "MODUL 3: KOMITMEN PASOK & JADWAL SERAH TERIMA",
         "Kepastian Kuota Serap Sebelum Jam Sortasi Malam (21.00 WIB)",
         "Petani mendaftarkan jadwal alokasi pasokan ke Sentral Hub Sentolo secara terjadwal\ndengan status kontrak dan total nilai komoditas tercatat transparan."),

        ("slide", 13, "docs/screenshots/production/30_hub_weighing.png",
         "MODUL 4: STASIUN TIMBANGAN TERA DIGITAL SENTRAL HUB SENTOLO",
         "Pencatatan Otomatis Berat Bruto, Tara, & Toleransi Susut SNI <5%",
         "Uji kadar air digital dan penimbangan tersertifikasi metrologi memastikan mutu bahan\nsesuai SNI rantai dingin sebelum didistribusikan ke armada pengantaran subuh."),

        ("slide", 14, "docs/screenshots/production/31_hub_quarantine.png",
         "MODUL 4: KARANTINA & INVESTIGASI SENGKETA MUTU (QC DISPUTE)",
         "Penyelesaian Sengketa Mutu Adil dengan Pengembalian Dana Prorata",
         "Komoditas di bawah standar langsung dipisahkan ke ruang karantina dengan penyesuaian\nnilai faktur otomatis sehingga melindungi hak petani dan standar dapur restoran."),

        ("slide", 15, "docs/screenshots/production/34_admin_dashboard.png",
         "MODUL 5: SUPER ADMIN TATA KELOLA PANGAN D.I. YOGYAKARTA",
         "Pusat Kendali Pengawasan Wilayah & Rekening Escrow BPD DIY",
         "Dashboard pemantauan perputaran komoditas 5 kabupaten/kota DIY, pengawasan dana talangan,\nserta pencairan otomatis H+1 kepada rekening Gapoktan setelah serah terima tervalidasi."),

        ("slide", 16, "docs/screenshots/production/39_admin_tenants.png",
         "MODUL 5: AUDIT VERIFIKASI IDENTITAS BISNIS & LEGALITAS KYB",
         "Pencegahan Entitas Fiktif Melalui Validasi NIB & Sertifikat Tani",
         "Auditor memeriksa dokumen legalitas resmi dengan sistem penyimpanan aman MinIO S3\ndan dynamic watermarking untuk mencegah penyalahgunaan data mitra."),

        ("slide", 17, "docs/screenshots/thumbnail_gtnic_2026.png",
         "GARDA TECH NATIONAL INNOVATION COMPETITION (GTNIC) 2026",
         "PasokMataram: Membangun Ketahanan Pangan Berkelanjutan D.I. Yogyakarta",
         "Karya Terpadu Web Development & AI Application GTNIC 2026\nOleh Tim Abang Tukang Bakso (Rasya Putra Pratama & Ibnu Sabil, Universitas Teknologi Yogyakarta)\nTerima kasih kepada Dewan Juri dan Panitia GTNIC 2026!"),
    ]

    print("\n--- Loading verified voice clone checkpoint ---")
    voice_reference_wav = prepare_voice_reference()
    voice_cloner = load_voice_cloner()
    voice_clone_prompt = create_voice_clone_prompt(voice_cloner, voice_reference_wav)
    clip_files = []
    concat_list_path = os.path.join(TMP_DIR, "concat_list.txt")
    total_duration = 0.0

    for idx, seg in enumerate(raw_segments):
        clip_type = seg[0]
        clip_path = os.path.join(TMP_DIR, f"clip_{idx:02d}.mp4")

        if clip_type == "slide":
            _, dub_idx, sc_path, tag, title, sub = seg
            dub_wav = os.path.join(TMP_DIR, f"clone_{dub_idx:02d}.wav")
            print(f"[{idx+1}/{len(raw_segments)}] Generating cloned voice & slide for: {title[:40]}...")
            generate_voice_dubbing(voice_cloner, voice_clone_prompt, DUB_TEXTS[dub_idx], dub_wav)
            dub_dur = get_audio_duration(dub_wav)
            slide_dur = dub_dur + 1.2 # pleasant padding
            total_duration += slide_dur

            slide_png = os.path.join(TMP_DIR, f"slide_{idx:02d}.png")
            render_slide_image(sc_path, tag, title, sub, slide_png)
            create_slide_with_audio_clip(slide_png, dub_wav, slide_dur, clip_path)

        elif clip_type == "person":
            _, person_idx, raw_mp4, ov_png, dur = seg
            print(f"[{idx+1}/{len(raw_segments)}] Generating native persona clip: {os.path.basename(raw_mp4)} ({dur}s)...")
            total_duration += dur
            create_person_clip(raw_mp4, ov_png, dur, clip_path)

        clip_files.append(clip_path)

    print(f"\nTotal video duration: {total_duration:.2f}s ({total_duration/60:.2f} minutes)")

    # 3. Concatenate all clips
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for c in clip_files:
            abs_p = os.path.abspath(c).replace("\\", "/")
            f.write(f"file '{abs_p}'\n")

    concatenated_raw = os.path.join(TMP_DIR, "concatenated_raw.mp4")
    print("Concatenating all 18 segments with high-efficiency x264 encoder...")
    concat_cmd = [
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0", "-i", concat_list_path,
        "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        concatenated_raw
    ]
    subprocess.run(concat_cmd, check=True)

    # 4. Generate smooth Rhodes piano background music
    bg_music_wav = os.path.join(TMP_DIR, "smooth_backsound.wav")
    print(f"Synthesizing smooth Rhodes ambient backsound ({total_duration + 10:.1f}s)...")
    generate_smooth_backsound(total_duration + 15, bg_music_wav)

    # 5. Master audio mix: voice at 1.0 (loud & prominent), backsound at 0.12 (-18dB soft)
    print("Mastering final audio mix: Voice (1.0) + Smooth Rhodes Backsound (0.12)...")
    mix_filter = (
        f"[1:a]aloop=loop=-1:size=2e+09,volume=0.12[bg];"
        f"[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[outa]"
    )
    final_cmd = [
        FFMPEG, "-y",
        "-i", concatenated_raw,
        "-i", bg_music_wav,
        "-filter_complex", mix_filter,
        "-map", "0:v", "-map", "[outa]",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        OUT_FILE
    ]
    subprocess.run(final_cmd, check=True)

    final_size = os.path.getsize(OUT_FILE)
    print(f"\n=== FINAL GTNIC VIDEO RENDER COMPLETE ===")
    print(f"Output File   : {OUT_FILE}")
    print(f"Size          : {final_size / (1024*1024):.2f} MB")
    print(f"Duration      : {total_duration:.2f}s ({total_duration/60:.2f} minutes)")

if __name__ == "__main__":
    asyncio.run(async_main())
