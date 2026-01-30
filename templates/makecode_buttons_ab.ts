// MakeCode (TypeScript) template: ボタンA/Bで絵を切替
// 手順: MakeCode の「JavaScript」タブにこのコードを貼り付け、"Download" で .hex を取得してください。

basic.showIcon(IconNames.Happy)
input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Heart)
})
input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Happy)
})
