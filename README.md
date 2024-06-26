# VRC Photo Viewer

![Workflow Status](https://github.com/vayacico/vrc-photo-viewer/actions/workflows/commit.yml/badge.svg)
![Known Vulnerabilities](https://snyk.io/test/github/vayacico/vrc-photo-viewer/badge.svg)

## 📘 Features

VRC Photo Viewer presents photos from a database generated by [VRChatActivityTools](https://booth.pm/ja/items/1690568).

<img src="https://user-images.githubusercontent.com/11732151/214317314-dded4414-b70a-41e3-878e-554c3cbabab4.png" width="70%">

### 📸 Photos

Showcases photo thumbnails organized by the world they were taken in.

Clicking on a thumbnail opens a detailed view where you can see the photo in its original size and the corresponding
join log.

### 🌍 Worlds

Displays the worlds you have visited, sorted by date. The thumbnail for each world is the most recent photo taken there.

### 🔍 Search

Allows you to search for photos and worlds by user name or world name. Specifying a user name will display the photos
taken and worlds visited with that user.

## 👷 Development

This application is developed with [electron-react-boilerplate](https://electron-react-boilerplate.js.org).

A standard development environment for Electron (Node.js, Python, Visual Studio, etc.) is required.

Build scripts are currently only supported for Windows.

```bash
# To start the application in debug mode
npm run start

# To package the application
npm run package
```

## licence

MIT
