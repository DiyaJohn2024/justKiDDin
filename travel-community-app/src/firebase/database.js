// src/firebase/database.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit ,
  increment
} from 'firebase/firestore';
import { db } from './config';

// Add a community contribution
export const addCommunitySpot = async (spotData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'locations'), {
      ...spotData,
      contributorId: userId,
      createdAt: new Date().toISOString(),
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
      verified: false
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get locations by category
export const getLocationsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'locations'),
      where('category', '==', category),
      orderBy('averageRating', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const locations = [];
    
    querySnapshot.forEach((doc) => {
      locations.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: locations };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add rating to a location
export const addRating = async (locationId, userId, rating, review = '') => {
  try {
    // Add rating to ratings collection
    await addDoc(collection(db, 'ratings'), {
      locationId,
      userId,
      rating,
      review,
      createdAt: new Date().toISOString()
    });
    
    // Update location average rating (simplified version)
    // In production, you'd use Firebase Functions for this
    const locationRef = doc(db, 'locations', locationId);
    
    // This is a simplified version - in real app, calculate proper average
    await updateDoc(locationRef, {
      totalRatings: increment(1),
      lastRated: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get personalized recommendations
export const getPersonalizedRecommendations = async (userPreferences) => {
  try {
    const { interests, travelStyle, ageGroup } = userPreferences;
    
    // Simple recommendation logic based on interests
    const queries = interests.map(async (interest) => {
      const q = query(
        collection(db, 'locations'),
        where('tags', 'array-contains', interest),
        orderBy('averageRating', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const locations = [];
      
      querySnapshot.forEach((doc) => {
        locations.push({ id: doc.id, ...doc.data() });
      });
      
      return locations;
    });
    
    const results = await Promise.all(queries);
    const allRecommendations = results.flat();
    
    // Remove duplicates and sort by rating
    const uniqueRecommendations = allRecommendations.reduce((acc, current) => {
      const exists = acc.find(item => item.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return { success: true, data: uniqueRecommendations.slice(0, 10) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all community contributions
export const getAllCommunitySpots = async () => {
  try {
    const q = query(
      collection(db, 'locations'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const locations = [];
    
    querySnapshot.forEach((doc) => {
      locations.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: locations };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
