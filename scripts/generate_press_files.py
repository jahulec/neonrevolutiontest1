from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
PDF_OUTPUT = ROOT / "output" / "pdf"
PRESS_OUTPUT = ROOT / "output" / "press"
MATERIALS = PRESS_OUTPUT / "materials"
ASSETS = ROOT / "assets"
FONTS = ROOT / "scripts" / "font-sources"
WIDTH, HEIGHT = A4
BG = HexColor("#050611")
PANEL = HexColor("#0d1020")
TEXT = HexColor("#f4f6fb")
MUTED = HexColor("#aeb3c0")
CYAN = HexColor("#47e8ff")
PINK = HexColor("#ff3aa6")
LINE = Color(1, 1, 1, alpha=0.16)


pdfmetrics.registerFont(TTFont("Audiowide", FONTS / "audiowide-regular.ttf"))
pdfmetrics.registerFont(TTFont("SpaceMono", FONTS / "space-mono-regular.ttf"))


def background(pdf):
    pdf.setFillColor(BG)
    pdf.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)


def footer(pdf, page):
    pdf.setStrokeColor(LINE)
    pdf.line(42, 34, WIDTH - 42, 34)
    pdf.setFillColor(MUTED)
    pdf.setFont("SpaceMono", 7)
    pdf.drawString(42, 20, "NEON REVOLUTION / PRESS KIT")
    pdf.drawRightString(WIDTH - 42, 20, f"{page:02d}")


def title(pdf, value, y, size=25):
    pdf.setFillColor(TEXT)
    pdf.setFont("Audiowide", size)
    pdf.drawString(42, y, value.upper())
    pdf.setStrokeColor(PINK)
    pdf.setLineWidth(2)
    pdf.line(42, y - 14, 110, y - 14)
    pdf.setStrokeColor(CYAN)
    pdf.line(110, y - 14, 178, y - 14)


def paragraph(pdf, value, x, y, width, size=10, leading=16, color=TEXT):
    style = ParagraphStyle(
        name="body",
        fontName="SpaceMono",
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=TA_LEFT,
    )
    block = Paragraph(value, style)
    _, height = block.wrap(width, HEIGHT)
    block.drawOn(pdf, x, y - height)
    return y - height


def cover_image(pdf, source, x, y, width, height):
    with Image.open(source) as image:
        image_width, image_height = image.size
    scale = max(width / image_width, height / image_height)
    draw_width, draw_height = image_width * scale, image_height * scale
    pdf.saveState()
    clip = pdf.beginPath()
    clip.rect(x, y, width, height)
    pdf.clipPath(clip, stroke=0)
    pdf.drawImage(
        ImageReader(str(source)),
        x + (width - draw_width) / 2,
        y + (height - draw_height) / 2,
        draw_width,
        draw_height,
        mask="auto",
    )
    pdf.restoreState()


def make_press_kit():
    PDF_OUTPUT.mkdir(parents=True, exist_ok=True)
    target = PDF_OUTPUT / "neon-revolution-press-kit.pdf"
    pdf = canvas.Canvas(str(target), pagesize=A4, pageCompression=1)
    pdf.setTitle("Neon Revolution — press kit")
    pdf.setAuthor("Neon Revolution")

    background(pdf)
    cover_image(pdf, ASSETS / "neon-revolution-live.webp", 0, 250, WIDTH, HEIGHT - 250)
    pdf.setFillColor(BG)
    pdf.rect(0, 0, WIDTH, 285, fill=1, stroke=0)
    title(pdf, "Neon Revolution", 198, 30)
    pdf.setFillColor(CYAN)
    pdf.setFont("SpaceMono", 10)
    pdf.drawString(42, 145, "PRESS KIT / 2026")
    paragraph(pdf, "Bio | skład | osiągnięcia | kontakt | materiały prasowe", 42, 116, WIDTH - 84, 9, 14, MUTED)
    footer(pdf, 1)
    pdf.showPage()

    background(pdf)
    title(pdf, "Opis zespołu", HEIGHT - 70, 22)
    bio_pl = (
        "Neon Revolution — świeży zespół, łączący atmosferę lat 80. z chwytliwymi gitarami, "
        "rytmami do tańca i błyskliwymi syntezatorami. Doprawdy to coś, czego jeszcze nie słyszałeś! "
        "Nadal nieprzekonany? Posłuchaj i dołącz do Neon Revolution!"
    )
    bio_en = (
        "Neon Revolution is a fresh band combining the atmosphere of the 80s with catchy guitars, "
        "danceable rhythms and sparkling synthesizers. Truly something you have not heard before. "
        "Listen and join Neon Revolution!"
    )
    y = paragraph(pdf, f"<font color='#47e8ff'>PL</font><br/>{bio_pl}", 42, HEIGHT - 118, WIDTH - 84, 9, 15)
    y = paragraph(pdf, f"<font color='#47e8ff'>EN</font><br/>{bio_en}", 42, y - 24, WIDTH - 84, 9, 15, MUTED)
    panel_y, panel_h = 100, 215
    pdf.setFillColor(PANEL)
    pdf.roundRect(42, panel_y, WIDTH - 84, panel_h, 4, fill=1, stroke=0)
    pdf.setFillColor(TEXT)
    pdf.setFont("Audiowide", 13)
    pdf.drawString(62, panel_y + panel_h - 35, "SKŁAD / LINE-UP")
    members = [
        ("Daria Krupa", "wokal / vocals"),
        ("Adam Kula", "gitara, syntezatory / guitar, synthesizers"),
        ("Szymon Macha", "gitara basowa / bass guitar"),
        ("Tomasz Stanik", "perkusja / drums"),
    ]
    for index, (name, role) in enumerate(members):
        row_y = panel_y + panel_h - 78 - index * 34
        pdf.setFillColor(TEXT)
        pdf.setFont("SpaceMono", 9)
        pdf.drawString(62, row_y, name)
        pdf.setFillColor(MUTED)
        pdf.drawRightString(WIDTH - 62, row_y, role)
    footer(pdf, 2)
    pdf.showPage()

    background(pdf)
    title(pdf, "Osiągnięcia", HEIGHT - 70, 21)
    achievements = [
        ("2026", "Lichen Festival — awans do II etapu"),
        ("2025", "2. miejsce i Nagroda Publiczności — PKR UEK"),
        ("2025", "Laureat Pyskowickich Debiutów"),
        ("2024", "1. miejsce — Gapa Rock, Warszawa"),
    ]
    y = HEIGHT - 126
    for year, item in achievements:
        pdf.setStrokeColor(LINE)
        pdf.line(42, y - 20, WIDTH - 42, y - 20)
        pdf.setFillColor(CYAN)
        pdf.setFont("Audiowide", 9)
        pdf.drawString(42, y, year)
        pdf.setFillColor(TEXT)
        pdf.setFont("SpaceMono", 8.5)
        pdf.drawString(112, y, item)
        y -= 48

    pdf.setFillColor(PANEL)
    pdf.roundRect(42, 116, WIDTH - 84, 238, 4, fill=1, stroke=0)
    pdf.setFillColor(TEXT)
    pdf.setFont("Audiowide", 13)
    pdf.drawString(62, 318, "KONTAKT / CONTACT")
    pdf.setFont("SpaceMono", 9)
    pdf.drawString(62, 282, "neon.revolution2022@gmail.com")
    pdf.drawString(62, 257, "+48 518 437 008")
    pdf.drawString(62, 232, "m.me/NeonRevolutionBand")
    pdf.setFillColor(TEXT)
    pdf.setFont("Audiowide", 11)
    pdf.drawString(62, 188, "W PACZCE / INCLUDED")
    paragraph(
        pdf,
        "Zdjęcie koncertowe w wysokiej rozdzielczości, oficjalne logo, okładki singli, bio, press kit oraz rider techniczny.",
        62,
        166,
        WIDTH - 124,
        8,
        13,
        MUTED,
    )
    footer(pdf, 3)
    pdf.save()
    return target


def make_press_pack(press_kit):
    target = PRESS_OUTPUT / "neon-revolution-press-pack.zip"
    rider = PDF_OUTPUT / "neon-revolution-rider-techniczny.pdf"
    files = [
        (press_kit, "Neon-Revolution-Press-Pack/neon-revolution-press-kit.pdf"),
        (rider, "Neon-Revolution-Press-Pack/neon-revolution-rider-techniczny.pdf"),
        (MATERIALS / "neon-revolution-bio.rtf", "Neon-Revolution-Press-Pack/bio/neon-revolution-bio.rtf"),
        (MATERIALS / "neon-revolution-live.jpg", "Neon-Revolution-Press-Pack/photos/neon-revolution-live.jpg"),
        (MATERIALS / "neon-revolution-logo.png", "Neon-Revolution-Press-Pack/logo/neon-revolution-logo.png"),
        (MATERIALS / "blue-velvet-eyes-cover.jpg", "Neon-Revolution-Press-Pack/artwork/blue-velvet-eyes-cover.jpg"),
        (MATERIALS / "blade-cover.jpg", "Neon-Revolution-Press-Pack/artwork/blade-cover.jpg"),
        (MATERIALS / "vacuum-cover.jpg", "Neon-Revolution-Press-Pack/artwork/vacuum-cover.jpg"),
        (MATERIALS / "let-them-go-cover.jpg", "Neon-Revolution-Press-Pack/artwork/let-them-go-cover.jpg"),
    ]
    missing = [str(source) for source, _ in files if not source.exists()]
    if missing:
        raise FileNotFoundError("Missing press-pack sources:\n" + "\n".join(missing))
    with ZipFile(target, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
        for source, archive_name in files:
            archive.write(source, archive_name)
    return target


def main():
    PRESS_OUTPUT.mkdir(parents=True, exist_ok=True)
    press_kit = make_press_kit()
    print(press_kit)
    print(make_press_pack(press_kit))


if __name__ == "__main__":
    main()
