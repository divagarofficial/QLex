import os
from PIL import Image

def make_icon(source_path, target_path, size):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    img = Image.open(source_path).convert("RGBA")
    # Resize keeping aspect ratio or square fit
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(target_path, "PNG")

def make_splash(source_path, target_path, width, height, bg_color=(15, 23, 42, 255)): # #0f172a
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    # Create canvas
    canvas = Image.new("RGBA", (width, height), bg_color)
    
    logo = Image.open(source_path).convert("RGBA")
    
    # Calculate scale factor so logo occupies ~40% of minimum screen dimension
    min_dim = min(width, height)
    target_logo_size = int(min_dim * 0.45)
    
    # Maintain aspect ratio of logo
    w_ratio = target_logo_size / logo.width
    h_ratio = target_logo_size / logo.height
    scale = min(w_ratio, h_ratio)
    
    new_w = int(logo.width * scale)
    new_h = int(logo.height * scale)
    
    logo_resized = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center on canvas
    x = (width - new_w) // 2
    y = (height - new_h) // 2
    
    canvas.paste(logo_resized, (x, y), logo_resized)
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

print("Generating App Icons...")
for folder, size in icon_sizes.items():
    icon_path = os.path.join(res_dir, folder, "ic_launcher.png")
    round_icon_path = os.path.join(res_dir, folder, "ic_launcher_round.png")
    make_icon(source_logo, icon_path, size)
    make_icon(source_logo, round_icon_path, size)

# Foreground icon for adaptive icons (mipmap-hdpi, xhdpi, etc)
make_icon(source_logo, os.path.join(res_dir, "mipmap-hdpi", "ic_launcher_foreground.png"), 162)
make_icon(source_logo, os.path.join(res_dir, "mipmap-mdpi", "ic_launcher_foreground.png"), 108)
make_icon(source_logo, os.path.join(res_dir, "mipmap-xhdpi", "ic_launcher_foreground.png"), 216)
make_icon(source_logo, os.path.join(res_dir, "mipmap-xxhdpi", "ic_launcher_foreground.png"), 324)
make_icon(source_logo, os.path.join(res_dir, "mipmap-xxxhdpi", "ic_launcher_foreground.png"), 432)

print("Generating Splash Screens...")
for folder, (w, h) in splash_sizes.items():
    splash_path = os.path.join(res_dir, folder, "splash.png")
    make_splash(source_logo, splash_path, w, h)

print("All Android branding assets generated successfully!")
