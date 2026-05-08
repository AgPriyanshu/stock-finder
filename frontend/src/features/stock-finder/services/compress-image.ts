import imageCompression from "browser-image-compression";

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  contentType: "image/jpeg";
}

export const getImageDimensions = async (
  file: Blob
): Promise<ImageDimensions> => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    const dimensions = await new Promise<ImageDimensions>((resolve, reject) => {
      image.onload = () =>
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () =>
        reject(new Error("Could not read image dimensions"));
      image.src = objectUrl;
    });

    return dimensions;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const compressImage = async (file: File): Promise<CompressedImage> => {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 1600,
    initialQuality: 0.8,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
  const dimensions = await getImageDimensions(compressed);

  return {
    blob: compressed,
    width: dimensions.width,
    height: dimensions.height,
    contentType: "image/jpeg",
  };
};
