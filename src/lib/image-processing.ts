import sharp from 'sharp'
import { encode } from 'blurhash'

export async function generateBlurHash(imagePath: string): Promise<string> {
  try {
    // Use Sharp to process the image to a small size for BlurHash
    const { data, info } = await sharp(imagePath)
      .resize(32, 32, { fit: 'cover' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Convert the raw buffer to Uint8ClampedArray for BlurHash
    const imageData = new Uint8ClampedArray(data)

    // Generate BlurHash
    const blurHash = encode(imageData, info.width, info.height, 10, 5)
    return blurHash
  } catch (error) {
    console.error('Error generating BlurHash:', error)
    // Return a default BlurHash for a neutral gray color
    return 'L6PZfSjF.AyE.7kCMxo#?^R4_2M|'
  }
}

export function generateGenericBlurHash(mimetype: string): string {
  // Generate different colored BlurHashes for different media types
  if (mimetype.startsWith('video/')) {
    // Blue-ish BlurHash for videos
    return 'L03]^?M{0000?^IV.8kC00%MRiRj'
  } else if (mimetype.startsWith('audio/')) {
    // Green-ish BlurHash for audio
    return 'L03?E4M{00?^?^IV.8kC00%MRiRj'
  } else {
    // Gray BlurHash for other files
    return 'L6PZfSjF.AyE.7kCMxo#?^R4_2M|'
  }
}

export async function getImageDimensions(
  imagePath: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(imagePath).metadata()
    if (metadata.width && metadata.height) {
      return {
        width: metadata.width,
        height: metadata.height,
      }
    }
    return null
  } catch (error) {
    console.error('Error getting image dimensions:', error)
    return null
  }
}
