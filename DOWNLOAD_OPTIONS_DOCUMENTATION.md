# Download Options Documentation

This document describes all the available download options in the system, providing alternatives to presigned URLs.

## Overview

The system now provides multiple download methods to accommodate different use cases and requirements:

1. **Presigned URLs** (existing) - Direct download from MinIO
2. **Direct Stream Download** (existing) - Server-proxied download
3. **Enhanced Direct Download** (new) - Server-proxied with chunked support
4. **Metadata Download** (new) - Get file information and optional presigned URL
5. **Base64 Download** (new) - Download as base64 encoded string

## Download Endpoints

### 1. Presigned URL Download (Existing)
**Endpoint:** `GET /documentos/:documentoId/download`

**Description:** Returns a presigned URL that allows direct download from MinIO storage.

**Advantages:**
- Direct download from storage (no server bandwidth usage)
- Fast for large files
- Works well with CDNs

**Disadvantages:**
- URL expiration
- Requires client to handle the download
- Less control over the download process

**Example Response:**
```json
{
  "success": true,
  "message": "Download URL generated successfully",
  "url": "https://minio.example.com/bucket/file.pdf?X-Amz-Algorithm=..."
}
```

### 2. Direct Stream Download (Existing)
**Endpoint:** `GET /file/download?path=<file_path>`

**Description:** Streams the file directly through the server.

**Advantages:**
- Full server control
- No URL expiration
- Can add authentication/authorization
- Consistent with other API responses

**Disadvantages:**
- Uses server bandwidth
- Slower for large files
- Server load increases with downloads

**Example Usage:**
```
GET /file/download?path=proyectos/project_123/document.pdf
```

### 3. Enhanced Direct Download (New)
**Endpoint:** `GET /documentos/:documentoId/download-direct`

**Description:** Enhanced direct download with support for chunked downloads and custom filenames.

**Features:**
- Chunked download support (Range requests)
- Custom filename support
- Better error handling
- File size validation
- Content-Type detection
- Document validation (checks if document exists and is not deleted)

**Parameters:**
- `documentoId` (required): Document UUID
- `chunked` (optional): Enable chunked downloads (default: false)
- `filename` (optional): Custom filename for download

**Advantages:**
- Resume download support
- Better for large files
- More control over download process
- Enhanced error handling
- Document-level validation

**Example Usage:**
```
GET /documentos/123e4567-e89b-12d3-a456-426614174000/download-direct?chunked=true&filename=my-document.pdf
```

**Range Request Support:**
```
GET /documentos/123e4567-e89b-12d3-a456-426614174000/download-direct?chunked=true
Range: bytes=0-1048575
```

### 4. Metadata Download (New)
**Endpoint:** `GET /documentos/:documentoId/download-with-info`

**Description:** Get document metadata and optionally generate a presigned URL.

**Features:**
- Document metadata retrieval
- Optional presigned URL generation
- Document information without downloading content
- Document validation (checks if document exists and is not deleted)

**Parameters:**
- `documentoId` (required): Document UUID
- `includeMetadata` (optional): Return metadata only (default: true)

**Example Response:**
```json
{
  "success": true,
  "message": "File metadata retrieved successfully",
  "metadata": {
    "name": "document.pdf",
    "size": 1048576,
    "type": "application/pdf",
    "path": "proyectos/project_123/document.pdf",
    "lastModified": "2024-01-15T10:30:00Z",
    "etag": "abc123def456",
    "versionId": "1"
  }
}
```

**With Download URL:**
```json
{
  "success": true,
  "message": "File information and download URL generated",
  "metadata": { ... },
  "downloadUrl": "https://minio.example.com/bucket/file.pdf?X-Amz-Algorithm=..."
}
```

### 5. Base64 Download (New)
**Endpoint:** `GET /documentos/:documentoId/download-base64`

**Description:** Download document as base64 encoded string.

**Features:**
- Base64 encoding for JSON responses
- File size limit protection
- Useful for small files or embedding in applications
- Document validation (checks if document exists and is not deleted)

**Parameters:**
- `documentoId` (required): Document UUID
- `maxSize` (optional): Maximum file size in bytes (default: 10MB)

**Advantages:**
- Can be embedded in JSON responses
- No separate download request needed
- Good for small files (images, documents)
- Works well with frontend applications

**Disadvantages:**
- Increased response size (~33% larger)
- Not suitable for large files
- Memory usage for file processing

**Example Response:**
```json
{
  "success": true,
  "message": "File downloaded successfully as base64",
  "data": {
    "filename": "image.png",
    "size": 1024,
    "type": "image/png",
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "path": "proyectos/project_123/image.png"
  }
}
```

## Use Case Recommendations

### Small Files (< 1MB)
- **Base64 Download**: For embedding in JSON responses
- **Direct Stream**: For simple downloads
- **Metadata + Presigned URL**: For flexible handling

### Medium Files (1MB - 10MB)
- **Enhanced Direct Download**: With chunked support
- **Presigned URL**: For direct downloads
- **Direct Stream**: For server-controlled downloads

### Large Files (> 10MB)
- **Enhanced Direct Download**: With chunked support for resume capability
- **Presigned URL**: For direct downloads
- **Metadata Download**: For getting file information first

### Web Applications
- **Base64**: For small images/icons
- **Presigned URL**: For user-initiated downloads
- **Enhanced Direct Download**: For controlled downloads

### Mobile Applications
- **Enhanced Direct Download**: With chunked support for resume
- **Presigned URL**: For direct downloads
- **Metadata Download**: For file information

## Error Handling

All endpoints provide consistent error responses:

```json
{
  "error": "Error message"
}
```

Common error codes:
- `400`: Bad request (invalid parameters)
- `404`: File not found
- `413`: File too large (base64 endpoint)
- `416`: Range not satisfiable (chunked downloads)
- `500`: Server error

## Security Considerations

1. **Authentication**: All endpoints should be protected with proper authentication
2. **Authorization**: Verify user has permission to access the file
3. **Path Validation**: Ensure file paths are properly validated
4. **Size Limits**: Implement appropriate size limits for each endpoint
5. **Rate Limiting**: Consider rate limiting for download endpoints
6. **Document Validation**: New endpoints validate document existence and deletion status

## Performance Considerations

1. **Caching**: Consider caching for frequently accessed files
2. **CDN**: Use CDN for presigned URL downloads
3. **Compression**: Enable compression for text-based files
4. **Monitoring**: Monitor bandwidth usage and server load
5. **Scaling**: Consider horizontal scaling for high download volumes

## Implementation Notes

- All endpoints use the same MinIO client configuration
- Error handling is consistent across all endpoints
- File paths are validated and sanitized
- Content-Type headers are set appropriately
- File size limits are enforced where applicable
- Document-level validation is performed for new endpoints
- All new endpoints are integrated with the documentos routes for better organization 