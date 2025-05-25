// src/utils/imagePreloader.js
import getFullImageUrl from './getFullImageUrl';
import { cityImageMap } from '../constants/cityImages';

// Track which images are currently loading
const loadingImages = new Set();

// Maximum number of concurrent image loads
const MAX_CONCURRENT_LOADS = 3;

// Queue for pending image loads
const imageQueue = [];

// Process the next image in the queue
const processNextQueueItem = () => {
  // If we've reached our concurrency limit, don't load more
  if (loadingImages.size >= MAX_CONCURRENT_LOADS) {
    return;
  }
  
  // If queue is empty, nothing to do
  if (imageQueue.length === 0) {
    return;
  }
  
  // Get the next item with highest priority
  const { imageUrl, callback } = imageQueue.shift();
  
  // Avoid loading the same image twice
  if (loadingImages.has(imageUrl)) {
    // Process next item instead
    processNextQueueItem();
    return;
  }
  
  // Track that we're loading this image
  loadingImages.add(imageUrl);
  
  // Create and load the image
  const img = new Image();
  
  img.onload = () => {
    // Remove from loading set
    loadingImages.delete(imageUrl);
    
    // Execute callback if provided
    if (callback) callback(imageUrl, true);
    
    // Try to load next image
    processNextQueueItem();
  };
  
  img.onerror = () => {
    // Remove from loading set
    loadingImages.delete(imageUrl);
    
    // Execute callback if provided
    if (callback) callback(imageUrl, false);
    
    // Try to load next image
    processNextQueueItem();
  };
  
  // Start loading
  img.src = imageUrl;
};

// Add an image to the loading queue with priority
const queueImageForLoading = (imageUrl, priority = 0, callback = null) => {
  // Find insert position based on priority (higher priority = lower index)
  let insertIndex = imageQueue.length;
  
  for (let i = 0; i < imageQueue.length; i++) {
    if (priority > imageQueue[i].priority) {
      insertIndex = i;
      break;
    }
  }
  
  // Insert the new item at the appropriate position
  imageQueue.splice(insertIndex, 0, { imageUrl, priority, callback });
  
  // Try to process the queue
  processNextQueueItem();
};

// Preload city images with priorities
export const preloadCityImages = (cities, visibleCityIds = []) => {
  // Clear any existing queue to start fresh
  imageQueue.length = 0;
  
  cities.forEach(city => {
    const isVisible = visibleCityIds.includes(city._id);
    const imageUrl = getFullImageUrl(city.imageUrl);
    
    // Higher priority for visible cities
    const priority = isVisible ? 10 : 0;
    
    // Queue the main image
    queueImageForLoading(imageUrl, priority);
    
    // Also queue the fallback if it exists
    if (cityImageMap[city.name]) {
      const fallbackUrl = cityImageMap[city.name];
      // Fallbacks have slightly lower priority
      queueImageForLoading(fallbackUrl, priority - 1);
    }
  });
  
  // Start processing the queue
  for (let i = 0; i < MAX_CONCURRENT_LOADS; i++) {
    processNextQueueItem();
  }
};

// Export other functions that might be needed from other components
export const loadSingleImage = (imageUrl, priority = 0, callback = null) => {
  queueImageForLoading(imageUrl, priority, callback);
};