# PWA Assets Guide

You need to create the following icon files and place them in the public directory:

1. `favicon.ico` - Favicon for the website
2. `apple-touch-icon.png` - 180x180 px icon for iOS devices
3. `pwa-192x192.png` - 192x192 px icon for Android devices
4. `pwa-512x512.png` - 512x512 px icon for Android devices and maskable icon

You can use tools like:

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Favicon Generator](https://realfavicongenerator.net/)

Command to generate icons with PWA Asset Generator:

```
npx pwa-asset-generator your-logo.png ./public --icon-only --favicon --opaque false --manifest ./public/manifest.json
```
