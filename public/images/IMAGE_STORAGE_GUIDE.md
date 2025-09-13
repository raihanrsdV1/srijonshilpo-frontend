# Image Storage Guide for Srijonshilpo E-commerce

## Directory Structure

```
public/
  images/
    defaults/          # Default product images (when user doesn't upload any)
    uploads/           # User uploaded images (create this directory)
    categories/        # Category images
    banners/          # Store banner images
```

## Recommended Image Specifications

### Product Images
- **Format**: JPEG, PNG, WebP
- **Size**: 800x800px (square format recommended)
- **Max file size**: 2MB per image
- **Multiple images**: Support up to 5 images per product

### Category Images
- **Format**: JPEG, PNG, WebP
- **Size**: 400x300px
- **Max file size**: 1MB

### Banner Images
- **Format**: JPEG, PNG, WebP
- **Size**: 1200x400px
- **Max file size**: 3MB

## Default Images System

The system provides 5 random default product images from Unsplash when no image is uploaded:
1. General product placeholder
2. Electronics/gadget theme
3. Fashion/clothing theme
4. Home/lifestyle theme
5. Sports/outdoor theme

## Implementation Notes

- Images are currently stored as URLs in the database (List<String> imageUrls)
- For production, consider implementing a file upload service
- Consider using a CDN for better performance
- Implement image optimization and resizing
- Add image validation on both frontend and backend

## File Upload Implementation (Future)

To implement actual file uploads:
1. Add Spring Boot file upload controller
2. Configure multipart settings
3. Implement image validation and resizing
4. Store files in `/uploads` directory or cloud storage
5. Update frontend to handle file uploads instead of URLs

## Current URL-based System

Users can add image URLs directly. The system supports:
- External URLs (https://example.com/image.jpg)
- Relative paths (/images/products/product1.jpg)
- Default fallback when image fails to load
