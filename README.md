# Zorus V1

A dark premium purple Glassmorphism front-end starter for Android WebView / future APK packaging.

## Included in this V1
- Responsive mobile-first interface
- TikTok, Instagram and YouTube URL recognition
- Clipboard paste button (browser permission permitting)
- Local saved-links library and recent history
- Settings page and local data reset

## Important limitation
This starter does **not** download media. It only validates and organizes links. Add a lawful, platform-permitted media source or official export flow before implementing retrieval. Do not bypass platform access controls, DRM, or creator restrictions.

## Run locally
Open `index.html` in a browser, or serve this folder with a local static web server.

## Files
- `index.html` - app structure
- `style.css` - visual design
- `script.js` - interactions and local storage
- `manifest.json` - basic web app metadata


## V1.1 local video import
- Select a video file stored on the device.
- Preview it in the app.
- Request a local download/save copy through the browser.
- The selected video is not uploaded to a server.
- The selected video is not retained after the page is closed or refreshed.

This does not download videos from TikTok, Instagram, or YouTube links. Platform links are recognized and saved as links only. Use official platform export/download features or media you are authorized to access.
