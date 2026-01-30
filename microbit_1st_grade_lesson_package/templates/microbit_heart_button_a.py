# MicroPython template: Aボタンでハート表示
# 手順: タブレット/PC のエディタでこのコードを保存し、MicroPython 用の変換ツール/MakeCode で .hex に変換してください。

from microbit import *

display.show("READY")
while True:
    if button_a.is_pressed():
        display.show(Image.HEART)
        sleep(500)
        display.clear()
