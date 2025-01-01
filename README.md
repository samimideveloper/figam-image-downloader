# Figma Image Downloader

This package allows you to download images (SVG and PNG) from Figma using the Figma API.**This package is designed to work in a Node.js environment only**.

## Installation

```bash
npm install figma-image-downloader

```

## Usage

```bash
const { downloadFigmaImages } = require('figma-image-downloader');

// Replace with your own Figma API token and file ID

const FIGMA_API_TOKEN = 'your_figma_api_token';


// For example, find the FILE_ID https://www.figma.com/file/1KaD8KN7KzGOOSoTc3wdqJ/My-Design-File

// This your_figma_file_id = 1KaD8KN7KzGOOSoTc3wdqJ

const FILE_ID = 'your_figma_file_id';

// Call the function to download images (SVG and PNG) from the Figma file

downloadFigmaImages(FIGMA_API_TOKEN, FILE_ID);

```
