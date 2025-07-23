document.addEventListener('DOMContentLoaded', () => {
    const itemGrid = document.getElementById('itemGrid');
    const searchInput = document.getElementById('searchInput');
    const rareTypeFilter = document.getElementById('rareTypeFilter');
    const itemTypeFilter = document.getElementById('itemTypeFilter');
    const collectionTypeFilter = document.getElementById('collectionTypeFilter');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageNumbersContainer = document.getElementById('pageNumbers');
    const modalOverlay = document.getElementById('itemDetailsModalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalItemImage = document.getElementById('modalItemImage');
    const modalItemName = document.getElementById('modalItemName');
    const modalItemId = document.getElementById('modalItemId');
    const modalItemType = document.getElementById('modalItemType');
    const modalItemCollection = document.getElementById('modalItemCollection');
    const modalItemRarity = document.getElementById('modalItemRarity');
    const modalItemUnique = document.getElementById('modalItemUnique');
    const modalItemIcon = document.getElementById('modalItemIcon');
    const modalItemDescription = document.getElementById('modalItemDescription');
    const homeIcon = document.getElementById('homeIcon'); // Get the home icon element

    let allItems = [];
    let filteredItems = [];
    let currentPage = 1;
    const itemsPerPage = 40; // 5x8 grid

    // Function to map rarity to background image filename (expects LOWERCASE PNGs)
    const getRarityBackground = (rarity) => {
        let normalizedRarity = (rarity || 'NONE').toString().toUpperCase().trim();
        normalizedRarity = normalizedRarity.replace(/\s/g, '_'); // Replace spaces with underscores
        normalizedRarity = normalizedRarity.replace(/\+/g, '_Plus'); // Replace '+' with '_Plus'

        const rarityMap = {
            'NONE': 'none.png',
            'WHITE': 'white.png',
            'GREEN': 'green.png',
            'BLUE': 'blue.png',
            'PURPLE': 'purple.png',
            'ORANGE': 'orange.png',
            'CARD': 'card.png', 
            'RED': 'red.png',
            'PURPLE_PLUS': 'purple_plus.png',
            'ORANGE_PLUS': 'orange_plus.png',
            'RED_PLUS': 'red_plus.png',
            // Add any other specific rarities you have in your JSON here, e.g.:
            // 'LEGENDARY': 'legendary.png', (if you have a 'legendary.png' file)
        };

        const filename = rarityMap[normalizedRarity] || 'none.png'; // Fallback to none.png if rarity not found
        const path = `background/${filename}`;
        // console.log(`DEBUG: Rarity input: '${rarity}', Normalized for map: '${normalizedRarity}', Expected file path: '${path}'`); // For debugging backgrounds
        return path;
    };

    // Rarity colors for modal display
    const rarityColorMap = {
        'NONE': '#888888',        // Grey for None
        'WHITE': '#CCCCCC',       // Light grey for White
        'GREEN': '#38b000',       // Primary Green (as used in CSS)
        'BLUE': '#007bff',        // Standard Blue
        'PURPLE': '#800080',      // Standard Purple
        'ORANGE': '#ff9900',      // Standard Orange
        'CARD': '#cccccc',        // Light grey for Card
        'RED': '#dc3545',         // Standard Red
        'PURPLE_PLUS': '#bf00bf', // Darker Purple
        'ORANGE_PLUS': '#cc7a00', // Darker Orange
        'RED_PLUS': '#b22222'     // Darker Red
    };

    // Fetch data from main.json
    async function fetchItems() {
        itemGrid.innerHTML = '<div class="loading-placeholder" style="grid-column: 1 / -1;">Loading Items...</div>';
        console.log('--- FETCH INITIATED ---');

        // IMPORTANT: Check if running on file:// protocol for local development
        if (window.location.protocol === 'file:') {
            console.warn('WARNING: Running directly from file:// protocol. This might prevent fetching main.json due to browser security restrictions (CORS). Please use a local web server (e.g., http://localhost:8000/) for development.');
            itemGrid.innerHTML = `
                <div class="loading-placeholder" style="color: yellow; grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <i class="fas fa-server" style="font-size: 3em; margin-bottom: 15px;"></i>
                    <span>Project not running on a web server.</span>
                    <p style="margin-top: 10px;">Please open it via <strong style="color: white; text-decoration: underline;">http://localhost:8000/</strong> (or similar) after starting a local server.</p>
                    <p style="font-size: 0.8em; margin-top: 5px;">(e.g., 'python -m http.server 8000' in your project folder, or use VS Code's Live Server)</p>
                </div>
            `;
            return; // Stop further execution if running locally without a server
        }

        console.log('Attempting to fetch main.json from: ' + window.location.origin + '/main.json'); // Full path for clarity

        try {
            const response = await fetch('main.json');
            console.log('Fetch response received. Status:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}. Ensure 'main.json' is in the root directory of your web server.`);
            }

            const data = await response.json();
            console.log('Data successfully parsed. First 5 items:', data.slice(0, 5));

            if (!Array.isArray(data)) {
                throw new Error('Fetched data is not an array. Please check main.json format. It should be an array of objects: `[ { ... }, { ... } ]`.');
            }

            allItems = data;
            filteredItems = [...allItems]; // Initialize filteredItems with all items
            populateFilters();
            applyFiltersAndSearch(); // Call applyFiltersAndSearch initially to render based on filters/search
            console.log('--- FETCH COMPLETE AND INITIAL RENDER ---');

        } catch (error) {
            console.error('CRITICAL ERROR: Failed to fetch or parse main.json:', error);
            itemGrid.innerHTML = `
                <div class="loading-placeholder" style="color: red; grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 15px;"></i>
                    <span>Error loading items.</span>
                    <span>Please check the browser console (F12) for detailed error messages.</span>
                    <span style="font-size: 0.8em; margin-top: 10px;">Possible issues: 'main.json' file missing/invalid, or incorrect file path.</span>
                    <span style="font-size: 0.8em;">Also verify 'background' folder and its images are correct and accessible.</span>
                    <span style="font-size: 0.7em; margin-top: 5px;">Error message: ${error.message}</span>
                </div>
            `;
        }
    }

    // Populate filter dropdowns dynamically
    function populateFilters() {
        const uniqueRareTypes = new Set(['ALL']);
        const uniqueItemTypes = new Set(['ALL']);
        const uniqueCollectionTypes = new Set(['ALL']);

        allItems.forEach(item => {
            uniqueRareTypes.add(item.Rare || 'NONE');
            uniqueItemTypes.add(item.Type || 'NONE');
            uniqueCollectionTypes.add(item.collectionType || 'NONE');
        });

        // Clear existing options before populating
        rareTypeFilter.innerHTML = '<option value="ALL">ALL</option>';
        itemTypeFilter.innerHTML = '<option value="ALL">ALL</option>';
        collectionTypeFilter.innerHTML = '<option value="ALL">ALL</option>';

        // Sort filter options alphabetically
        Array.from(uniqueRareTypes).sort((a, b) => a.localeCompare(b)).forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            rareTypeFilter.appendChild(option);
        });

        Array.from(uniqueItemTypes).sort((a, b) => a.localeCompare(b)).forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            itemTypeFilter.appendChild(option);
        });

        Array.from(uniqueCollectionTypes).sort((a, b) => a.localeCompare(b)).forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            collectionTypeFilter.appendChild(option);
        });
    }

    // Render items to the grid
    function renderItems(itemsToDisplay) {
        itemGrid.innerHTML = ''; // Clear previous items

        const totalPages = Math.ceil(itemsToDisplay.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages; // Adjust current page if it's beyond total
        } else if (totalPages === 0) {
            currentPage = 1; // If no items, reset to page 1
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsForCurrentPage = itemsToDisplay.slice(startIndex, endIndex);

        if (itemsForCurrentPage.length === 0 && itemsToDisplay.length > 0) {
            currentPage = 1; // Go to first page if current page is empty but total items exist
            renderItems(itemsToDisplay);
            return;
        }

        if (itemsForCurrentPage.length === 0) {
            itemGrid.innerHTML = '<div class="loading-placeholder" style="grid-column: 1 / -1;">No items found matching your criteria.</div>';
            updatePaginationControls(0);
            return;
        }

        itemsForCurrentPage.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.dataset.itemId = item.Id; // Store item ID for easy lookup

            // Set rarity background using CSS custom property for the ::before pseudo-element
            const rarityBgUrl = getRarityBackground(item.Rare);
            itemCard.style.setProperty('--bg-image', `url('${rarityBgUrl}')`);
            
            const imageUrl = `https://free-fire-items.vercel.app/item-image?id=${item.Id}&key=NRCODEX`;

            // Determine what to display for the name
            const displayName = item.name || item.Icon || 'Unknown'; // If name is null, use Icon, else 'Unknown'

            itemCard.innerHTML = `
                <img src="${imageUrl}" alt="${displayName}">
                <h3>${displayName}</h3>
            `;

            // Error handling for image loading (optional, but good for "Unknown" images)
            const imgElement = itemCard.querySelector('img');
            imgElement.onerror = () => {
                console.warn(`Failed to load image for item ID: ${item.Id}. API might not have this item or ID is incorrect.`);
            };

            // Event listener for opening modal
            itemCard.addEventListener('click', () => openModal(item));
            itemGrid.appendChild(itemCard);
        });

        updatePaginationControls(itemsToDisplay.length);
    }

    // Update pagination buttons and numbers
    function updatePaginationControls(totalItemsCount) {
        const totalPages = Math.ceil(totalItemsCount / itemsPerPage);
        pageNumbersContainer.innerHTML = ''; // Clear existing page numbers

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 4);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, endPage - 4);
            }
        }
        startPage = Math.max(1, startPage);

        if (startPage > 1) {
            pageNumbersContainer.innerHTML += `<span class="page-number" data-page="1">1</span>`;
            if (startPage > 2) {
                pageNumbersContainer.innerHTML += `<span class="page-number-dots">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageNumberSpan = document.createElement('span');
            pageNumberSpan.classList.add('page-number');
            if (i === currentPage) {
                pageNumberSpan.classList.add('active');
            }
            pageNumberSpan.dataset.page = i;
            pageNumberSpan.textContent = i;
            pageNumbersContainer.appendChild(pageNumberSpan);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbersContainer.innerHTML += `<span class="page-number-dots">...</span>`;
            }
            pageNumbersContainer.innerHTML += `<span class="page-number" data-page="${totalPages}">${totalPages}</span>`;
        }
    }

    // Function to reset all filters and search, then re-apply
    function resetAllFiltersAndSearch() {
        searchInput.value = '';
        rareTypeFilter.value = 'ALL';
        itemTypeFilter.value = 'ALL';
        collectionTypeFilter.value = 'ALL';
        applyFiltersAndSearch(); // Re-apply all filters (which are now reset)
    }

    // Apply all filters and search query
    function applyFiltersAndSearch() {
        const selectedRareType = rareTypeFilter.value.toUpperCase();
        const selectedItemType = itemTypeFilter.value.toUpperCase();
        const selectedCollectionType = collectionTypeFilter.value.toUpperCase();
        const searchTerm = searchInput.value.toLowerCase().trim();

        console.log(`DEBUG Search/Filter: Term='${searchTerm}', Rare='${selectedRareType}', Item='${selectedItemType}', Collection='${selectedCollectionType}'`);

        filteredItems = allItems.filter(item => {
            const itemRare = (item.Rare || 'NONE').toString().toUpperCase();
            const itemType = (item.Type || 'NONE').toString().toUpperCase();
            const itemCollectionType = (item.collectionType || 'NONE').toString().toUpperCase();
            const itemName = (item.name || '').toString().toLowerCase(); // Handles null
            const itemId = String(item.Id || '').toString().toLowerCase(); // Handles null/undefined Id
            const itemDesc = (item.desc || '').toString().toLowerCase(); // Handles null
            const itemIcon = (item.Icon || '').toString().toLowerCase();

            const matchesRareType = selectedRareType === 'ALL' || itemRare === selectedRareType;
            const matchesItemType = selectedItemType === 'ALL' || itemType === selectedItemType;
            const matchesCollectionType = selectedCollectionType === 'ALL' || itemCollectionType === selectedCollectionType;

            // Advanced search logic: check if ANY part of the search term is in any relevant field
            const matchesSearch = searchTerm === '' ||
                itemName.includes(searchTerm) ||
                itemId.includes(searchTerm) ||
                itemType.includes(searchTerm) ||
                itemCollectionType.includes(searchTerm) ||
                itemDesc.includes(searchTerm) ||
                itemIcon.includes(searchTerm);

            return matchesRareType && matchesItemType && matchesCollectionType && matchesSearch;
        });

        console.log(`DEBUG: Filtered items count after search/filter: ${filteredItems.length}`);
        currentPage = 1; // Reset to first page after filtering/searching
        renderItems(filteredItems);
    }

    // Open item details modal
    function openModal(item) {
        modalItemImage.src = `https://free-fire-items.vercel.app/item-image?id=${item.Id}&key=NRCODEX`;
        modalItemName.textContent = item.name || 'N/A';
        modalItemId.textContent = item.Id || 'N/A';
        modalItemType.textContent = item.Type || 'N/A';
        modalItemCollection.textContent = item.collectionType || 'N/A';
        modalItemRarity.textContent = item.Rare || 'N/A';

        // Dynamic styling for rarity text in modal
        const itemRarityNormalized = (item.Rare || 'NONE').toString().toUpperCase().replace(/\s/g, '_').replace(/\+/g, '_Plus');
        const rarityBackgroundColor = rarityColorMap[itemRarityNormalized] || rarityColorMap['NONE']; // Fallback
        modalItemRarity.style.backgroundColor = rarityBackgroundColor;
        // Adjust text color based on background luminance for better contrast
        modalItemRarity.style.color = (['WHITE', 'CARD'].includes(itemRarityNormalized)) ? '#333' : 'white'; // Make text dark for light backgrounds


        modalItemUnique.textContent = item.IsUnique ? 'Yes' : 'No';
        modalItemIcon.textContent = item.Icon || 'N/A';
        modalItemDescription.textContent = item.desc || 'No description available.';

        modalOverlay.classList.add('active');
    }

    // Close item details modal
    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    // Event Listeners
    homeIcon.addEventListener('click', resetAllFiltersAndSearch); // Home icon click listener
    searchInput.addEventListener('input', applyFiltersAndSearch);
    rareTypeFilter.addEventListener('change', applyFiltersAndSearch);
    itemTypeFilter.addEventListener('change', applyFiltersAndSearch);
    collectionTypeFilter.addEventListener('change', applyFiltersAndSearch);

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderItems(filteredItems);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderItems(filteredItems);
        }
    });

    pageNumbersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-number')) {
            const page = parseInt(e.target.dataset.page);
            if (page !== currentPage) {
                currentPage = page;
                renderItems(filteredItems);
            }
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) { // Close only if click is directly on overlay, not modal content
            closeModal();
        }
    });

    // Initial fetch and render
    fetchItems();
});