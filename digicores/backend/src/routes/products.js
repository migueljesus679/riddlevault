import { Router } from 'express';
import { getDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function parseProduct(p) {
  if (!p) return null;
  return { ...p, pricing_config: JSON.parse(p.pricing_config), active: Boolean(p.active) };
}

function calcMinPrice(product) {
  const cfg = typeof product.pricing_config === 'string'
    ? JSON.parse(product.pricing_config)
    : product.pricing_config;
  if (product.product_type === 'quantity_based') {
    return Math.min(...cfg.tiers.map(t => t.price));
  }
  if (product.product_type === 'unit_based') {
    return Math.min(...cfg.options.map(o => o.price));
  }
  if (product.product_type === 'size_based') {
    return cfg.price_per_unit * cfg.min_units;
  }
  return 0;
}

router.get('/', (req, res) => {
  const { category, search, active } = req.query;
  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (active !== 'all') {
    query += ' AND p.active = 1';
  }
  if (category) {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY p.created_at DESC';

  const products = getDb().prepare(query).all(...params).map(parseProduct);
  const withMin = products.map(p => ({ ...p, min_price: calcMinPrice(p) }));
  res.json(withMin);
});

router.get('/:id', (req, res) => {
  const product = getDb().prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  const parsed = parseProduct(product);
  res.json({ ...parsed, min_price: calcMinPrice(parsed) });
});

router.post('/:id/calculate-price', (req, res) => {
  const product = getDb().prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

  const cfg = JSON.parse(product.pricing_config);
  const { quantity, width, height, option } = req.body;
  let price = null;
  let details = '';

  if (product.product_type === 'quantity_based') {
    const tier = cfg.tiers.find(t => t.quantity === Number(quantity));
    if (!tier) return res.status(400).json({ error: 'Quantidade inválida' });
    price = tier.price;
    details = `${quantity} unidades`;
  } else if (product.product_type === 'size_based') {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return res.status(400).json({ error: 'Dimensões inválidas' });
    const area = w * h;
    if (area < cfg.min_units) return res.status(400).json({ error: `Área mínima: ${cfg.min_units} ${cfg.unit}` });
    price = parseFloat((area * cfg.price_per_unit).toFixed(2));
    details = `${w}m × ${h}m = ${area.toFixed(2)} m²`;
  } else if (product.product_type === 'unit_based') {
    const opt = cfg.options.find(o => o.label === option);
    if (!opt) return res.status(400).json({ error: 'Opção inválida' });
    price = opt.price;
    details = opt.label;
  }

  res.json({ price, details, product_name: product.name });
});

router.post('/', requireAdmin, (req, res) => {
  const { name, description, category_id, product_type, pricing_config, image_url, active } = req.body;
  if (!name || !product_type || !pricing_config) {
    return res.status(400).json({ error: 'Nome, tipo e configuração de preço são obrigatórios' });
  }

  const slug = name.toLowerCase()
    .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
    .replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const cfgStr = typeof pricing_config === 'string' ? pricing_config : JSON.stringify(pricing_config);

  try {
    const result = getDb().prepare(`
      INSERT INTO products (name, slug, description, category_id, product_type, pricing_config, image_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, description || '', category_id || null, product_type, cfgStr, image_url || '', active !== false ? 1 : 0);

    const created = getDb().prepare('SELECT * FROM products WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(parseProduct(created));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Produto com esse nome já existe' });
    throw err;
  }
});

router.put('/:id', requireAdmin, (req, res) => {
  const { name, description, category_id, product_type, pricing_config, image_url, active } = req.body;
  const existing = getDb().prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produto não encontrado' });

  const slug = name
    ? name.toLowerCase()
        .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : existing.slug;

  const cfgStr = pricing_config
    ? (typeof pricing_config === 'string' ? pricing_config : JSON.stringify(pricing_config))
    : existing.pricing_config;

  getDb().prepare(`
    UPDATE products SET
      name = ?, slug = ?, description = ?, category_id = ?, product_type = ?,
      pricing_config = ?, image_url = ?, active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name ?? existing.name,
    slug,
    description ?? existing.description,
    category_id ?? existing.category_id,
    product_type ?? existing.product_type,
    cfgStr,
    image_url ?? existing.image_url,
    active !== undefined ? (active ? 1 : 0) : existing.active,
    req.params.id
  );

  const updated = getDb().prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(parseProduct(updated));
});

router.delete('/:id', requireAdmin, (req, res) => {
  const existing = getDb().prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produto não encontrado' });
  getDb().prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
