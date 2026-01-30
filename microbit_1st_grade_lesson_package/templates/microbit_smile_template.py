# MicroPython template: ニコちゃん点滅
# 手順: タブレット/PC のエディタでこのコードを保存し、MicroPython 用の変換ツール/MakeCode で .hex に変換してください。

from microbit import *

while True:
    display.show(Image.HAPPY)
    sleep(500)
    display.clear()
    sleep(300)
