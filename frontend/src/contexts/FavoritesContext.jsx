import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    console.warn('useFavorites must be used within a FavoritesProvider - returning fallback');
    // Return fallback instead of throwing error
    return {
      favorites: new Set(),
      bookmarks: new Set(),
      favoriteJobs: [],
      bookmarkedJobs: [],
      addToFavorites: () => false,
      removeFromFavorites: () => false,
      addToBookmarks: () => false,
      removeFromBookmarks: () => false,
      toggleFavorite: () => false,
      toggleBookmark: () => false,
      isFavorited: () => false,
      isBookmarked: () => false
    };
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  // Load favorites and bookmarks from localStorage when user changes
  useEffect(() => {
    if (user) {
      const userId = user.id || user._id;
      console.log('🔍 FavoritesContext: Loading data for user:', userId);
      
      const savedFavorites = localStorage.getItem(`favorites_${userId}`);
      const savedBookmarks = localStorage.getItem(`bookmarks_${userId}`);
      const savedFavoriteJobs = localStorage.getItem(`favoriteJobs_${userId}`);
      const savedBookmarkedJobs = localStorage.getItem(`bookmarkedJobs_${userId}`);
      
      if (savedFavorites) {
        const favoritesArray = JSON.parse(savedFavorites);
        setFavorites(new Set(favoritesArray));
        console.log('🔍 FavoritesContext: Loaded favorites:', favoritesArray);
      }
      
      if (savedBookmarks) {
        const bookmarksArray = JSON.parse(savedBookmarks);
        setBookmarks(new Set(bookmarksArray));
        console.log('🔍 FavoritesContext: Loaded bookmarks:', bookmarksArray);
      }
      
      if (savedFavoriteJobs) {
        const favoriteJobsArray = JSON.parse(savedFavoriteJobs);
        setFavoriteJobs(favoriteJobsArray);
        console.log('🔍 FavoritesContext: Loaded favorite jobs:', favoriteJobsArray.length);
      }
      
      if (savedBookmarkedJobs) {
        const bookmarkedJobsArray = JSON.parse(savedBookmarkedJobs);
        setBookmarkedJobs(bookmarkedJobsArray);
        console.log('🔍 FavoritesContext: Loaded bookmarked jobs:', bookmarkedJobsArray.length);
      }
    } else {
      // Clear data when user logs out
      setFavorites(new Set());
      setBookmarks(new Set());
      setFavoriteJobs([]);
      setBookmarkedJobs([]);
    }
  }, [user]);

  const addToFavorites = (jobId, jobData) => {
    if (!user) return false;
    
    const userId = user.id || user._id;
    console.log('🔍 FavoritesContext: Adding to favorites:', jobId);
    
    // Update favorites set
    const newFavorites = new Set(favorites);
    newFavorites.add(jobId);
    setFavorites(newFavorites);
    
    // Update favorite jobs array (avoid duplicates)
    const newFavoriteJobs = favoriteJobs.filter(job => job.id !== jobId);
    newFavoriteJobs.push({
      ...jobData,
      id: jobId,
      savedDate: new Date().toISOString(),
      isFavorited: true
    });
    setFavoriteJobs(newFavoriteJobs);
    
    // Save to localStorage
    localStorage.setItem(`favorites_${userId}`, JSON.stringify([...newFavorites]));
    localStorage.setItem(`favoriteJobs_${userId}`, JSON.stringify(newFavoriteJobs));
    
    console.log('✅ FavoritesContext: Added to favorites successfully');
    return true;
  };

  const removeFromFavorites = (jobId) => {
    if (!user) return false;
    
    const userId = user.id || user._id;
    console.log('🔍 FavoritesContext: Removing from favorites:', jobId);
    
    // Update favorites set
    const newFavorites = new Set(favorites);
    newFavorites.delete(jobId);
    setFavorites(newFavorites);
    
    // Update favorite jobs array
    const newFavoriteJobs = favoriteJobs.filter(job => job.id !== jobId);
    setFavoriteJobs(newFavoriteJobs);
    
    // Save to localStorage
    localStorage.setItem(`favorites_${userId}`, JSON.stringify([...newFavorites]));
    localStorage.setItem(`favoriteJobs_${userId}`, JSON.stringify(newFavoriteJobs));
    
    console.log('✅ FavoritesContext: Removed from favorites successfully');
    return true;
  };

  const addToBookmarks = (jobId, jobData) => {
    if (!user) return false;
    
    const userId = user.id || user._id;
    console.log('🔍 FavoritesContext: Adding to bookmarks:', jobId);
    
    // Update bookmarks set
    const newBookmarks = new Set(bookmarks);
    newBookmarks.add(jobId);
    setBookmarks(newBookmarks);
    
    // Update bookmarked jobs array (avoid duplicates)
    const newBookmarkedJobs = bookmarkedJobs.filter(job => job.id !== jobId);
    newBookmarkedJobs.push({
      ...jobData,
      id: jobId,
      savedDate: new Date().toISOString(),
      isBookmarked: true
    });
    setBookmarkedJobs(newBookmarkedJobs);
    
    // Save to localStorage
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify([...newBookmarks]));
    localStorage.setItem(`bookmarkedJobs_${userId}`, JSON.stringify(newBookmarkedJobs));
    
    console.log('✅ FavoritesContext: Added to bookmarks successfully');
    return true;
  };

  const removeFromBookmarks = (jobId) => {
    if (!user) return false;
    
    const userId = user.id || user._id;
    console.log('🔍 FavoritesContext: Removing from bookmarks:', jobId);
    
    // Update bookmarks set
    const newBookmarks = new Set(bookmarks);
    newBookmarks.delete(jobId);
    setBookmarks(newBookmarks);
    
    // Update bookmarked jobs array
    const newBookmarkedJobs = bookmarkedJobs.filter(job => job.id !== jobId);
    setBookmarkedJobs(newBookmarkedJobs);
    
    // Save to localStorage
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify([...newBookmarks]));
    localStorage.setItem(`bookmarkedJobs_${userId}`, JSON.stringify(newBookmarkedJobs));
    
    console.log('✅ FavoritesContext: Removed from bookmarks successfully');
    return true;
  };

  const toggleFavorite = (jobId, jobData) => {
    if (favorites.has(jobId)) {
      return removeFromFavorites(jobId);
    } else {
      return addToFavorites(jobId, jobData);
    }
  };

  const toggleBookmark = (jobId, jobData) => {
    if (bookmarks.has(jobId)) {
      return removeFromBookmarks(jobId);
    } else {
      return addToBookmarks(jobId, jobData);
    }
  };

  const isFavorited = (jobId) => favorites.has(jobId);
  const isBookmarked = (jobId) => bookmarks.has(jobId);

  const value = {
    favorites,
    bookmarks,
    favoriteJobs,
    bookmarkedJobs,
    addToFavorites,
    removeFromFavorites,
    addToBookmarks,
    removeFromBookmarks,
    toggleFavorite,
    toggleBookmark,
    isFavorited,
    isBookmarked
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
