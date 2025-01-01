# Figma Image Downloader

This package allows you to download images (SVG and PNG) from Figma using the Figma API.

## Installation

```bash
npm install figma-image-downloader


 ## Usage
const { downloadImages } = require('figma-image-downloader');

const figmaFileId = 'your-figma-file-id';
const accessToken = 'your-figma-access-token';

downloadImages(figmaFileId, accessToken, ['svg', 'png']);