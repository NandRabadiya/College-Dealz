import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Aperture, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WantlistForm from './WantlistForm';
import { API_BASE_URL } from '../Api/api';

function Wantlist() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [allWantlist, setAllWantlist] = useState([]);
  const [myWantlist, setMyWantlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

  useEffect(() => {
    fetchWantlists();
  }, []);

  const fetchWantlists = async () => {
    setLoading(true);
    try {
      // Fetch all wantlist items
      const allResponse = await fetch(`${API_BASE_URL}/api/wantlist/all-wantlist`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      const allData = await allResponse.json();
      setAllWantlist(allData);
      
      // Endpoint for my wantlist items
      const myResponse = await fetch(`${API_BASE_URL}/api/wantlist/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      const myData = await myResponse.json();
      setMyWantlist(myData);
    } catch (error) {
      console.error("Error fetching wantlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await addItem(data);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const addItem = async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/wantlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: JSON.stringify(data),
    });
    const newItem = await response.json();
    setMyWantlist([...myWantlist, newItem]);
    setAllWantlist([...allWantlist, newItem]);
  };

  const updateItem = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/wantlist/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: JSON.stringify(data),
    });
    const updatedItem = await response.json();
    
    setMyWantlist(
      myWantlist.map((item) => (item.id === id ? updatedItem : item))
    );
    setAllWantlist(
      allWantlist.map((item) => (item.id === id ? updatedItem : item))
    );
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
    setMyWantlist(myWantlist.filter((item) => item.id !== id));
    setAllWantlist(allWantlist.filter((item) => item.id !== id));
  };

  const deleteItem = async (id) => {
    await fetch(`${API_BASE_URL}/api/wantlist/remove/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    });
  };

  const handlePostDeal = (wantlistData) => {
    // Logic to navigate to post a deal page with wantlist data
    navigate(`/post-a-deal?wantlistId=${wantlistData.id}`);
  };

  const currentWantlist = activeTab === 'all' ? allWantlist : myWantlist;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Wantlist</h1>
          
          <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base flex-1 sm:flex-none"
            >
              <Plus size={18} />
              <span>Add Item You Want</span>
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 sm:py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`py-3 sm:py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Wantlist
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10 sm:py-12">
            <Aperture className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading wantlist...</span>
          </div>
        ) : currentWantlist.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
              {activeTab === 'all' ? 'No products available' : 'Your wantlist is empty'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
              {activeTab === 'all' 
                ? 'There are currently no products in the wantlist.' 
                : 'Start adding items you\'re looking for by clicking the "Add Item" button.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentWantlist.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-all hover:shadow-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate pr-2">
                    {item.productName}
                  </h3>
                  
                  <div className="flex gap-2 ml-2 shrink-0">
                    {activeTab === 'all' ? (
                      <button
                        onClick={() => handlePostDeal(item)}
                        className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        aria-label="Post deal"
                      >
                        <Plus size={14} />
                        <span className="hidden sm:inline">Post Deal</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          aria-label="Edit item"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          aria-label="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-block px-2 py-1 text-xs sm:text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                    {item.category}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded">
                    <span className="font-medium block mb-1">Price Range</span>
                    ${item.priceMin} - ${item.priceMax}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded">
                    <span className="font-medium block mb-1">Max Age</span>
                    {item.monthsOldMax} months
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded col-span-2 sm:col-span-1">
                    <span className="font-medium block mb-1">Updated</span>
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <WantlistForm
            onClose={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            onSubmit={handleSubmit}
            initialData={editingItem}
          />
        )}
      </div>
    </div>
  );
}

export default Wantlist;