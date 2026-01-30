#!/usr/bin/env python3
# Generate QR codes for lesson resources
import qrcode
import os

URLS = {
    "makecode_new_project": "https://makecode.microbit.org",
    "makecode_documentation": "https://makecode.microbit.org/reference",
    "microbit_official": "https://microbit.org",
}

def generate_qr(text, filename):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)
    print(f"Generated: {filename}")

def main():
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'qrcodes')
    os.makedirs(output_dir, exist_ok=True)
    
    for name, url in URLS.items():
        filename = os.path.join(output_dir, f"qr_{name}.png")
        generate_qr(url, filename)
    
    print("All QR codes generated in 'qrcodes/' directory")

if __name__ == '__main__':
    main()
