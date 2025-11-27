const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_BASE = 'https://world.openfoodfacts.org';

const searchTerms = [
  'whey',
  'protéine en poudre',
  'protein powder',
  'isolate',
  'concentrate',
  'caséine',
  'casein',
  'protéine',
  'protein'
];

async function searchWheyProteins(page = 1, pageSize = 100) {
  const searchUrl = `${API_BASE}/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=supplements&page_size=${pageSize}&page=${page}&json=true&fields=code,product_name,product_name_fr,brands,image_url,image_small_url,nutriments,nutriscore_grade,categories,categories_tags,quantity,packaging`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    const filteredProducts = (data.products || []).filter((product) => {
      const name = (product.product_name || '').toLowerCase();
      const nameFr = (product.product_name_fr || '').toLowerCase();
      const categories = (product.categories || '').toLowerCase();
      const tags = (product.categories_tags || []).join(' ').toLowerCase();
      const proteinContent = product.nutriments?.proteins_100g || 0;
      
      const hasHighProtein = proteinContent >= 40;
      const hasKeywords = searchTerms.some(term => 
        name.includes(term) || 
        nameFr.includes(term) || 
        categories.includes(term) ||
        tags.includes(term)
      );
      
      return hasHighProtein || hasKeywords;
    });

    return filteredProducts;
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error);
    return [];
  }
}

async function getAllWheyProteins() {
  const allProducts = [];
  let page = 1;
  let hasMore = true;
  const maxPages = 20;

  console.log('🔄 Récupération des données depuis Open Food Facts...\n');

  while (hasMore && page <= maxPages) {
    console.log(`📄 Page ${page}/${maxPages}...`);
    const products = await searchWheyProteins(page, 100);
    
    if (products.length > 0) {
      allProducts.push(...products);
      console.log(`   ✓ ${products.length} produits trouvés (Total: ${allProducts.length})`);
      page++;
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      hasMore = false;
    }
  }

  return allProducts;
}

async function fetchAndSave() {
  try {
    const products = await getAllWheyProteins();
    
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, 'products.json');
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
    
    console.log(`\n✅ ${products.length} produits sauvegardés dans data/products.json`);
    console.log(`📊 Taille du fichier: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
    process.exit(1);
  }
}

fetchAndSave();

