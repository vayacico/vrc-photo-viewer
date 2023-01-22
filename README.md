# :blue_book: vrc photo viewer

![workflow](https://github.com/vayacico/app-viewer-vrc-photo2/actions/workflows/commit.yml/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/vayacico/vrc-photo-viewer/badge.svg)]

## feature

This photo viewer displays photos based on a database created
by [VRChatActivityTools](https://booth.pm/ja/items/1690568).

### :camera: photo

Displays thumbnails of photos grouped by world.

### :earth_asia: world

Displays visited worlds grouped by date. The most recent photo taken in the world is used as the thumbnail.

### :mag: search

Search for photos and worlds by user name or world name. If a user name is specified, photos and worlds visited together
are displayed.

## :construction_worker: develop

This application is developed based on [electron-react-boilerplate](https://electron-react-boilerplate.js.org).

Standard environment for developing electron (node, python, visual studio, etc...) is required.

Build scripts are supported for Windows only.

```
# debug
npm run start

# package
npm run package
```

## licence

MIT
