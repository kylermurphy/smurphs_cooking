/**
 * Recipe Scaling
 * 
 * Allows users to scale recipes by 0.5x, 1x, 2x, or 3x
 * Dynamically updates ingredient quantities and serves count
 */

(function() {
  'use strict';

  // Fraction to decimal mapping for common fractions
  const FRACTIONS = {
    '½': 0.5, '⅓': 1/3, '⅔': 2/3, '¼': 0.25, '¾': 0.75,
    '⅛': 1/8, '⅜': 3/8, '⅝': 5/8, '⅞': 7/8,
    '1/2': 0.5, '1/3': 1/3, '2/3': 2/3, '1/4': 0.25, '3/4': 0.75,
    '1/8': 1/8, '3/8': 3/8, '5/8': 5/8, '7/8': 7/8
  };

  // Reverse mapping: decimal to common fractions
  const DECIMAL_TO_FRACTIONS = {
    '0.5': '½', '0.33': '⅓', '0.67': '⅔', '0.25': '¼', '0.75': '¾',
    '0.125': '⅛', '0.375': '⅜', '0.625': '⅝', '0.875': '⅞'
  };

  let currentScale = 1;
  let originalIngredients = new Map(); // Store original quantities
  let originalServings = null;

  /**
   * Parse a quantity string and return the numeric value
   * Handles formats like "1", "1/2", "½", "1 1/2", etc.
   */
  function parseQuantity(str) {
    if (!str) return 0;
    str = str.trim();
    
    // Check for fractions
    for (const [frac, decimal] of Object.entries(FRACTIONS)) {
      if (str.includes(frac)) {
        const rest = str.replace(frac, '').trim();
        const whole = rest ? parseFloat(rest) : 0;
        return whole + decimal;
      }
    }
    
    // Plain number
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Format a decimal number as a readable quantity
   * 0.5 → "½", 1.5 → "1½", 2 → "2", etc.
   */
  function formatQuantity(num) {
    if (num === 0) return '';
    
    // Round to avoid floating point errors
    num = Math.round(num * 1000) / 1000;
    
    const whole = Math.floor(num);
    const decimal = num - whole;
    
    // No decimal part
    if (decimal === 0) {
      return whole.toString();
    }
    
    // Check if decimal matches a common fraction
    const decimalStr = decimal.toFixed(3);
    for (const [key, val] of Object.entries(DECIMAL_TO_FRACTIONS)) {
      if (Math.abs(parseFloat(key) - decimal) < 0.01) {
        return whole > 0 ? `${whole}${val}` : val;
      }
    }
    
    // Fall back to decimal (rounded to 2 places)
    const decimalPart = decimal.toFixed(2).replace(/\.?0+$/, '');
    return whole > 0 ? `${whole} ${decimalPart}` : decimalPart;
  }

  /**
   * Extract the quantity from an ingredient line
   * "3 cups flour" → "3"
   * "1½ tsp salt" → "1½"
   */
  function extractQuantity(ingredientText) {
    // Match leading numbers, fractions, or mixed fractions
    const match = ingredientText.match(/^(\d+(?:\.\d+)?|\d+\s*\/\s*\d+|[½⅓⅔¼¾⅛⅜⅝⅞]|\d+\s*[½⅓⅔¼¾⅛⅜⅝⅞]|\d+\s*\d+\s*\/\s*\d+)/);
    return match ? match[0] : null;
  }

  /**
   * Scale an ingredient quantity
   */
  function scaleQuantity(originalQty, scale) {
    if (!originalQty) return '';
    
    const parsed = parseQuantity(originalQty);
    if (parsed === 0) return '';
    
    const scaled = parsed * scale;
    return formatQuantity(scaled);
  }

  /**
   * Initialize: store original ingredient quantities
   */
  function initializeIngredients() {
    const ingredientsList = document.querySelector('.recipe-body ul');
    
    if (!ingredientsList) return;
    
    const items = ingredientsList.querySelectorAll('li');
    originalIngredients.clear();
    
    items.forEach((item, index) => {
      const text = item.textContent.trim();
      const qty = extractQuantity(text);
      originalIngredients.set(index, {
        original: text,
        quantity: qty
      });
    });
  }

  /**
   * Update ingredient quantities based on current scale
   */
  function updateIngredients() {
    const ingredientsList = document.querySelector('.recipe-body ul');
    
    if (!ingredientsList) return;
    
    const items = ingredientsList.querySelectorAll('li');
    
    items.forEach((item, index) => {
      const data = originalIngredients.get(index);
      if (!data) return;
      
      const { original, quantity } = data;
      
      if (currentScale === 1) {
        // Back to original
        item.textContent = original;
      } else if (quantity) {
        // Scale the quantity
        const scaled = scaleQuantity(quantity, currentScale);
        const rest = original.substring(quantity.length).trim();
        item.textContent = scaled ? `${scaled} ${rest}` : rest;
      } else {
        // No quantity to scale
        item.textContent = original;
      }
    });
  }

  /**
   * Update the "Serves" count
   */
  function updateServings() {
    const servesElement = document.querySelector('[itemprop="recipeYield"]');
    
    if (!servesElement) return;
    
    if (!originalServings) {
      originalServings = servesElement.textContent.trim();
    }
    
    if (currentScale === 1) {
      servesElement.textContent = originalServings;
    } else {
      // Try to extract number from "4 servings" format
      const match = originalServings.match(/^(\d+)/);
      if (match) {
        const originalCount = parseInt(match[1]);
        const scaled = Math.round(originalCount * currentScale);
        const label = originalServings.substring(match[0].length);
        servesElement.textContent = `${scaled}${label}`;
      }
    }
  }

  /**
   * Handle scale button clicks
   */
  function setupScaleButtons() {
    const buttons = document.querySelectorAll('.scale-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        const scale = parseFloat(this.getAttribute('data-scale'));
        
        // Update active state
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Update scale
        currentScale = scale;
        updateIngredients();
        updateServings();
        
        // Scroll to ingredients
        const body = document.querySelector('.recipe-body');
        if (body) {
          body.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /**
   * Initialize on page load
   */
  document.addEventListener('DOMContentLoaded', function() {
    initializeIngredients();
    setupScaleButtons();
  });
})();
