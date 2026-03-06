import { Router } from 'express';
import { getProducts, getFeaturedProducts, getBestsellers, getProductBySlug } from '../controllers/products';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestsellers);
router.get('/:slug', getProductBySlug);

export default router;
