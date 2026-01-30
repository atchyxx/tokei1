// MakeCode (TypeScript) template: Aボタンでハート表示
// 手順: MakeCode の「JavaScript」タブにこのコードを貼り付け、"Download" で .hex を取得してください。

basic.showString("READY")
input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Heart)
    basic.pause(500)
    basic.clearScreen()
})
