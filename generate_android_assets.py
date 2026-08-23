import os
from PIL import Image, ImageDraw, ImageFont

def make_icon(source_path, target_path, size):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    # Deep imperial dark background #02040a
    bg = Image.new("RGBA", (size, size), (2, 4, 10, 255))
    img = Image.open(source_path).convert("RGBA")
    
    logo_size = int(size * 0.75)
    img = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    pos = (size - logo_size) // 2
    bg.paste(img, (pos, pos), img)
    bg.save(target_path, "PNG")

def get_font(size):
    font_paths = [
        "C:\\Windows\\Fonts\\segoeuib.ttf", # Segoe UI Bold
        "C:\\Windows\\Fonts\\arialbd.ttf",  # Arial Bold
        "C:\\Windows\\Fonts\\calibrib.ttf", # Calibri Bold
    ]
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                pass
    return ImageFont.load_default()

def make_splash(source_path, target_path, width, height):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    # Deep imperial dark background #02040a
    canvas = Image.new("RGBA", (width, height), (2, 4, 10, 255))
    draw = ImageDraw.Draw(canvas)
    
    logo = Image.open(source_path).convert("RGBA")
    
    min_dim = min(width, height)
    target_logo_size = int(min_dim * 0.35)
    
    scale = min(target_logo_size / logo.width, target_logo_size / logo.height)
    new_w = int(logo.width * scale)
    new_h = int(logo.height * scale)
    
    logo_resized = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    logo_x = (width - new_w) // 2
    logo_y = int(height * 0.28)
    
    canvas.paste(logo_resized, (logo_x, logo_y), logo_resized)
    
    # Typography sizing
    subtitle_size = max(11, int(min_dim * 0.032))
    title_size = max(14, int(min_dim * 0.042))
    
    font_sub = get_font(subtitle_size)
    font_title = get_font(title_size)
    
    text_y = logo_y + new_h + int(height * 0.05)
    
    # Line 1: "WELCOME TO THE EMPIRE OF"
    line1 = "WELCOME TO THE EMPIRE OF"
    bbox1 = draw.textbbox((0, 0), line1, font=font_sub)
    w1 = bbox1[2] - bbox1[0]
    h1 = bbox1[3] - bbox1[1]
    
    padding_x = 14
    padding_y = 5
    bx1 = (width - w1) // 2 - padding_x
    by1 = text_y - padding_y
    bx2 = (width + w1) // 2 + padding_x
    by2 = text_y + h1 + padding_y
    
    draw.rounded_rectangle([bx1, by1, bx2, by2], radius=12, fill=(15, 23, 42, 255), outline=(245, 158, 11, 255), width=2)
    draw.text(((width - w1) // 2, text_y), line1, font=font_sub, fill=(251, 191, 36, 255)) # Gold color
    
    text_y += h1 + int(height * 0.04)
    
    # Line 2: SINGLE LINE "THIRUMALAI D × DIVAGAR E"
    line2 = "THIRUMALAI D x DIVAGAR E"
    bbox2 = draw.textbbox((0, 0), line2, font=font_title)
    w2 = bbox2[2] - bbox2[0]
    
    # Scale down font size if wider than screen
    if w2 > (width - 20):
        font_title = get_font(max(10, int(title_size * (width - 30) / w2)))
        bbox2 = draw.textbbox((0, 0), line2, font=font_title)
        w2 = bbox2[2] - bbox2[0]
        
    draw.text(((width - w2) // 2, text_y), line2, font=font_title, fill=(255, 255, 255, 255))
    
    canvas.save(target_path, "PNG")

source_logo = os.path.join("frontend", "public", "qlex-logo.png")
res_dir = os.path.join("frontend", "android", "app", "src", "main", "res")

icon_sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

splash_sizes = {
    "drawable": (480, 800),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1280, 1920),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-hdpi": (800, 480),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1600, 960),
    "drawable-land-xxxhdpi": (1920, 1280),
}

print("Generating Imperial Dark App Icons...")
for folder, size in icon_sizes.items():
    icon_path = os.path.join(res_dir, folder, "ic_launcher.png")
    round_icon_path = os.path.join(res_dir, folder, "ic_launcher_round.png")
    make_icon(source_logo, icon_path, size)
    make_icon(source_logo, round_icon_path, size)

make_icon(source_logo, os.path.join(res_dir, "mipmap-hdpi", "ic_launcher_foreground.png"), 162)
make_icon(source_logo, os.path.join(res_dir, "mipmap-mdpi", "ic_launcher_foreground.png"), 108)
make_icon(source_logo, os.path.join(res_dir, "mipmap-xhdpi", "ic_launcher_foreground.png"), 216)
make_icon(source_logo, os.path.join(res_dir, "mipmap-xxhdpi", "ic_launcher_foreground.png"), 324)
make_icon(source_logo, os.path.join(res_dir, "mipmap-xxxhdpi", "ic_launcher_foreground.png"), 432)

print("Generating Single-Line Empire Splash Screens...")
for folder, (w, h) in splash_sizes.items():
    splash_path = os.path.join(res_dir, folder, "splash.png")
    make_splash(source_logo, splash_path, w, h)

print("Single-Line Empire Splash Screens & Icons Generated Successfully!")
