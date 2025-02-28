import express from 'express';
import { 
  getAsset, 
  uploadAsset, 
  getAssetList, 
  updateAssetTags 
} from '../controllers/assetController.js';
import { upload } from '../middleware/fileUpload.js';
import { validateAssetRequest } from '../middleware/validation.js';
import { validateTags } from '../middleware/validateTags.js';

const router = express.Router();

// GET asset by ID with optional dimensions and DPI
router.get('/asset/:id', validateAssetRequest('get'), getAsset);

// POST upload a new asset
router.post('/asset/:id', 
  validateAssetRequest('post'), 
  validateTags,
  upload.single('asset'), 
  uploadAsset
);

// GET list of assets in a folder
router.get('/asset-list/:id', validateAssetRequest('list'), getAssetList);

// PUT update asset tags
router.put('/asset/:id/tags', 
  validateAssetRequest('tags'),
  validateTags,
  updateAssetTags
);

export default router;