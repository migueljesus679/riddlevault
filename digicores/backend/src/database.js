import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../digicores.db');

let db;

export function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
}

export function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id),
      product_type TEXT NOT NULL,
      pricing_config TEXT NOT NULL,
      image_url TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedIfEmpty(db);
}

function seedIfEmpty(db) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`).run(
    'Administrador', 'admin@digicores.pt', adminHash, 'admin'
  );
  db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`).run(
    'Utilizador Demo', 'user@digicores.pt', userHash, 'user'
  );

  const categories = [
    { name: 'Pequeno Formato', slug: 'pequeno-formato', description: 'Cartoes, flyers, brochuras e envelopes', icon: '📄' },
    { name: 'Autocolantes', slug: 'autocolantes', description: 'Autocolantes vinil, magneticos e etiquetas', icon: '🏷️' },
    { name: 'Brindes', slug: 'brindes', description: 'Canetas, porta-chaves e artigos promocionais', icon: '🎁' },
    { name: 'Expositores', slug: 'expositores', description: 'Roll ups, expositores e displays', icon: '🖼️' },
    { name: 'Lonas', slug: 'lonas', description: 'Lonas impressas para exterior e interior', icon: '🏗️' },
    { name: 'Placas', slug: 'placas', description: 'Placas sinalizacao e imobiliaria', icon: '🪧' },
    { name: 'Texteis', slug: 'texteis', description: 'T-shirts, casacos e vestuario personalizado', icon: '👕' },
    { name: 'Imobiliaria', slug: 'imobiliaria', description: 'Placas, cavaletes e materiais imobiliarios', icon: '🏠' },
  ];

  const insertCat = db.prepare(`INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`);
  for (const c of categories) insertCat.run(c.name, c.slug, c.description, c.icon);

  const getCatId = (slug) => db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug).id;

  const products = [
    {
      name: 'Cartoes de Visita',
      slug: 'cartoes-de-visita',
      description: 'Cartoes de visita em papel couche 350g com impressao digital de alta qualidade. Acabamento brilhante ou matte disponivel.',
      category_id: getCatId('pequeno-formato'),
      product_type: 'quantity_based',
      pricing_config: JSON.stringify({ tiers: [{ quantity: 100, price: 12 }, { quantity: 250, price: 18 }, { quantity: 500, price: 28 }, { quantity: 1000, price: 42 }] }),
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80',
    },
    {
      name: 'Flyers A5',
      slug: 'flyers-a5',
      description: 'Flyers A5 em papel couche 130g, ideal para promocoes, eventos e campanhas publicitarias.',
      category_id: getCatId('pequeno-formato'),
      product_type: 'quantity_based',
      pricing_config: JSON.stringify({ tiers: [{ quantity: 250, price: 23 }, { quantity: 500, price: 38 }, { quantity: 1000, price: 62 }, { quantity: 2500, price: 115 }] }),
      image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    },
    {
      name: 'Brochura Diptico A4',
      slug: 'brochura-diptico-a4',
      description: 'Brochura diptico em formato A4 aberta, papel couche 170g, dobra ao meio. Impressao frente e verso.',
      category_id: getCatId('pequeno-formato'),
      product_type: 'quantity_based',
      pricing_config: JSON.stringify({ tiers: [{ quantity: 50, price: 45 }, { quantity: 100, price: 72 }, { quantity: 250, price: 145 }, { quantity: 500, price: 245 }] }),
      image_url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=400&q=80',
    },
    {
      name: 'Autocolante Vinil',
      slug: 'autocolante-vinil',
      description: 'Autocolantes em vinil de alta durabilidade, resistentes a agua e UV. Ideais para interior e exterior.',
      category_id: getCatId('autocolantes'),
      product_type: 'size_based',
      pricing_config: JSON.stringify({ unit: 'm2', price_per_unit: 18, min_units: 0.25 }),
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    },
    {
      name: 'Magnetico Veicular',
      slug: 'magnetico-veicular',
      description: 'Magneticos para veiculos com impressao a cores full HD. Facil aplicacao e remocao sem danos.',
      category_id: getCatId('autocolantes'),
      product_type: 'unit_based',
      pricing_config: JSON.stringify({ options: [{ label: '30x20 cm', price: 18 }, { label: '40x30 cm', price: 28 }, { label: '60x40 cm', price: 45 }] }),
      image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80',
    },
    {
      name: 'Canetas Personalizadas',
      slug: 'canetas-personalizadas',
      description: 'Canetas esferograficas personalizadas com logotipo ou mensagem. Modelo classico em varias cores.',
      category_id: getCatId('brindes'),
      product_type: 'quantity_based',
      pricing_config: JSON.stringify({ tiers: [{ quantity: 100, price: 85 }, { quantity: 250, price: 185 }, { quantity: 500, price: 320 }, { quantity: 1000, price: 580 }] }),
      image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80',
    },
    {
      name: 'Porta-Chaves Metal',
      slug: 'porta-chaves-metal',
      description: 'Porta-chaves em metal cromado com gravacao a laser do logotipo. Embalagem individual disponivel.',
      category_id: getCatId('brindes'),
      product_type: 'quantity_based',
      pricing_config: JSON.stringify({ tiers: [{ quantity: 50, price: 62 }, { quantity: 100, price: 105 }, { quantity: 250, price: 225 }, { quantity: 500, price: 400 }] }),
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    },
    {
      name: 'Roll Up 85x200 cm',
      slug: 'roll-up-85x200',
      description: 'Expositor roll up 85x200 cm com impressao em lona 510g. Estrutura em aluminio leve e resistente.',
      category_id: getCatId('expositores'),
      product_type: 'unit_based',
      pricing_config: JSON.stringify({ options: [{ label: 'Standard', price: 75 }, { label: 'Premium c/ bolsa', price: 95 }, { label: 'Duplo 170x200 cm', price: 145 }] }),
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
    },
    {
      name: 'Expositor Acrilico A4',
      slug: 'expositor-acrilico-a4',
      description: 'Expositor de balcao em acrilico transparente 3mm para folhas A4. Elegante e discreto.',
      category_id: getCatId('expositores'),
      product_type: 'unit_based',
      pricing_config: JSON.stringify({ options: [{ label: 'Simples (1 bolso)', price: 32 }, { label: 'Duplo (2 bolsos)', price: 52 }, { label: 'Triplo (3 bolsos)', price: 68 }] }),
      image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80',
    },
    {
      name: 'Lona Impressa',
      slug: 'lona-impressa',
      description: 'Lona impressa em PVC 510g com ilhos de reforco. Ideal para publicidade exterior de grande formato.',
      category_id: getCatId('lonas'),
      product_type: 'size_based',
      pricing_config: JSON.stringify({ unit: 'm2', price_per_unit: 8, min_units: 2 }),
      image_url: 'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=400&q=80',
    },
    {
      name: 'Placa Imobiliaria',
      slug: 'placa-imobiliaria',
      description: 'Placas imobiliarias em PVC rigido 5mm com impressao UV de alta definicao. Resistentes as intemperies.',
      category_id: getCatId('placas'),
      product_type: 'unit_based',
      pricing_config: JSON.stringify({ options: [{ label: '1 face 40x60 cm', price: 18 }, { label: '2 faces 40x60 cm', price: 28 }, { label: '1 face 50x70 cm', price: 24 }, { label: '2 faces 50x70 cm', price: 38 }] }),
      image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
    },
    {
      name: 'Placa Sinetica',
      slug: 'placa-sinetica',
      description: 'Placas sinalizacao em aluminio composto ou PVC. Informacao clara e duravel para ambientes profissionais.',
      category_id: getCatId('placas'),
      product_type: 'unit_based',
      pricing_config: JSON.stringify({ options: [{ label: 'A4 (21x29,7 cm)', price: 25 }, { label: 'A3 (29,7x42 cm)', price: 38 }, { label: 'A2 (42x59,4 cm)', price: 58 }] }),
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80',
    },
    {
      name: 'T-Shirt Personalizada',
      slug: 't-shirt-personalizada',
      description: 'T-shirts 100% algodao 190g personalizadas com serigrafia ou sublimacao. Disponivel em diversas cores e tamanhos.',
      category_id: getCatId('texteis'),
      product_type: 'quantity_based',
      pricing_config: JSON.stringify({ tiers: [{ quantity: 10, price: 95 }, { quantity: 25, price: 210 }, { quantity: 50, price: 380 }, { quantity: 100, price: 680 }] }),
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    },
    {
      name: 'Cavalete Imobiliario',
      slug: 'cavalete-imobiliario',
      description: 'Cavalete imobiliario em aluminio para exterior com porta folha A4. Estavel e resistente ao vento.',
      category_id: getCatId('imobiliaria'),
      product_type: 'unit_based',
      pricing_config: JSON.stringify({ options: [{ label: 'Standard simples', price: 45 }, { label: 'Premium duplo', price: 68 }, { label: 'Deluxe com LED', price: 125 }] }),
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
    },
    {
      name: 'Placa Para-Vendeu',
      slug: 'placa-para-vendeu',
      description: 'Placas imobiliarias "Para Venda", "Vendido", "Para Arrendar" em PVC rigido com furos de fixacao.',
      category_id: getCatId('imobiliaria'),
      product_type: 'quantity_based',
      pricing_config: JSON.stringify({ tiers: [{ quantity: 5, price: 35 }, { quantity: 10, price: 58 }, { quantity: 25, price: 125 }, { quantity: 50, price: 220 }] }),
      image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
    },
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (name, slug, description, category_id, product_type, pricing_config, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of products) {
    insertProd.run(p.name, p.slug, p.description, p.category_id, p.product_type, p.pricing_config, p.image_url);
  }

  console.log('[DB] Seed completed: 2 users, 8 categories, 15 products');
}
