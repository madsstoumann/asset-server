import express from 'express';
import { 
  getAsset, 
  uploadAsset, 
  getAssetList, 
  updateAssetTags,
  deleteAsset,
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
  upload.array('assets', 10), // Allow up to 10 files with field name 'assets'
  validateTags,
  uploadAsset
);
router.get('/asset-list/:id', validateAssetRequest('list'), getAssetList);
router.put('/asset/:id/tags', 
  validateAssetRequest('tags'),
  validateTags,
  updateAssetTags
);
router.delete('/asset/:id', deleteAsset);

// Configuration endpoint (only keep this one)
router.get('/config/client', getSystemConfig);

export default router;