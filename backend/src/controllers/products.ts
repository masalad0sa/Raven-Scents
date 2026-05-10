import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { getOrSet, CACHE_TTL } from '../services/redis';
import { handleError } from '../middleware/errorHandler';

// GET /api/products
export async function getProducts(req: Request, res: Response) {
  try {
    const { search, gender, scent_family, max_price, is_new, is_bestseller, sort = 'featured', page = '1', limit = '100' } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;

    const data = await getOrSet(cacheKey, CACHE_TTL.PRODUCTS_LIST, async () => {
      let query = supabase
        .from('products')
        .select(`*, product_variants(*)`)
        .order('is_featured', { ascending: false });

      if (search) query = query.ilike('name', `%${search}%`);
      if (gender) query = query.eq('gender', gender);
      if (scent_family) query = query.eq('scent_family', scent_family);
      if (max_price) query = query.lte('price', Number(max_price));
      if (is_new === 'true') query = query.eq('is_new', true);
      if (is_bestseller === 'true') query = query.eq('is_bestseller', true);

      // Sorting
      switch (sort) {
        case 'price-asc': query = query.order('price', { ascending: true }); break;
        case 'price-desc': query = query.order('price', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        default: query = query.order('is_featured', { ascending: false });
      }

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const pageSize = Math.min(100, Number(limit));
      query = query.range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { products: data, total: count };
    });

    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
}

// GET /api/products/featured
export async function getFeaturedProducts(_req: Request, res: Response) {
  try {
    const data = await getOrSet('products:featured', CACHE_TTL.FEATURED, async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('is_featured', true)
        .limit(6);
      if (error) throw error;
      return data;
    });
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
}

// GET /api/products/bestsellers
export async function getBestsellers(_req: Request, res: Response) {
  try {
    const data = await getOrSet('products:bestsellers', CACHE_TTL.FEATURED, async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('is_bestseller', true)
        .limit(8);
      if (error) throw error;
      return data;
    });
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
}

// GET /api/products/:slug
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const cacheKey = `product:${slug}`;

    const data = await getOrSet(cacheKey, CACHE_TTL.PRODUCT_DETAIL, async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*), reviews(*)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    });

    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
}
