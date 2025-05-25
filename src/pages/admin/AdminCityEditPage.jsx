import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import getFullImageUrl from '../../utils/getFullImageUrl';


const AdminCityEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cities`);
        const city = data.find(c => c._id === id);
        if (!city) throw new Error('City not found');
        setName(city.name);
        setExistingImageUrl(city.imageUrl);
      } catch (err) {
        setError('Failed to load city.');
      }
    };

    fetchCity();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const formData = new FormData();
    if (name) formData.append('name', name);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/cities/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => navigate('/admin/cities'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update city.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit City</h1>

      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">City updated!</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">City Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {existingImageUrl && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Image:</p>
            {existingImageUrl && (
  <p className="text-sm text-gray-500">
    Image URL: {getFullImageUrl(existingImageUrl)}
  </p>
)}

            <img
  src={getFullImageUrl(existingImageUrl)}
  alt={name}
  className="h-24 rounded border"
/>

          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">New Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Update City
        </button>
      </form>
    </div>
  );
};

export default AdminCityEditPage;
