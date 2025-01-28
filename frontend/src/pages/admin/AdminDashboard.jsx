import React, { useState } from 'react';
import { PlusCircle, School, Package, Trash2, PenSquare, Search, MapPin } from 'lucide-react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('universities');
  const [isAddingUniversity, setIsAddingUniversity] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);

  // Mock data - In a real app, this would come from an API
  const [universities, setUniversities] = useState([
    { id: '1', name: 'Harvard University', domain: 'harvard.edu', location: 'Cambridge, MA' },
    { id: '2', name: 'Stanford University', domain: 'stanford.edu', location: 'Stanford, CA' },
  ]);

  const [products] = useState([
    { id: '1', name: 'Textbook', description: 'Computer Science 101', price: 59.99, userId: 'user1', userName: 'John Doe' },
    { id: '2', name: 'Calculator', description: 'Scientific Calculator', price: 29.99, userId: 'user2', userName: 'Jane Smith' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    location: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUniversity) {
      setUniversities(universities.map(uni =>
        uni.id === editingUniversity.id
          ? { ...editingUniversity, ...formData }
          : uni
      ));
      setEditingUniversity(null);
    } else {
      setUniversities([...universities, {
        id: Date.now().toString(),
        ...formData
      }]);
    }
    setFormData({ name: '', domain: '', location: '' });
    setIsAddingUniversity(false);
  };

  const handleEdit = (university) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      domain: university.domain,
      location: university.location || '',
    });
    setIsAddingUniversity(true);
  };

  const handleDelete = (id) => {
    setUniversities(universities.filter(uni => uni.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="space-x-4">
              <button
                onClick={() => setActiveTab('universities')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'universities'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <School className="inline-block mr-2 h-5 w-5" />
                Universities
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Package className="inline-block mr-2 h-5 w-5" />
                Products
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'universities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Universities</h2>
              <button
                onClick={() => {
                  setIsAddingUniversity(true);
                  setEditingUniversity(null);
                  setFormData({ name: '', domain: '', location: '' });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add University
              </button>
            </div>

            {isAddingUniversity && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-medium mb-4">
                  {editingUniversity ? 'Edit University' : 'Add New University'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domain *</label>
                    <input
                      type="text"
                      required
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingUniversity(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingUniversity ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {universities.map((university) => (
                    <tr key={university.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{university.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{university.domain}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {university.location ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {university.location}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(university)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <PenSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(university.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Products</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">${product.price}</span>
                      <span className="text-sm text-gray-500">Posted by {product.userName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
