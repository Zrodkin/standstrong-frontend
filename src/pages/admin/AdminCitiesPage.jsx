import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCityRecords, deleteCityById } from '../../services/cityService';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import getFullImageUrl from '../../utils/getFullImageUrl';

const AdminCitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const data = await getAllCityRecords();
      setCities(data);
    } catch (err) {
      setError('Failed to load cities.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;
    try {
      await deleteCityById(id);
      setCities((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert('Failed to delete city.');
      console.error(err);
    }
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">All Cities</h1>
        <Link
          to="/admin/cities/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <FiPlus /> Add City
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search cities..."
          className="w-full sm:max-w-sm border border-gray-300 p-2 rounded-md shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCities.map((city) => (
            <div key={city._id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <img
  src={getFullImageUrl(city.imageUrl)}
  alt={city.name}
  className="w-full h-40 object-cover"
/>
              <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">{city.name}</h2>
                <div className="flex gap-3">
                  <Link
                    to={`/admin/cities/edit/${city._id}`}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Edit"
                  >
                    <FiEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(city._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredCities.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              No cities found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCitiesPage;
