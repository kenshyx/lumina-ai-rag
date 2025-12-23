# PWA Icons

The PWA manifest references icon files for better app icon support. These are optional but recommended for the best user experience.

## Required Icons

The following icon files are referenced in `manifest.json` but are optional:

- `icon-192.png` - 192x192 pixels PNG icon
- `icon-512.png` - 512x512 pixels PNG icon

## Current Setup

Currently, the app uses `/lumina.svg` as the primary icon, which works for most browsers. The PNG icons provide better support for:
- Android home screen icons
- iOS home screen icons (though iOS has limited PWA support)
- Windows Start menu tiles
- Better icon quality at different sizes

## Generating Icons

You can generate these icons from the SVG file using tools like:

1. **Online tools**: 
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)

2. **Command line**:
   ```bash
   # Using ImageMagick (if installed)
   convert lumina.svg -resize 192x192 icon-192.png
   convert lumina.svg -resize 512x512 icon-512.png
   ```

3. **Manual**: Export the SVG at the required sizes using a graphics editor

## Installation

Once generated, place the icon files in the `public/` directory:
- `public/icon-192.png`
- `public/icon-512.png`

The app will automatically use them when available. The SVG icon will continue to work as a fallback.

