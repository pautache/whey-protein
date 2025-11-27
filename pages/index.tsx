import { useState, useEffect, useMemo } from 'react';
import { Product } from '../lib/openfoodfacts';
import Head from 'next/head';

interface HomeProps {
  products: Product[];
}

export default function Home({ products }: HomeProps) {
  const [filters, setFilters] = useState({
    search: '',
    minProtein: 0,
    maxProtein: 100,
    brand: '',
    nutriscore: '',
  });

  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const uniqueBrands = Array.from(
      new Set(
        products
          .map(p => p.brands)
          .filter(Boolean)
          .map(b => b?.split(',')[0].trim())
          .filter(Boolean)
      )
    ).sort() as string[];
    setBrands(uniqueBrands);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const name = (product.product_name || product.product_name_fr || '').toLowerCase();
      const searchMatch = !filters.search || name.includes(filters.search.toLowerCase());
      
      const protein = product.nutriments?.proteins_100g || 0;
      const proteinMatch = protein >= filters.minProtein && protein <= filters.maxProtein;
      
      const brandMatch = !filters.brand || 
        (product.brands && product.brands.toLowerCase().includes(filters.brand.toLowerCase()));
      
      const nutriscoreMatch = !filters.nutriscore || 
        product.nutriscore_grade?.toLowerCase() === filters.nutriscore.toLowerCase();

      return searchMatch && proteinMatch && brandMatch && nutriscoreMatch;
    });
  }, [products, filters]);

  return (
    <>
      <Head>
        <title>Whey Protein.fr - Toutes les protéines en poudre</title>
        <meta name="description" content="Liste complète de toutes les whey protéines et protéines en poudre disponibles sur Open Food Facts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        {/* Sidebar Filtres */}
        <aside style={{
          width: '280px',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRight: '1px solid #ddd',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: 'bold' }}>Filtres</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Recherche
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Nom du produit..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Protéines (g/100g)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                value={filters.minProtein}
                onChange={(e) => setFilters({ ...filters, minProtein: Number(e.target.value) })}
                min="0"
                max="100"
                style={{
                  width: '80px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <span>à</span>
              <input
                type="number"
                value={filters.maxProtein}
                onChange={(e) => setFilters({ ...filters, maxProtein: Number(e.target.value) })}
                min="0"
                max="100"
                style={{
                  width: '80px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Marque
            </label>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Toutes</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Nutri-Score
            </label>
            <select
              value={filters.nutriscore}
              onChange={(e) => setFilters({ ...filters, nutriscore: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Tous</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
              <option value="e">E</option>
            </select>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#e8f4f8',
            borderRadius: '4px',
            fontSize: '14px',
            marginTop: '20px'
          }}>
            <strong>{filteredProducts.length}</strong> produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </div>
        </aside>

        {/* Contenu principal */}
        <main style={{ flex: 1, padding: '20px' }}>
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
              Whey Protein.fr
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Toutes les whey protéines et protéines en poudre référencées sur Open Food Facts
            </p>
          </header>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {filteredProducts.map(product => {
              const protein = product.nutriments?.proteins_100g || 0;
              const imageUrl = product.image_url || product.image_small_url || '/placeholder.svg';
              
              return (
                <div
                  key={product.code}
                  data-code={product.code}
                  data-name={product.product_name || product.product_name_fr}
                  data-brand={product.brands}
                  data-protein={protein}
                  data-nutriscore={product.nutriscore_grade}
                  data-categories={product.categories}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {imageUrl !== '/placeholder.svg' ? (
                      <img
                        src={imageUrl}
                        alt={product.product_name || product.product_name_fr}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <span style={{ color: '#999' }}>Pas d'image</span>
                    )}
                  </div>
                  
                  <div style={{ padding: '15px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4',
                      minHeight: '44px'
                    }}>
                      {product.product_name_fr || product.product_name}
                    </h3>
                    
                    {product.brands && (
                      <p style={{
                        fontSize: '12px',
                        color: '#666',
                        margin: '0 0 8px 0'
                      }}>
                        {product.brands.split(',')[0]}
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px'
                    }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Protéines:</span>
                        <strong style={{ fontSize: '18px', marginLeft: '8px', color: '#2563eb' }}>
                          {protein.toFixed(1)}g
                        </strong>
                      </div>
                      
                      {product.nutriscore_grade && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          backgroundColor: product.nutriscore_grade === 'a' ? '#00b04f' :
                                          product.nutriscore_grade === 'b' ? '#85bb2f' :
                                          product.nutriscore_grade === 'c' ? '#fecb02' :
                                          product.nutriscore_grade === 'd' ? '#ee8100' : '#e63e11',
                          color: '#fff'
                        }}>
                          {product.nutriscore_grade.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <p style={{ fontSize: '18px' }}>Aucun produit trouvé avec ces filtres.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { getAllWheyProteins } = await import('../lib/openfoodfacts');
  
  try {
    const products = await getAllWheyProteins();
    
    return {
      props: {
        products: products.slice(0, 500) // Limiter à 500 produits pour le build
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: []
      }
    };
  }
}

