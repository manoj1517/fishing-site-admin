import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL, API_URL } from '../config';

const Collections = () => {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Generic Form state
  const [name, setName] = useState('');
  const [iconImage, setIconImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories?type=collection`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post(`${BASE_URL}/api/upload`, formData, config);
      setIconImage(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = { name, iconImage, type: 'collection' };

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        alert('You must be logged in as an admin.');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      if (editId) {
        await axios.put(`${API_URL}/categories/${editId}`, categoryData, config);
      } else {
        await axios.post(`${API_URL}/categories`, categoryData, config);
      }
      
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving collection:', error.response?.data || error.message);
      alert(`Failed to save collection. ${error.response?.data?.message || ''}`);
    }
  };
  
  const handleDeleteClick = async (id) => {
      if(window.confirm('Are you sure you want to delete this collection?')) {
          try {
             const userInfo = JSON.parse(localStorage.getItem('userInfo'));
             const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
             await axios.delete(`${API_URL}/categories/${id}`, config);
             fetchCategories();
          } catch(error) {
             console.error('Error deleting collection:', error);
             alert('Failed to delete collection.');
          }
      }
  };

  const resetForm = () => {
      setIsAdding(false);
      setEditId(null);
      setName('');
      setIconImage('');
  };

  const handleEditClick = (cat) => {
      setEditId(cat._id);
      setName(cat.name);
      setIconImage(cat.iconImage || '');
      setIsAdding(true);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Collections</h3>
        <button 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90"
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
        >
          {isAdding ? 'Cancel' : 'Add Collection'}
        </button>
      </div>
      
      {isAdding && (
        <div className="mb-8 p-6 border rounded bg-gray-50">
          <h4 className="text-lg font-bold mb-4">{editId ? 'Edit Collection' : 'Create New Collection'}</h4>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                <input type="text" className="w-full p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Icon/Image</label>
                <input type="text" placeholder="Enter image URL or upload" className="w-full p-2 border rounded mb-2" value={iconImage} onChange={(e) => setIconImage(e.target.value)} />
                <input type="file" onChange={uploadFileHandler} className="w-full p-2 border rounded" />
                {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
              </div>
            </div>

            <div>
              <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 text-lg font-bold rounded hover:bg-green-700">Save Collection</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-3">Image</th>
            <th className="p-3">Name</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr><td colSpan="4" className="p-3 text-center text-gray-500">No collections found.</td></tr>
          ) : (
            categories.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {c.iconImage && (
                    <img src={`${BASE_URL}${c.iconImage}`} alt={c.name} className="w-12 h-12 object-cover rounded" />
                  )}
                </td>
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 font-mono text-sm text-gray-500">{c.slug}</td>
                <td className="p-3">
                  <button onClick={() => handleEditClick(c)} className="text-blue-600 cursor-pointer hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDeleteClick(c._id)} className="text-red-600 cursor-pointer hover:underline">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Collections;
