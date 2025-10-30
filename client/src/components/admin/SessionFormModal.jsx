import { useState, useEffect } from 'react';

const SessionFormModal = ({ isOpen, onClose, onSubmit, session, products, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hostName: '',
    products: [],
    startTime: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title,
        description: session.description || '',
        hostName: session.hostName,
        products: session.products?.map(p => p._id || p) || [],
        startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : ''
      });
    } else {
      // Set default start time to now
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      
      setFormData({
        title: '',
        description: '',
        hostName: '',
        products: [],
        startTime: now.toISOString().slice(0, 16)
      });
    }
    setErrors({});
  }, [session, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductToggle = (productId) => {
    setFormData(prev => {
      const products = prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId];
      
      return { ...prev, products };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required';
    }

    if (!formData.hostName.trim()) {
      newErrors.hostName = 'Host name is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {session ? 'Edit Session' : 'Create New Session'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Session Title */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Session Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Summer Collection Launch 2025"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Brief description of the session..."
              disabled={isLoading}
            />
          </div>

          {/* Host Name and Start Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Host Name *
              </label>
              <input
                type="text"
                name="hostName"
                value={formData.hostName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.hostName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your name"
                disabled={isLoading}
              />
              {errors.hostName && (
                <p className="text-red-500 text-sm mt-1">{errors.hostName}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>
          </div>

          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              Select Products ({formData.products.length} selected)
            </label>
            
            {products.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No products available. Add products first!</p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
                {products.map(product => (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      id={`product-${product._id}`}
                      checked={formData.products.includes(product._id)}
                      onChange={() => handleProductToggle(product._id)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100';
                      }}
                    />
                    <label
                      htmlFor={`product-${product._id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-semibold text-gray-800">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        ${product.price.toFixed(2)} • Stock: {product.stock}
                      </div>
                    </label>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (session ? 'Update Session' : 'Create Session')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionFormModal;