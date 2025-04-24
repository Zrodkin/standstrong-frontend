const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    return `${baseUrl}${imagePath}`;
  };
  
  export default getFullImageUrl;
  