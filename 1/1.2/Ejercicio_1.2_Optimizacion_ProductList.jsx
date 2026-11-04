
import { useState, useEffect } from 'react';

function ProductList({ api, onProductClick }) {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {

    const controller = new AbortController();
    let active = true;

    // Esperar antes de realizar la solicitud (debounce)
    const timeout = setTimeout(async () => {

      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          '/products',
          {
            params: { search },
            signal: controller.signal
          }
        );

        // Solo actualizar si la solicitud sigue vigente
        if (active) {
          setProducts(response.data);
        }

      } catch (err) {

        // Ignorar errores de solicitudes canceladas
        if (err.name !== 'CanceledError' &&
            err.name !== 'AbortError' &&
            active) {
          setError('No fue posible cargar los productos.');
        }

      } finally {

        if (active) {
          setLoading(false);
        }

      }

    }, 400);

    // Limpiar temporizador y cancelar solicitud anterior
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };

  }, [search, api]);

  return (
    <div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar productos..."
      />

      {loading && <p>Cargando productos...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No se encontraron productos.</p>
      )}

      {products.map((p) => (
        <Product
          key={p.id}
          data={p}
          onClick={() => onProductClick?.(p)}
        />
      ))}

    </div>
  );
}

export default ProductList;
