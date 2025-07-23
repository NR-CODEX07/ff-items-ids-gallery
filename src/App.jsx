import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rareFilter, setRareFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [collectionFilter, setCollectionFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40; // 5x8 layout

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/main.json');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        return [];
      }

      return items.filter(item => {
        if (!item || !item.Id) return false;

        // Enhanced search functionality - matches partial text in any field
        const searchLower = searchTerm.toLowerCase().trim();
        
        let matchesSearch = true;
        if (searchLower !== '') {
          const searchWords = searchLower.split(' ').filter(word => word.length > 0);
          
          matchesSearch = searchWords.every(word => {
            return (
              (item.name && item.name.toLowerCase().includes(word)) ||
              (item.desc && item.desc.toLowerCase().includes(word)) ||
              (item.Id && item.Id.toString().includes(word)) ||
              (item.Type && item.Type.toLowerCase().includes(word)) ||
              (item.collectionType && item.collectionType.toLowerCase().includes(word)) ||
              (item.Rare && item.Rare.toLowerCase().includes(word)) ||
              (item.Icon && item.Icon.toLowerCase().includes(word))
            );
          });
        }
        
        const matchesRare = rareFilter === 'ALL' || (item.Rare && item.Rare === rareFilter);
        const matchesType = typeFilter === 'ALL' || (item.Type && item.Type === typeFilter);
        const matchesCollection = collectionFilter === 'ALL' || (item.collectionType && item.collectionType === collectionFilter);
        
        // For search results, show all matching items
        // For homepage (no search), only show items with proper name and description
        const isValid = searchTerm.trim() !== '' ? true : (item.name && item.name.trim() !== '' && item.desc && item.desc.trim() !== '');
        
        return matchesSearch && matchesRare && matchesType && matchesCollection && isValid;
      });
    } catch (error) {
      console.error('Error filtering items:', error);
      return items.filter(item => item && item.Id);
    }
  }, [items, searchTerm, rareFilter, typeFilter, collectionFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const getImageUrl = (itemId) => {
    return `https://free-fire-items.vercel.app/item-image?id=${itemId}&key=NRCODEX`;
  };

  const getBackgroundImage = (rarity) => {
    if (!rarity) return null;
    const rarityLower = rarity.toLowerCase();
    
    const backgroundMap = {
      'white': '/White.jpg',
      'green': '/Green.png',
      'blue': '/Blue.png',
      'purple': '/Purple.png',
      'purple_plus': '/Purple_Plus.png',
      'orange': '/Oranage.png',
      'oranage_plus': '/Oranage_Plus.png',
      'red': '/Red.png'
    };
    
    return backgroundMap[rarityLower] || null;
  };

  const getRarityClass = (rarity) => {
    if (!rarity) return '';
    return `rarity-${rarity.toLowerCase()}`;
  };

  const getRarityBackgroundColor = (rarity) => {
    if (!rarity) return '#444444';
    const rarityColors = {
      'common': '#888888',
      'rare': '#0088ff',
      'epic': '#8800ff',
      'legendary': '#ff8800',
      'mythic': '#ff0088',
      'none': '#444444',
      'white': '#ffffff',
      'green': '#00ff00',
      'blue': '#0088ff',
      'purple': '#8800ff',
      'purple_plus': '#aa00ff',
      'orange': '#ff8800',
      'oranage_plus': '#ffaa00',
      'red': '#ff0000'
    };
    return rarityColors[rarity.toLowerCase()] || '#444444';
  };

  const uniqueRarities = [...new Set(items.map(item => item.Rare).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(items.map(item => item.Type).filter(Boolean))].sort();
  const uniqueCollections = [...new Set(items.map(item => item.collectionType).filter(Boolean))].sort();

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleSearchClick = () => {
    // Search is now real-time, this button just triggers a manual search
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  const handleImageLoad = (itemId) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rareFilter, typeFilter, collectionFilter]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading Items...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="controls">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search By Keyword, ItemID, Description, Type, Rarity, Icon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                onClick={handleSearchClick}
                className="search-button"
                variant="default"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="filters">
            <div className="filter-group">
              <label className="filter-label">Rare Type</label>
              <select
                className="filter-select"
                value={rareFilter}
                onChange={(e) => setRareFilter(e.target.value)}
              >
                <option value="ALL">ALL</option>
                {uniqueRarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Item Type</label>
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">ALL</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Collection Type</label>
              <select
                className="filter-select"
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
              >
                <option value="ALL">ALL</option>
                {uniqueCollections.map(collection => (
                  <option key={collection} value={collection}>{collection}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="stats">
          <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items (Page {currentPage} of {totalPages})</p>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <h3>No items found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="items-grid">
              {currentItems.map((item, index) => {
                const backgroundImage = getBackgroundImage(item.Rare);
                return (
                  <div
                    key={item.Id}
                    className={`item-card ${getRarityClass(item.Rare)}`}
                    onClick={() => handleItemClick(item)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div 
                      className="item-image-container"
                      style={{ 
                        backgroundColor: getRarityBackgroundColor(item.Rare),
                        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {imageErrors.has(item.Id) ? (
                        <div className="image-placeholder">
                          <span>Image<br/>Loading...</span>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(item.Id)}
                          alt={item.name || `Item ${item.Id}`}
                          className="item-image"
                          onError={() => handleImageError(item.Id)}
                          onLoad={() => handleImageLoad(item.Id)}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="item-info">
                      <h4 className="item-name">{item.name || `Item ${item.Id}`}</h4>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="pagination">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="pagination-btn"
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination-btn"
                variant="outline"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </main>

      {selectedItem && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              <X className="w-6 h-6" />
            </button>
            
            <div className="modal-image-container">
              <div 
                className="modal-image-wrapper"
                style={{ 
                  backgroundColor: getRarityBackgroundColor(selectedItem.Rare),
                  backgroundImage: getBackgroundImage(selectedItem.Rare) ? `url(${getBackgroundImage(selectedItem.Rare)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '200px',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  margin: '0 auto'
                }}
              >
                {imageErrors.has(selectedItem.Id) ? (
                  <div className="image-placeholder" style={{width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                    <span>Image<br/>Loading...</span>
                  </div>
                ) : (
                  <img
                    src={getImageUrl(selectedItem.Id)}
                    alt={selectedItem.name || `Item ${selectedItem.Id}`}
                    className="modal-image"
                    onError={() => handleImageError(selectedItem.Id)}
                    onLoad={() => handleImageLoad(selectedItem.Id)}
                    style={{
                      maxWidth: '180px',
                      maxHeight: '180px',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </div>
            </div>
            
            <h2 className="modal-title">{selectedItem.name || `Item ${selectedItem.Id}`}</h2>
            
            <div className="modal-details">
              <div className="modal-detail">
                <span className="modal-detail-label">ID:</span>
                <span className="modal-detail-value">{selectedItem.Id}</span>
              </div>
              
              <div className="modal-detail">
                <span className="modal-detail-label">Type:</span>
                <span className="modal-detail-value">{selectedItem.Type || 'N/A'}</span>
              </div>
              
              <div className="modal-detail">
                <span className="modal-detail-label">Collection:</span>
                <span className="modal-detail-value">{selectedItem.collectionType || 'N/A'}</span>
              </div>
              
              <div className="modal-detail">
                <span className="modal-detail-label">Rarity:</span>
                <span className="modal-detail-value">
                  <span className={`rarity-badge ${(selectedItem.Rare || '').toLowerCase()}`}>
                    {selectedItem.Rare || 'N/A'}
                  </span>
                </span>
              </div>
              
              <div className="modal-detail">
                <span className="modal-detail-label">Unique:</span>
                <span className="modal-detail-value">
                  {selectedItem.IsUnique ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="modal-detail">
                <span className="modal-detail-label">Icon:</span>
                <span className="modal-detail-value">{selectedItem.Icon || 'N/A'}</span>
              </div>
            </div>
            
            <div className="modal-description">
              <h4>Description</h4>
              <p>{selectedItem.desc || 'No description available'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

