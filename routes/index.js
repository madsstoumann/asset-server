import express from 'express';
import { 
  getAsset, 
  uploadAsset, 
  getAssetList, 
  updateAssetTags,
  deleteAsset,
  getSystemConfig
} from '../controllers/index.js';
import { upload } from '../middleware/upload.js';
import { validation } from '../middleware/validation.js';
import { tags } from '../middleware/tags.js';

const router = express.Router();

// Asset endpoints
router.get('/asset/:id', validation('get'), getAsset);
router.post('/asset/:id', 
  validation('post'),
  upload.array('assets', 10), // Allow up to 10 files with field name 'assets'
  tags,
  uploadAsset
);
router.get('/asset-list/:id', validation('list'), getAssetList);
router.put('/asset/:id/tags', 
  validation('tags'),
  tags,
  updateAssetTags
);
router.delete('/asset/:id', deleteAsset);

// Configuration endpoint (only keep this one)
router.get('/config/client', getSystemConfig);

export default router;