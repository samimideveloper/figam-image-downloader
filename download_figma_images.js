const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Function to download images from a Figma file
async function downloadFigmaImages(FIGMA_API_TOKEN, FILE_ID) {
  const FIGMA_API_URL = `https://api.figma.com/v1/files/${FILE_ID}`;
  const OUTPUT_DIR = path.resolve(__dirname, "figma_images");

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  // Fetch the Figma file metadata
  async function fetchFigmaFile() {
    const response = await fetch(FIGMA_API_URL, {
      headers: {
        "X-Figma-Token": FIGMA_API_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching Figma file: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  // Fetch image URLs (either SVG or PNG format)
  async function fetchImageUrls(nodeIds, format = "svg") {
    const response = await fetch(
      `https://api.figma.com/v1/images/${FILE_ID}?ids=${nodeIds}&format=${format}`,
      {
        headers: {
          "X-Figma-Token": FIGMA_API_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching image URLs (${format}): ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.images;
  }

  // Download the image from the provided URL and save it to the file system
  async function downloadImage(url, fileName) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error downloading image: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const filePath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(filePath, buffer);
    console.log(`Downloaded: ${fileName}`);
  }

  // Sanitize the file name by removing any special characters
  function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9-_\.]/g, "_");
  }

  try {
    console.log("Fetching Figma file...");
    const fileData = await fetchFigmaFile();

    console.log("Extracting image nodes...");
    const imageNodes = [];

    // Recursively extract image nodes from the file
    function extractImages(node) {
      if (
        node.type === "COMPONENT" ||
        node.type === "FRAME" ||
        (node.fills && node.fills.some((fill) => fill.type === "IMAGE"))
      ) {
        imageNodes.push(node.id);
      }
      if (node.children) {
        node.children.forEach(extractImages);
      }
    }

    fileData.document.children.forEach(extractImages);

    if (imageNodes.length === 0) {
      console.log("No image nodes found.");
      return;
    }

    console.log(`Found ${imageNodes.length} image nodes. Fetching URLs...`);

    // Fetch URLs for both SVG and PNG formats
    const svgImageUrls = await fetchImageUrls(imageNodes.join(","), "svg");
    const pngImageUrls = await fetchImageUrls(imageNodes.join(","), "png");

    console.log("Downloading images...");

    // Download all SVG images
    for (const [nodeId, svgUrl] of Object.entries(svgImageUrls)) {
      if (!svgUrl) {
        console.log(`No SVG URL for node ${nodeId}, skipping.`);
        continue;
      }
      const sanitizedFileNameSvg = sanitizeFileName(`image_${nodeId}.svg`);
      try {
        await downloadImage(svgUrl, sanitizedFileNameSvg);
      } catch (err) {
        console.error(`Failed to download SVG image ${nodeId}: ${err.message}`);
      }
    }

    // Download all PNG images
    for (const [nodeId, pngUrl] of Object.entries(pngImageUrls)) {
      if (!pngUrl) {
        console.log(`No PNG URL for node ${nodeId}, skipping.`);
        continue;
      }
      const sanitizedFileNamePng = sanitizeFileName(`image_${nodeId}.png`);
      try {
        await downloadImage(pngUrl, sanitizedFileNamePng);
      } catch (err) {
        console.error(`Failed to download PNG image ${nodeId}: ${err.message}`);
      }
    }

    console.log("All images downloaded successfully!");
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Export the function so it can be used in other files
module.exports = { downloadFigmaImages };
