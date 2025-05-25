// src/utils/ImageObserver.js
// A utility to track visible elements in the viewport using IntersectionObserver

// Map to store all observed elements
const observedElements = new Map();

// Set of currently visible element IDs
const visibleElements = new Set();

// Default options for the observer
const defaultOptions = {
  rootMargin: '100px', // Start loading when within 100px of viewport
  threshold: 0.1       // Consider visible when 10% is in viewport
};

// The shared IntersectionObserver instance
let observer = null;

// Initialize the observer
const initObserver = () => {
  if (typeof IntersectionObserver === 'undefined') {
    console.warn('IntersectionObserver not supported in this browser. All images will load without prioritization.');
    return false;
  }
  
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.dataset.observerId;
        
        if (entry.isIntersecting) {
          // Element is now visible
          visibleElements.add(id);
          
          // Call the onVisible callback if provided
          const element = observedElements.get(id);
          if (element && element.onVisible) {
            element.onVisible(entry.target);
          }
        } else {
          // Element is no longer visible
          visibleElements.delete(id);
          
          // Call the onHidden callback if provided
          const element = observedElements.get(id);
          if (element && element.onHidden) {
            element.onHidden(entry.target);
          }
        }
      });
    }, defaultOptions);
  }
  
  return true;
};

// Generate a unique ID for an element
let nextId = 1;
const generateId = () => `observed-element-${nextId++}`;

// Register an element to be observed
export const observeElement = (element, callbacks = {}) => {
  // Initialize observer if needed
  if (!initObserver()) {
    // If observer can't be initialized, call onVisible immediately
    if (callbacks.onVisible) {
      callbacks.onVisible(element);
    }
    return null;
  }
  
  // Generate a unique ID for this element
  const id = generateId();
  element.dataset.observerId = id;
  
  // Store the element and callbacks
  observedElements.set(id, {
    element,
    onVisible: callbacks.onVisible || null,
    onHidden: callbacks.onHidden || null
  });
  
  // Start observing
  observer.observe(element);
  
  // Return the ID so it can be used to unobserve later
  return id;
};

// Unregister an element
export const unobserveElement = (id) => {
  if (!observer) return;
  
  if (typeof id === 'string') {
    // If given an ID, find the element in our map
    const element = observedElements.get(id)?.element;
    if (element) {
      observer.unobserve(element);
      observedElements.delete(id);
      visibleElements.delete(id);
    }
  } else if (id instanceof Element) {
    // If given an element directly, find its ID
    const elementId = id.dataset.observerId;
    if (elementId) {
      observer.unobserve(id);
      observedElements.delete(elementId);
      visibleElements.delete(elementId);
    }
  }
};

// Get the list of visible element IDs
export const getVisibleElementIds = () => {
  return Array.from(visibleElements);
};

// Determine if an element is currently visible
export const isElementVisible = (id) => {
  return visibleElements.has(id);
};

// Get a list of all observed elements
export const getAllObservedElements = () => {
  return Array.from(observedElements.entries()).map(([id, data]) => ({
    id,
    element: data.element,
    isVisible: visibleElements.has(id)
  }));
};

// Clean up resources
export const disconnect = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  observedElements.clear();
  visibleElements.clear();
};