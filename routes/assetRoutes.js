import express from 'express';
import { 
  getAsset, 
  uploadAsset, 
  getAssetList, 
  updateAssetTags,
  getSystemConfig
} from '../controllers/assetController.js';
import { upload } from '../middleware/fileUpload.js';
import { validateAssetRequest } from '../middleware/validation.js';
import { validateTags } from '../middleware/validateTags.js';

const router = express.Router();

// Asset endpoints
router.get('/asset/:id', validateAssetRequest('get'), getAsset);
router.post('/asset/:id', 
  validateAssetRequest('post'),
  upload.single('asset'),
  validateTags,
  uploadAsset
);
router.get('/asset-list/:id', validateAssetRequest('list'), getAssetList);
router.put('/asset/:id/tags', 
  validateAssetRequest('tags'),
  validateTags,
  updateAssetTags
);

// Configuration endpoint (only keep this one)
router.get('/config/client', getSystemConfig);

export default router;