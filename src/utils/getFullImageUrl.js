// src/utils/getFullImageUrl.js
/**
 * Gets the full URL for an image with support for different sizes and formats
 * @param {string} imagePath - The relative path to the image
 * @param {string} size - The desired size (thumbnail, small, medium, large, or original)
 * @param {string} type - The type of image (image or logo)
 * @returns {string} The full URL to the image
 */
const getFullImageUrl = (imagePath, size = 'original', type = 'image') => {
  // If no image path provided, return placeholder
  if (!imagePath) {
    return '/placeholder.svg';
  }

  // If it's already a full URL, return it
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Determine the folder based on the path or specified type
  let imageType = type;
  if (imagePath.includes('partner-logos')) {
    imageType = 'logo';
  } else if (imagePath.includes('class-images')) {
    imageType = 'image';
  }
  
  // Get the base URL from environment variables
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  
  // Extract filename if the path contains directories
  const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
  
  // Determine the folder based on the type
  const folder = imageType === 'logo' ? 'partner-logos' : 'class-images';
  
  // Get the file extension
  const extension = filename.includes('.') ? filename.split('.').pop() : '';
  
  // Get the filename without extension
  const nameWithoutExt = filename.includes('.') 
    ? filename.substring(0, filename.lastIndexOf('.')) 
    : filename;
  
  // Determine the correct size suffix based on the requested size
  let sizeModifier = '';
  switch(size) {
    case 'thumbnail':
      sizeModifier = '-thumb';
      break;
    case 'small':
      sizeModifier = '-sm';
      break;
    case 'medium':
      sizeModifier = '-md';
      break;
    case 'large':
      sizeModifier = '-lg';
      break;
    default:
      sizeModifier = ''; // Original size
  }
  
  // Check if the path already starts with /uploads
  if (imagePath.startsWith('/uploads/')) {
    // Extract the path components to rebuild with size
    const pathParts = imagePath.split('/');
    const folderIndex = pathParts.indexOf('uploads') + 1;
    const imageFolder = pathParts[folderIndex];
    
    // If this is the new format with sized WebP images, use that format
    if (size !== 'original' && sizeModifier) {
      // Construct the path with size suffix
      pathParts[pathParts.length - 1] = `${nameWithoutExt}${sizeModifier}.webp`;
    }
    
    return `${baseUrl}${pathParts.join('/')}`;
  }
  
  // For newer images where we might have WebP versions with different sizes
  if (size !== 'original' && sizeModifier) {
    return `${baseUrl}/uploads/${folder}/${nameWithoutExt}${sizeModifier}.webp`;
  }
  
  // Default path for original images
  return `${baseUrl}/uploads/${folder}/${filename}`;
};

export default getFullImageUrl;