export interface Product {
  code: string;
  product_name: string;
  product_name_fr?: string;
  brands?: string;
  image_url?: string;
  image_small_url?: string;
  nutriments?: {
    proteins_100g?: number;
    energy_kcal_100g?: number;
    fat_100g?: number;
    carbohydrates_100g?: number;
  };
  nutriscore_grade?: string;
  categories?: string;
  categories_tags?: string[];
  quantity?: string;
  packaging?: string;
  [key: string]: any;
}

export interface SearchResponse {
  products: Product[];
  count: number;
  page: number;
  page_size: number;
  page_count: number;
}

const API_BASE = 'https://world.openfoodfacts.org';

export async function searchWheyProteins(page: number = 1, pageSize: number = 100): Promise<SearchResponse> {
  // Recherche de whey protéines et protéines en poudre
  // Utilisation de plusieurs stratégies de recherche
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

  // Recherche dans les catégories de suppléments et produits riches en protéines
  const searchUrl = `${API_BASE}/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=supplements&page_size=${pageSize}&page=${page}&json=true&fields=code,product_name,product_name_fr,brands,image_url,image_small_url,nutriments,nutriscore_grade,categories,categories_tags,quantity,packaging`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    // Filtrer pour ne garder que les produits contenant des mots-clés liés aux protéines
    const filteredProducts = (data.products || []).filter((product: Product) => {
      const name = (product.product_name || '').toLowerCase();
      const nameFr = (product.product_name_fr || '').toLowerCase();
      const categories = (product.categories || '').toLowerCase();
      const tags = (product.categories_tags || []).join(' ').toLowerCase();
      const proteinContent = product.nutriments?.proteins_100g || 0;
      
      // Produits avec au moins 40g de protéines pour 100g OU contenant des mots-clés spécifiques
      const hasHighProtein = proteinContent >= 40;
      const hasKeywords = searchTerms.some(term => 
        name.includes(term) || 
        nameFr.includes(term) || 
        categories.includes(term) ||
        tags.includes(term)
      );
      
      return hasHighProtein || hasKeywords;
    });

    return {
      products: filteredProducts,
      count: filteredProducts.length,
      page: data.page || page,
      page_size: data.page_size || pageSize,
      page_count: Math.ceil(filteredProducts.length / pageSize)
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      count: 0,
      page,
      page_size: pageSize,
      page_count: 0
    };
  }
}

export async function getAllWheyProteins(): Promise<Product[]> {
  const allProducts: Product[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 20) { // Limite à 20 pages pour éviter les timeouts
    const response = await searchWheyProteins(page, 100);
    allProducts.push(...response.products);
    
    hasMore = response.products.length > 0;
    page++;
    
    // Petite pause pour ne pas surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return allProducts;
}

