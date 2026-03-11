import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL, API_URL } from '../config';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [collectionCategories, setCollectionCategories] = useState([]);
  const [brandCategories, setBrandCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Generic Form state
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Generic');
  const [collectionCategory, setCollectionCategory] = useState('');
  const [brandCategory, setBrandCategory] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [labels, setLabels] = useState(''); // comma separated
  const [uploading, setUploading] = useState(false);
  
  // Dynamic arrays
  const [specifications, setSpecifications] = useState([]); // [{key: '', value: ''}]
  const [variants, setVariants] = useState([]); // [{size: '', color: '', sku: '', priceAdjustment: 0, stock: 0}]

  const [editId, setEditId] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products`);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: collectionsData } = await axios.get(`${API_URL}/categories?type=collection`);
      setCollectionCategories(collectionsData);
      
      const { data: brandsData } = await axios.get(`${API_URL}/categories?type=brand`);
      setBrandCategories(brandsData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
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
      setImage(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  // Spec Handlers
  const addSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const updateSpec = (index, field, val) => {
      const newSpecs = [...specifications];
      newSpecs[index][field] = val;
      setSpecifications(newSpecs);
  };
  const removeSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));

  // Variant Handlers
  const addVariant = () => setVariants([...variants, { size: '', color: '', sku: '', priceAdjustment: 0, stock: 0 }]);
  const updateVariant = (index, field, val) => {
      const newVars = [...variants];
      newVars[index][field] = val;
      setVariants(newVars);
  };
  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert spec array to Object for Map schema
      const specsObj = {};
      specifications.forEach(spec => {
          if(spec.key && spec.value) specsObj[spec.key] = spec.value;
      });

      const productData = {
        title,
        brand,
        collectionCategory: collectionCategory || null,
        brandCategory: brandCategory || null,
        description,
        basePrice: Number(basePrice),
        salePrice: salePrice ? Number(salePrice) : null,
        stock: Number(stock),
        images: image ? [image] : [],
        labels: labels.split(',').map(l => l.trim()).filter(l => l),
        specifications: specsObj,
        variants: variants
      };

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
        await axios.put(`${API_URL}/products/${editId}`, productData, config);
      } else {
        await axios.post(`${API_URL}/products`, productData, config);
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product.');
    }
  };

  const resetForm = () => {
      setIsAdding(false);
      setEditId(null);
      setTitle('');
      setBrand('Generic');
      setCollectionCategory('');
      setBrandCategory('');
      setDescription('');
      setBasePrice('');
      setSalePrice('');
      setStock('');
      setImage('');
      setLabels('');
      setSpecifications([]);
      setVariants([]);
  };

  const handleEditClick = (product) => {
      setEditId(product._id);
      setTitle(product.title);
      setBrand(product.brand || 'Generic');
      setCollectionCategory(product.collectionCategory ? (product.collectionCategory._id || product.collectionCategory) : '');
      setBrandCategory(product.brandCategory ? (product.brandCategory._id || product.brandCategory) : '');
      setDescription(product.description);
      setBasePrice(product.basePrice || product.price); // fallback if old schema
      setSalePrice(product.salePrice || '');
      setStock(product.stock);
      setImage(product.images && product.images.length > 0 ? product.images[0] : '');
      setLabels(product.labels ? product.labels.join(', ') : '');
      
      // Convert Map back to array for UI
      const specArr = [];
      if(product.specifications) {
          for (const [key, value] of Object.entries(product.specifications)) {
              specArr.push({key, value});
          }
      }
      setSpecifications(specArr);
      setVariants(product.variants || []);
      
      setIsAdding(true);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Products List</h3>
        <button 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90"
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
        >
          {isAdding ? 'Cancel' : 'Add Product'}
        </button>
      </div>
      
      {isAdding && (
        <div className="mb-8 p-6 border rounded bg-gray-50">
          <h4 className="text-lg font-bold mb-4">{editId ? 'Edit Product' : 'Create New Product'}</h4>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Brand</label>
                <input type="text" className="w-full p-2 border rounded" value={brand} onChange={(e) => setBrand(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Collection Category</label>
                <select className="w-full p-2 border rounded cursor-pointer" value={collectionCategory} onChange={(e) => setCollectionCategory(e.target.value)}>
                  <option value="">Select Collection</option>
                  {collectionCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Brand Category</label>
                <select className="w-full p-2 border rounded cursor-pointer" value={brandCategory} onChange={(e) => setBrandCategory(e.target.value)}>
                  <option value="">Select Brand</option>
                  {brandCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Base Price ($) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" className="w-full p-2 border rounded" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Sale Price ($)</label>
                <input type="number" step="0.01" className="w-full p-2 border rounded" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Leave blank if not on sale" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Base Stock <span className="text-red-500">*</span></label>
                <input type="number" className="w-full p-2 border rounded" value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Labels (Comma Separated)</label>
                <input type="text" className="w-full p-2 border rounded" value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="e.g. New, Sale, Best Seller" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Image</label>
                <input type="text" placeholder="Enter image URL or upload" className="w-full p-2 border rounded mb-2" value={image} onChange={(e) => setImage(e.target.value)} />
                <input type="file" onChange={uploadFileHandler} className="w-full p-2 border rounded" />
                {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea className="w-full p-2 border rounded" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Specifications Array */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 font-bold">Specifications (e.g. Gear Ratio, Length)</label>
                    <button type="button" onClick={addSpec} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Add Spec</button>
                </div>
                {specifications.map((spec, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input type="text" placeholder="Key (e.g. Max Drag)" className="flex-1 p-2 border rounded" value={spec.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} />
                        <input type="text" placeholder="Value (e.g. 11kg)" className="flex-1 p-2 border rounded" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} />
                        <button type="button" onClick={() => removeSpec(i)} className="bg-red-500 text-white px-3 rounded hover:bg-red-600">X</button>
                    </div>
                ))}
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Variants Array */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 font-bold">Variants (e.g. Size, Color)</label>
                    <button type="button" onClick={addVariant} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Add Variant</button>
                </div>
                {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-center bg-gray-100 p-2 rounded">
                        <input type="text" placeholder="Size (e.g. 5000)" className="p-2 border rounded" value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} />
                        <input type="text" placeholder="Color" className="p-2 border rounded" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} />
                        <input type="text" placeholder="SKU" className="p-2 border rounded" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} />
                        <div>
                            <span className="text-xs text-gray-500">Price Adj. +/-</span>
                            <input type="number" step="0.01" placeholder="+/- Price" className="w-full p-2 border rounded" value={v.priceAdjustment} onChange={(e) => updateVariant(i, 'priceAdjustment', e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                             <div>
                                <span className="text-xs text-gray-500">Stock</span>
                                <input type="number" placeholder="Stock" className="w-full p-2 border rounded" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
                             </div>
                            <button type="button" onClick={() => removeVariant(i)} className="bg-red-500 text-white px-3 rounded hover:bg-red-600 mt-4">X</button>
                        </div>
                    </div>
                ))}
            </div>

            <div>
              <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 text-lg font-bold rounded hover:bg-green-700">Save Product</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-3">Image</th>
            <th className="p-3">Brand & Title</th>
            <th className="p-3">Base Price</th>
            <th className="p-3">Vars/Specs</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="5" className="p-3 text-center text-gray-500">No products found.</td></tr>
          ) : (
            products.map((p) => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {p.images && p.images.length > 0 && (
                    <img src={`${BASE_URL}${p.images[0]}`} alt={p.title} className="w-12 h-12 object-cover rounded" />
                  )}
                </td>
                <td className="p-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest block">{p.brand}</span>
                    <span className="font-semibold">{p.title}</span>
                </td>
                <td className="p-3">
                    ${p.basePrice || p.price}
                    {p.salePrice && <span className="text-red-500 ml-2 block text-sm">Sale: ${p.salePrice}</span>}
                </td>
                <td className="p-3 text-sm text-gray-600">
                    <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-1">{p.variants?.length || 0} Vars</span>
                    <span className="inline-block bg-gray-100 rounded px-2 py-1">{Object.keys(p.specifications || {}).length} Specs</span>
                </td>
                <td className="p-3">
                  <button onClick={() => handleEditClick(p)} className="text-blue-600 cursor-pointer hover:underline mr-4">Edit</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
