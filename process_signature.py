import os
from PIL import Image, ImageOps, ImageEnhance

input_path = r"C:\Users\ediva\.gemini\antigravity-ide\brain\a633431b-e251-40c4-b88f-a2b5783e11ea\.user_uploaded\media_1787458422341.jpg"
output_path = r"c:\QLex\frontend\public\founder-signature.png"

os.makedirs(os.path.dirname(output_path), exist_ok=True)

img = Image.open(input_path).convert("L") # Convert to grayscale

# Contrast enhancement to make ink lines stand out sharply
enhancer = ImageEnhance.Contrast(img)
img_contrast = enhancer.enhance(2.5)

# Invert so ink lines become light (255) and white paper becomes dark (0)
img_inv = ImageOps.invert(img_contrast)

# Thresholding so paper is 0 alpha, ink is alpha
threshold = 60
mask = img_inv.point(lambda p: 255 if p > threshold else 0)

# Create RGBA image with Gold Color (#fbbf24 -> R:251, G:191, B:36)
gold_color = (251, 191, 36) # Golden Amber accent
result = Image.new("RGBA", img.size, gold_color + (0,))
result.putalpha(mask)

# Crop tight around signature
bbox = result.getbbox()
if bbox:
    result = result.crop(bbox)

result.save(output_path, "PNG")
print("Signature processed successfully to golden transparent PNG:", output_path)
