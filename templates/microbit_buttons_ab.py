# MicroPython template: ボタンA/Bで絵を切替
# 手順: タブレット/PC のエディタでこのコードを保存し、MicroPython 用の変換ツール/MakeCode で .hex に変換してください。

from microbit import *

display.show(Image.HAPPY)
while True:
    if button_a.is_pressed():
        display.show(Image.HEART)
        sleep(200)
    if button_b.is_pressed():
        display.show(Image.HAPPY)
        sleep(200)
