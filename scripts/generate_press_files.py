from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
ASSETS = ROOT / "assets"
FONT_SOURCES = ROOT / "scripts" / "font-sources"
WIDTH, HEIGHT = A4
BG = HexColor("#050611")
PANEL = HexColor("#0d1020")
TEXT = HexColor("#f4f6fb")
MUTED = HexColor("#aeb3c0")
CYAN = HexColor("#47e8ff")
PINK = HexColor("#ff3aa6")
LINE = Color(1, 1, 1, alpha=0.16)


pdfmetrics.registerFont(TTFont("Audiowide", FONT_SOURCES / "audiowide-regular.ttf"))
pdfmetrics.registerFont(TTFont("SpaceMono", FONT_SOURCES / "space-mono-regular.ttf"))


def background(c):
    c.setFillColor(BG)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)


def footer(c, page, label):
    c.setStrokeColor(LINE)
    c.line(42, 34, WIDTH - 42, 34)
    c.setFillColor(MUTED)
    c.setFont("SpaceMono", 7)
    c.drawString(42, 20, f"NEON REVOLUTION / {label} / DEMO")
    c.drawRightString(WIDTH - 42, 20, f"{page:02d}")


def title(c, value, y, size=25):
    c.setFillColor(TEXT)
    c.setFont("Audiowide", size)
    c.drawString(42, y, value.upper())
    c.setStrokeColor(PINK)
    c.setLineWidth(2)
    c.line(42, y - 14, 110, y - 14)
    c.setStrokeColor(CYAN)
    c.line(110, y - 14, 178, y - 14)


def paragraph(c, text, x, y, width, size=10, leading=16, color=TEXT):
    style = ParagraphStyle(
        name="body",
        fontName="SpaceMono",
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=TA_LEFT,
        spaceAfter=0,
    )
    block = Paragraph(text, style)
    _, height = block.wrap(width, HEIGHT)
    block.drawOn(c, x, y - height)
    return y - height


def cover_image(c, source, x, y, width, height):
    with Image.open(source) as image:
        iw, ih = image.size
    scale = max(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    path = c.beginPath()
    path.rect(x, y, width, height)
    c.clipPath(path, stroke=0)
    c.drawImage(ImageReader(str(source)), x + (width - dw) / 2, y + (height - dh) / 2, dw, dh, mask="auto")
    c.restoreState()


def make_press_kit():
    target = OUTPUT / "neon-revolution-demo-press-kit.pdf"
    c = canvas.Canvas(str(target), pagesize=A4, pageCompression=1)
    c.setTitle("Neon Revolution - demo press kit")

    background(c)
    cover_image(c, ASSETS / "hero-band.webp", 0, 230, WIDTH, HEIGHT - 230)
    c.setFillColor(BG)
    c.rect(0, 0, WIDTH, 270, fill=1, stroke=0)
    title(c, "Neon Revolution", 188, 31)
    c.setFillColor(CYAN)
    c.setFont("SpaceMono", 10)
    c.drawString(42, 137, "PRESS KIT / WERSJA DEMONSTRACYJNA")
    paragraph(c, "Bio | skład | zdjęcia | press pack | rider", 42, 111, WIDTH - 84, 9, 14, MUTED)
    footer(c, 1, "PRESS KIT")
    c.showPage()

    background(c)
    title(c, "Bio", HEIGHT - 70)
    pl = "Neon Revolution - świeży zespół, łączący atmosferę lat 80 z chwytliwymi gitarami, rytmami do tańca i błyskliwymi syntezatorami. Doprawdy to coś czego jeszcze nie słyszałeś! Nadal nie przekonany? Posłuchaj i dołącz do Neon Revolution!"
    en = "Neon Revolution - a fresh band combining the atmosphere of the 80s with catchy guitars, danceable rhythms and sparkling synthesizers. Truly something you haven't heard before! Still not convinced? Listen and join Neon Revolution!"
    y = paragraph(c, f"<font color='#47e8ff'>PL</font><br/>{pl}", 42, HEIGHT - 118, WIDTH - 84, 10, 17)
    y = paragraph(c, f"<font color='#47e8ff'>EN</font><br/>{en}", 42, y - 28, WIDTH - 84, 10, 17, MUTED)
    c.setFillColor(PANEL)
    c.roundRect(42, 92, WIDTH - 84, 200, 4, fill=1, stroke=0)
    c.setFillColor(TEXT)
    c.setFont("Audiowide", 14)
    c.drawString(62, 258, "SKŁAD / LINE-UP")
    members = [
        ("Alex Neon", "wokal / vocals"),
        ("Lena Voltage", "syntezatory / synthesizers"),
        ("Maks Riff", "gitara / guitar"),
        ("Kuba Pulse", "gitara / guitar"),
        ("Oskar Wave", "bas / bass"),
        ("Filip Beat", "perkusja / drums"),
    ]
    for index, (name, role) in enumerate(members):
        row_y = 226 - index * 24
        c.setFillColor(TEXT)
        c.setFont("SpaceMono", 9)
        c.drawString(62, row_y, name)
        c.setFillColor(MUTED)
        c.drawRightString(WIDTH - 62, row_y, role)
    footer(c, 2, "PRESS KIT")
    c.showPage()

    background(c)
    title(c, "Osiągnięcia", HEIGHT - 70, 21)
    achievements = [
        ("2026", "Premiera singla Blue Velvet Eyes"),
        ("2026", "Pierwsza trasa klubowa"),
        ("2025", "Wyróżnienie Nowe Brzmienie"),
    ]
    y = HEIGHT - 132
    for year, item in achievements:
        c.setStrokeColor(LINE)
        c.line(42, y - 20, WIDTH - 42, y - 20)
        c.setFillColor(CYAN)
        c.setFont("Audiowide", 10)
        c.drawString(42, y, year)
        c.setFillColor(TEXT)
        c.setFont("SpaceMono", 10)
        c.drawString(116, y, item)
        y -= 54
    paragraph(c, "Powyższe osiągnięcia są przykładowe i muszą zostać zastąpione potwierdzonymi informacjami przed publikacją.", 42, y - 6, WIDTH - 84, 8, 13, MUTED)
    c.setFillColor(PANEL)
    c.roundRect(42, 120, WIDTH - 84, 190, 4, fill=1, stroke=0)
    c.setFillColor(TEXT)
    c.setFont("Audiowide", 14)
    c.drawString(62, 276, "KONTAKT / CONTACT")
    c.setFont("SpaceMono", 10)
    c.drawString(62, 237, "neon.revolution2022@gmail.com")
    c.drawString(62, 211, "+48 518 437 008")
    c.drawString(62, 185, "m.me/NeonRevolutionBand")
    c.setFillColor(MUTED)
    c.setFont("SpaceMono", 8)
    c.drawString(62, 145, "Kontakt potwierdzony / pozostała treść demo")
    footer(c, 3, "PRESS KIT")
    c.save()
    return target


def make_rider():
    target = OUTPUT / "neon-revolution-demo-rider-techniczny.pdf"
    c = canvas.Canvas(str(target), pagesize=A4, pageCompression=1)
    c.setTitle("Neon Revolution - demo rider techniczny")

    background(c)
    title(c, "Rider techniczny", HEIGHT - 92, 25)
    c.setFillColor(CYAN)
    c.setFont("SpaceMono", 10)
    c.drawString(42, HEIGHT - 148, "WERSJA DEMONSTRACYJNA / NIE UŻYWAĆ PRODUKCYJNIE")
    paragraph(c, "Dokument pokazuje docelowy wygląd i zakres ridera. Kanały, backline, zapotrzebowanie prądowe i osoby kontaktowe wymagają potwierdzenia przez zespół.", 42, HEIGHT - 184, WIDTH - 84, 11, 18)
    c.setFillColor(PANEL)
    c.roundRect(42, 190, WIDTH - 84, 280, 4, fill=1, stroke=0)
    c.setFillColor(TEXT)
    c.setFont("Audiowide", 14)
    c.drawString(64, 432, "PODSTAWOWE ZAŁOŻENIA")
    basics = [
        "Skład demonstracyjny: 6 osób",
        "Preferowany czas próby dźwięku: 60 minut",
        "Minimalny czas zmiany sceny: 25 minut",
        "System PA i monitoring: do uzgodnienia z realizatorem",
        "Kontakt techniczny: neon.revolution2022@gmail.com",
    ]
    for index, item in enumerate(basics):
        c.setFillColor(MUTED if index else TEXT)
        c.setFont("SpaceMono", 9)
        c.drawString(64, 392 - index * 38, f"{index + 1:02d}  {item}")
    footer(c, 1, "RIDER")
    c.showPage()

    background(c)
    title(c, "Stage plot", HEIGHT - 70, 22)
    stage_x, stage_y, stage_w, stage_h = 42, 110, WIDTH - 84, HEIGHT - 225
    c.setFillColor(PANEL)
    c.setStrokeColor(CYAN)
    c.setLineWidth(1)
    c.rect(stage_x, stage_y, stage_w, stage_h, fill=1, stroke=1)
    c.setFillColor(MUTED)
    c.setFont("SpaceMono", 8)
    c.drawCentredString(WIDTH / 2, stage_y + 14, "FRONT / PUBLICZNOŚĆ")
    positions = [
        (0.19, 0.62, "GTR 1"), (0.39, 0.72, "SYNTH"), (0.60, 0.70, "VOC"),
        (0.81, 0.62, "GTR 2"), (0.70, 0.36, "BASS"), (0.38, 0.30, "DRUMS"),
    ]
    for px, py, label in positions:
        x = stage_x + stage_w * px
        y = stage_y + stage_h * py
        c.setFillColor(BG)
        c.setStrokeColor(PINK if label in {"VOC", "DRUMS"} else CYAN)
        c.circle(x, y, 30, fill=1, stroke=1)
        c.setFillColor(TEXT)
        c.setFont("Audiowide", 7)
        c.drawCentredString(x, y - 3, label)
    footer(c, 2, "RIDER")
    c.showPage()

    background(c)
    title(c, "Input list", HEIGHT - 70, 22)
    rows = [
        ("01", "Kick", "dynamic"), ("02", "Snare top", "dynamic"),
        ("03", "Overhead L", "condenser"), ("04", "Overhead R", "condenser"),
        ("05", "Bass DI", "DI"), ("06", "Guitar 1", "dynamic"),
        ("07", "Guitar 2", "dynamic"), ("08-09", "Synth L/R", "2 x DI"),
        ("10", "Lead vocal", "dynamic"), ("11-12", "Backing vocals", "dynamic"),
    ]
    x0, y0 = 42, HEIGHT - 124
    widths = [62, 260, WIDTH - 84 - 322]
    headers = ["CH", "ŹRÓDŁO / SOURCE", "UWAGI / NOTES"]
    c.setFillColor(PANEL)
    c.rect(x0, y0 - 30, sum(widths), 30, fill=1, stroke=0)
    current_x = x0
    for header, col_width in zip(headers, widths):
        c.setFillColor(TEXT)
        c.setFont("Audiowide", 7)
        c.drawString(current_x + 10, y0 - 19, header)
        current_x += col_width
    for index, row in enumerate(rows):
        row_y = y0 - 30 - (index + 1) * 37
        c.setStrokeColor(LINE)
        c.line(x0, row_y, x0 + sum(widths), row_y)
        current_x = x0
        for value, col_width in zip(row, widths):
            c.setFillColor(TEXT if current_x != x0 else CYAN)
            c.setFont("SpaceMono", 8)
            c.drawString(current_x + 10, row_y + 14, value)
            current_x += col_width
    paragraph(c, "Lista demonstracyjna. Finalny dokument powinien zawierać potwierdzony patch, monitoring, backline, zasilanie oraz dane realizatora.", 42, 104, WIDTH - 84, 8, 13, MUTED)
    footer(c, 3, "RIDER")
    c.save()
    return target


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    print(make_press_kit())
    print(make_rider())


if __name__ == "__main__":
    main()
