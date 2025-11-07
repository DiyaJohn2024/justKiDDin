// src/components/AddSpotForm.js
import React, { useState } from 'react';
import { addCommunitySpot } from '../firebase/database';

const AddSpotForm = ({ userId, onSpotAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    localTip: '',
    tags: []
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'Religious', label: '🕉️ Religious Places', icon: '🕉️' },
    { value: 'Historic', label: '🏛️ Historic Sites', icon: '🏛️' },
    { value: 'Reunion', label: '👥 Reunion Spots', icon: '👥' },
    { value: 'Concerts', label: '🎵 Concert Venues', icon: '🎵' },
    { value: 'Tournaments', label: '🏆 Sports Venues', icon: '🏆' },
    { value: 'Adventure', label: '🏔️ Adventure Sports', icon: '🏔️' }
  ];

  const availableTags = [
    'Family Friendly', 'Budget Friendly', 'Luxury', 'Photography', 
    'Food Paradise', 'Peaceful', 'Crowded', 'Hidden Gem', 
    'Instagram Worthy', 'Local Favorite', 'Tourist Attraction',
    'Beach', 'Mountain', 'City', 'Nature', 'Cultural'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else if (prev.length < 5) { // Limit to 5 tags
        return [...prev, tag];
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const spotData = {
        ...formData,
        tags: selectedTags,
        category: formData.category
      };

      const result = await addCommunitySpot(spotData, userId);
      
      if (result.success) {
        setSuccess(true);
        setFormData({
          name: '',
          description: '',
          category: '',
          location: '',
          localTip: '',
          tags: []
        });
        setSelectedTags([]);
        
        // Call parent callback
        if (onSpotAdded) {
          onSpotAdded();
        }
        
        // Show success message
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Failed to add spot. Please try again.');
      }
    } catch (error) {
      console.error('Error adding spot:', error);
      alert('Error adding spot. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">➕ Share a Local Gem</h5>
            <small>Help fellow travelers discover amazing places!</small>
          </div>
          
          <div className="card-body">
            {success && (
              <div className="alert alert-success alert-dismissible fade show">
                <strong>🎉 Success!</strong> Your spot has been added to the community!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Spot Name */}
              <div className="mb-3">
                <label className="form-label">Spot Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Hidden Beach Cafe, Ancient Temple"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-3">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Near Marine Drive, Mumbai"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe what makes this place special..."
                  required
                />
              </div>

              {/* Local Tip */}
              <div className="mb-3">
                <label className="form-label">Local Tip (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  name="localTip"
                  value={formData.localTip}
                  onChange={handleInputChange}
                  placeholder="e.g., Visit during sunset, Try the special chai"
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="form-label">Tags (Select up to 5)</label>
                <div className="tag-selection">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`btn btn-sm me-2 mb-2 ${
                        selectedTags.includes(tag) 
                          ? 'btn-primary' 
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                      disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <small className="text-muted">
                  Selected: {selectedTags.length}/5 tags
                </small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Adding to Community...
                  </>
                ) : (
                  '🌟 Share with Community'
                )}
              </button>
            </form>

            <div className="alert alert-info mt-3">
              <small>
                <strong>💡 Tip:</strong> The more details you provide, the more helpful 
                it will be for other travelers!
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSpotForm;
