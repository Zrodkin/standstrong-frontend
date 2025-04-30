const getFullImageUrl = (imagePath, type = 'image') => {
  console.log(`getFullImageUrl called with path: ${imagePath}, type: ${type}`);
  
  // If no image path provided, return placeholder
  if (!imagePath) {
    console.log("No image path provided, returning empty string");
    return '';
  }

  // If it's already a full URL, return it
  if (imagePath.startsWith("http")) {
    console.log("Full URL detected, returning as is");
    return imagePath;
  }

  // Check if the path already contains a specific folder
  let imageType = type;
  if (imagePath.includes('partner-logos')) {
    console.log("Partner logo detected in path");
    imageType = 'logo';
  } else if (imagePath.includes('class-images')) {
    console.log("Class image detected in path");
    imageType = 'image';
  }

  // Get the base URL from environment variables
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  
  // If the path already starts with /uploads, use it as is
  if (imagePath.startsWith('/uploads/')) {
    const finalUrl = `${baseUrl}${imagePath}`;
    console.log(`Using original path. Final URL: ${finalUrl}`);
    return finalUrl;
  }
  
  // Otherwise, construct the path based on the type
  const folder = imageType === 'logo' ? 'partner-logos' : 'class-images';
  
  // Extract filename if the path contains directories
  const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
  
  const finalUrl = `${baseUrl}/uploads/${folder}/${filename}`;
  console.log(`Constructed URL: ${finalUrl}`);
  return finalUrl;
};

export default getFullImageUrl;
  