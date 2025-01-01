declare module "figma-image-downloader" {
  export function downloadFigmaImages(
    fileId: string,
    token: string,
    outputPath: string
  ): Promise<void>;
}
