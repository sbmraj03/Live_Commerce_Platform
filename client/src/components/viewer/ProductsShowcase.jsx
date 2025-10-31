// Lists products for viewers and highlights the featured one
import { useEffect, useState } from 'react';
import socketService from '../../services/socket';

const ProductsShowcase = ({ products, highlightedProductId }) => {
    const [highlightedId, setHighlightedId] = useState(highlightedProductId || null);

    useEffect(() => {
      const socket = socketService.getSocket();
      if (socket) {
        const onHighlighted = ({ productId }) => setHighlightedId(productId || null);
        socket.on('product:highlighted', onHighlighted);
        return () => socket.off('product:highlighted', onHighlighted);
      }
    }, []);

    // Keep local state in sync with server-provided value to avoid auto-reset on re-mounts
    useEffect(() => {
      setHighlightedId(highlightedProductId || null);
    }, [highlightedProductId]);

    if (!products || products.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-600">No products in this session</p>
        </div>
      );
    }
  
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-linear-to-r from-purple-600 to-blue-600 p-4">
          <h3 className="text-white font-bold text-lg">
            Featured Products ({products.length})
          </h3>
        </div>
  
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {products.map((product) => (
            <div key={product._id} className={`p-4 transition-colors ${highlightedId === product._id ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'hover:bg-gray-50'}`}>
              <div className="flex gap-4">
                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100';
                  }}
                />
  
                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 line-clamp-1">
                      {product.name}
                    </h4>
                    {highlightedId === product._id && (
                      <span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded">Highlighted</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-purple-600">
                       ₹{product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm">
                      {product.stock > 0 ? (
                        <span className="text-green-600 font-semibold">
                          ✓ In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
  
                  <button className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default ProductsShowcase;