#!/usr/bin/env python3
# Create distribution package for micro:bit lesson
import os
import shutil
import zipfile

def create_package():
    base_dir = r"c:\Users\atchy\Streamli"
    package_name = "microbit_1st_grade_lesson_package"
    package_dir = os.path.join(base_dir, package_name)
    
    # Create package directory
    os.makedirs(package_dir, exist_ok=True)
    
    # Create subdirectories
    dirs = ["guides", "worksheets", "templates", "qrcodes", "resources"]
    for d in dirs:
        os.makedirs(os.path.join(package_dir, d), exist_ok=True)
    
    # Copy files
    copies = [
        (os.path.join(base_dir, "teacher_guide_microbit_1st_grade.md"), 
         os.path.join(package_dir, "guides", "teacher_guide_microbit_1st_grade.md")),
        (os.path.join(base_dir, "teacher_guide_microbit_1st_grade.pdf"), 
         os.path.join(package_dir, "guides", "teacher_guide_microbit_1st_grade.pdf")),
        (os.path.join(base_dir, "student_worksheet_microbit_1st_grade.md"), 
         os.path.join(package_dir, "worksheets", "student_worksheet_microbit_1st_grade.md")),
        (os.path.join(base_dir, "student_worksheet_microbit_1st_grade.pdf"), 
         os.path.join(package_dir, "worksheets", "student_worksheet_microbit_1st_grade.pdf")),
        (os.path.join(base_dir, "templates", "makecode_smile_template.ts"), 
         os.path.join(package_dir, "templates", "makecode_smile_template.ts")),
        (os.path.join(base_dir, "templates", "microbit_smile_template.py"), 
         os.path.join(package_dir, "templates", "microbit_smile_template.py")),
        (os.path.join(base_dir, "templates", "README_generate_hex.md"), 
         os.path.join(package_dir, "resources", "README_generate_hex.md")),
    ]
    
    for src, dst in copies:
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied: {os.path.basename(src)}")
        else:
            print(f"Not found: {src}")
    
    # Copy QR codes
    qrcodes_dir = os.path.join(base_dir, "qrcodes")
    if os.path.exists(qrcodes_dir):
        for file in os.listdir(qrcodes_dir):
            if file.endswith(".png"):
                shutil.copy2(
                    os.path.join(qrcodes_dir, file),
                    os.path.join(package_dir, "qrcodes", file)
                )
                print(f"Copied QR: {file}")
    
    # Create README for package
    readme_content = """# 小学校1年生 プログラミング授業パッケージ
## タブレット＋micro:bit

### 📂 ファイル構成

- **guides/** — 教師向け完全指導案（Markdown/PDF）
- **worksheets/** — 児童用ワークシート（Markdown/PDF）
- **templates/** — MakeCode/MicroPython テンプレート
- **qrcodes/** — リソースへのQRコード（印刷用）
- **resources/** — .hex生成方法ガイド

### 🚀 使い方

1. **教師の準備**
   - `guides/teacher_guide_microbit_1st_grade.pdf` を印刷・確認
   - `templates/makecode_smile_template.ts` でMakeCode上に.hexを作成
   - `qrcodes/` のQR画像を印刷

2. **授業実施**
   - `worksheets/student_worksheet_microbit_1st_grade.pdf` を児童に配布
   - MakeCodeのQRコード（タブレット用）を提示

3. **micro:bit転送**
   - `resources/README_generate_hex.md` の手順に従う

### 📚 参考リンク（QRコード）
- MakeCode: `qrcodes/qr_makecode_new_project.png`
- micro:bit公式: `qrcodes/qr_microbit_official.png`

---

作成日：2026-01-30
"""
    with open(os.path.join(package_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_content)
    print("Created README.md")
    
    # Create ZIP
    zip_path = os.path.join(base_dir, f"{package_name}.zip")
    shutil.make_archive(
        os.path.splitext(zip_path)[0],
        'zip',
        base_dir,
        package_name
    )
    print(f"\n✅ Package created: {zip_path}")
    print(f"📦 Total size: {os.path.getsize(zip_path) / 1024:.1f} KB")

if __name__ == '__main__':
    create_package()
