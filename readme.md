# Asset Server

A robust and efficient server for managing digital assets with automatic image processing, WebP conversion, and tag management.

## Features

- **Organized Storage Structure**: Assets are stored in a hierarchical directory structure based on SKU/ID
- **Image Processing**: On-the-fly image resizing and WebP conversion
- **WebP Conversion**: Automatic conversion to WebP format for better performance
- **Compression**: Brotli compression for supported clients
- **Caching**: Efficient caching system for resized images
- **Tagging System**: Attach metadata tags to assets
- **API-Driven**: RESTful API for all operations
- **Validation**: Input validation for all endpoints

## Technologies

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Multer**: File upload handling
- **Sharp**: Image processing and WebP conversion
- **PM2**: Process management and auto-restart
- **express-validator**: Input validation

## Installation

### Prerequisites

- Node.js 16+ (LTS recommended)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/madsstoumann/asset-server.git
   cd asset-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your configuration settings

## Configuration

Configure your server through the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (`development` or `production`) | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:5500` |
| `ALLOWED_WIDTHS` | Permitted image resize widths | `75,200,400,800,1200,1600` |
| `ALLOWED_TAGS` | Valid tags for assets | `front,back,inside,spine` |
| `ALLOWED_TYPES` | Permitted file types | `image/jpeg,image/png,image/gif,application/pdf` |
| `MAX_FILE_SIZE` | Maximum upload file size (MB) | `10` |
| `ENABLE_COMPRESSION` | Enable Brotli compression | `true` |
| `COMPRESSION_LEVEL` | Compression level (0-11) | `11` |

## API Endpoints

### Asset Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/asset/:id` | Get asset by ID |
| `POST` | `/api/asset/:id` | Upload new asset(s) |
| `GET` | `/api/asset-list/:id` | List assets by folder ID |
| `PUT` | `/api/asset/:id/tags` | Update asset tags |
| `DELETE` | `/api/asset/:id` | Delete asset |

### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/config/client` | Get client configuration |

## Query Parameters

#### Asset Retrieval
- `w` or `width`: Resize image to specified width
- `h` or `height`: Resize image to specified height
- `dpi`: Set image DPI

#### Asset Deletion
- `filename`: Specify file to delete

## Usage Examples

### Upload an Asset
```bash
curl -X POST http://localhost:3000/api/asset/12345 -F "assets=@/path/to/your/file.jpg"
```

### Get an Asset
```bash
curl http://localhost:3000/api/asset/12345?w=200
```

### List Assets in a Folder
```bash
curl http://localhost:3000/api/asset-list/12345
```

### Update Asset Tags
```bash
curl -X PUT http://localhost:3000/api/asset/12345/tags -d '{"tags":["front","back"]}' -H "Content-Type: application/json"
```

### Delete an Asset
```bash
curl -X DELETE http://localhost:3000/api/asset/12345?filename=file.jpg
```

## Additional Features

### Image Processing
- **Resize**: Resize images on-the-fly to specified dimensions.
- **WebP Conversion**: Convert images to WebP format for better performance.
- **DPI Setting**: Set DPI for images.

### Compression
- **Brotli Compression**: Enable Brotli compression for supported clients to reduce file size.

### Caching
- **Efficient Caching**: Cache resized images to improve performance on subsequent requests.

### Tagging System
- **Metadata Tags**: Attach metadata tags to assets for better organization and retrieval.

### Validation
- **Input Validation**: Validate input for all endpoints to ensure data integrity.

## License

This project is licensed under the ISC License.
