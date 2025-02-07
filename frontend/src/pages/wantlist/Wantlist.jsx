import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Aperture } from 'lucide-react';
import  WantlistForm  from './WantlistForm';
import { API_BASE_URL } from '../Api/api';

function Wantlist() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [wantlist, setWantlist] = useState([]);

  useEffect(() => {
    fetchWantlist();
  }, []);

  const fetchWantlist = async () => {
    const response = await fetch(`${API_BASE_URL}/api/wantlist/all`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    });
    const data = await response.json();
    setWantlist(data);
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
    setWantlist([...wantlist, newItem]);
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
    setWantlist(
      wantlist.map((item) => (item.id === id ? updatedItem : item))
    );
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
    setWantlist(wantlist.filter((item) => item.id !== id));
  };

  const deleteItem = async (id) => {
    await fetch(`${API_BASE_URL}/api/wantlist/remove/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wantlist</h1>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {wantlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.productName}
                    </h3>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800 mb-2">
                    {item.category}
                  </span>

                  <p className="text-gray-600 mb-4">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Price Range:</span>
                      <br />${item.priceMin} - ${item.priceMax}
                    </div>
                    <div>
                      <span className="font-medium">Max Age:</span>
                      <br />{item.monthsOldMax} months
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <br />{new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
