# VRCフォトビューワー

![Workflow Status](https://github.com/vayacico/vrc-photo-viewer/actions/workflows/commit.yml/badge.svg)
![Known Vulnerabilities](https://snyk.io/test/github/vayacico/vrc-photo-viewer/badge.svg)

## 📘 Features

[VRChatActivityTools](https://booth.pm/ja/items/1690568)によって生成されたデータベースから写真を表示します。

<img src="https://user-images.githubusercontent.com/11732151/214317314-dded4414-b70a-41e3-878e-554c3cbabab4.png" width="70%">

### 📸 Photos

撮影されたワールドごとに整理された写真のサムネイルを展示します。

サムネイルをクリックすると、詳細ビューが開き、元のサイズの写真と対応する参加ログを見ることができます。

### 🌍 Worlds

訪問したワールドを日付順に表示します。各ワールドのサムネイルは、そこで最も最近撮影された写真です。

### 🔍 Search

ユーザー名またはワールド名で写真やワールドを検索できます。ユーザー名を指定すると、そのユーザーと一緒に撮影された写真や訪れたワールドが表示されます。

## 👷 Development

このアプリケーションは[electron-react-boilerplate](https://electron-react-boilerplate.js.org)を使用して開発されています。

Electron用の標準的な開発環境（Node.js、Python、Visual Studioなど）が必要です。

ビルドスクリプトは現在、Windowsのみでサポートされています。

```bash
# デバッグモードでアプリケーションを起動するには
npm run start

# アプリケーションをパッケージするには
npm run package
```

## ライセンス

MIT
