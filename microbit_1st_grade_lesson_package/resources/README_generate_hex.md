# .hex テンプレート生成手順（MakeCode を使う簡易手順）

以下は、作成済みのテンプレート（TypeScript / MicroPython）から `.hex` を取得する簡単な手順です。

手順 A: MakeCode（推奨）
1. タブレットまたはPCで https://makecode.microbit.org を開く。
2. 右上の「新しいプロジェクト」を選択。
3. 画面上部の「JavaScript」タブに切り替え、`templates/makecode_smile_template.ts` の中身をすべて貼り付ける。
4. 「Download」または「ダウンロード」を押すと `.hex` が生成されます。

手順 B: MicroPython（代替）
1. `templates/microbit_smile_template.py` のコードをコピー。
2. MicroPython → .hex 変換が可能なオンラインツール（または PC のツール）で `.hex` に変換する。

注意:
- オンラインでのコンパイルが必要です（MakeCode のダウンロード機能を使うのが最も簡単です）。
- 環境によっては直接タブレットから Bluetooth 転送が可能です。MakeCode の "Pair device" 機能を活用してください。
