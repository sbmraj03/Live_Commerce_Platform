import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductCard from '../../components/admin/ProductCard';
import ProductFormModal from '../../components/admin/ProductFormModal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Add Product
  const handleAddProduct = async (formData) => {
    try {
      setIsSubmitting(true);
      await api.post('/api/products', formData);
      alert('Product added successfully!');
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.error || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Product
  const handleEditProduct = async (formData) => {
    try {
      setIsSubmitting(true);
      await api.put(`/api/products/${selectedProduct._id}`, formData);
      alert('Product updated successfully!');
      setIsModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.error || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/api/products/${productId}`);
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || product.category === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                ← Back to Home
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-purple-600">{products.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Products</p>
                <p className="text-3xl font-bold text-green-600">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Categories</p>
                <p className="text-3xl font-bold text-blue-600">
                  {new Set(products.map(p => p.category)).size}
                </p>
              </div>
              <div className="text-4xl">🏷️</div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg transition-colors ${filter === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-linear-to-r from-purple-600 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/sessions"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-all text-center"
            >
              <div className="text-3xl mb-2">🎥</div>
              <p className="font-semibold text-black">Manage Sessions</p>
            </Link>
            <Link
              to="/analytics"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-all text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="font-semibold text-black">View Analytics</p>
            </Link>
            <Link
              to="/viewer"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-all text-center"
            >
              <div className="text-3xl mb-2">📺</div>
              <p className="font-semibold text-black">View as Customer</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={selectedProduct ? handleEditProduct : handleAddProduct}
        product={selectedProduct}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AdminDashboard;