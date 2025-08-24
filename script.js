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
    const homeIcon = document.getElementById('homeIcon');

    let allItems = [];
    let filteredItems = [];
    let currentPage = 1;
    const itemsPerPage = 40; // 5x8 grid

    // Function to map rarity to background image filename
    const getRarityBackground = (rarity) => {
        let normalizedRarity = (rarity || 'NONE').toString().toUpperCase().trim();
        normalizedRarity = normalizedRarity.replace(/\s/g, '_');
        normalizedRarity = normalizedRarity.replace(/\+/g, '_Plus');

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
        };

        const filename = rarityMap[normalizedRarity] || 'none.png';
        const path = `background/${filename}`;
        return path;
    };

    // Rarity colors for modal display
    const rarityColorMap = {
        'NONE': '#888888',
        'WHITE': '#CCCCCC',
        'GREEN': '#38b000',
        'BLUE': '#007bff',
        'PURPLE': '#800080',
        'ORANGE': '#ff9900',
        'CARD': '#cccccc',
        'RED': '#dc3545',
        'PURPLE_PLUS': '#bf00bf',
        'ORANGE_PLUS': '#cc7a00',
        'RED_PLUS': '#b22222'
    };

    // Fetch data from main.json
    async function fetchItems() {
        itemGrid.innerHTML = '<div class="loading-placeholder" style="grid-column: 1 / -1;">Loading Items...</div>';

        try {
            const response = await fetch('main.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('main.json must be an array of objects.');
            }

            allItems = data;
            filteredItems = [...allItems];
            populateFilters();
            applyFiltersAndSearch();

        } catch (error) {
            console.error('ERROR fetching main.json:', error);
            itemGrid.innerHTML = `
                <div class="loading-placeholder" style="color: red; grid-column: 1 / -1;">
                    Failed to load main.json
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

        rareTypeFilter.innerHTML = '<option value="ALL">ALL</option>';
        itemTypeFilter.innerHTML = '<option value="ALL">ALL</option>';
        collectionTypeFilter.innerHTML = '<option value="ALL">ALL</option>';

        Array.from(uniqueRareTypes).sort().forEach(type => {
            rareTypeFilter.innerHTML += `<option value="${type}">${type}</option>`;
        });

        Array.from(uniqueItemTypes).sort().forEach(type => {
            itemTypeFilter.innerHTML += `<option value="${type}">${type}</option>`;
        });

        Array.from(uniqueCollectionTypes).sort().forEach(type => {
            collectionTypeFilter.innerHTML += `<option value="${type}">${type}</option>`;
        });
    }

    // Render items
    function renderItems(itemsToDisplay) {
        itemGrid.innerHTML = '';
        const totalPages = Math.ceil(itemsToDisplay.length / itemsPerPage);

        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsForCurrentPage = itemsToDisplay.slice(startIndex, endIndex);

        if (itemsForCurrentPage.length === 0 && itemsToDisplay.length > 0) {
            currentPage = 1;
            renderItems(itemsToDisplay);
            return;
        }

        if (itemsForCurrentPage.length === 0) {
            itemGrid.innerHTML = '<div class="loading-placeholder" style="grid-column: 1 / -1;">No items found.</div>';
            updatePaginationControls(0);
            return;
        }

        itemsForCurrentPage.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.dataset.itemId = item.Id;

            const rarityBgUrl = getRarityBackground(item.Rare);
            itemCard.style.setProperty('--bg-image', `url('${rarityBgUrl}')`);
            
            // ✅ FIXED: Removed extra "}" in URL
            const imageUrl = `https://ff-items-icon-info.vercel.app/item-image?id=${item.Id}&key=NRCODEX`;

            const displayName = item.name || item.Icon || 'Unknown'; 

            itemCard.innerHTML = `
                <img src="${imageUrl}" alt="${displayName}">
                <h3>${displayName}</h3>
                <div class="watermark">NR-CODEX</div>
            `;

            const imgElement = itemCard.querySelector('img');
            imgElement.onerror = () => {
                console.warn(`Image not found for item ID: ${item.Id}`);
            };

            itemCard.addEventListener('click', () => openModal(item));
            itemGrid.appendChild(itemCard);
        });

        updatePaginationControls(itemsToDisplay.length);
    }

    // Pagination
    function updatePaginationControls(totalItemsCount) {
        const totalPages = Math.ceil(totalItemsCount / itemsPerPage);
        pageNumbersContainer.innerHTML = '';

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

        if (startPage > 1) {
            pageNumbersContainer.innerHTML += `<span class="page-number" data-page="1">1</span>`;
            if (startPage > 2) {
                pageNumbersContainer.innerHTML += `<span class="page-number-dots">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageNumberSpan = document.createElement('span');
            pageNumberSpan.classList.add('page-number');
            if (i === currentPage) pageNumberSpan.classList.add('active');
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

    // Apply filters and search
    function applyFiltersAndSearch() {
        const selectedRareType = rareTypeFilter.value.toUpperCase();
        const selectedItemType = itemTypeFilter.value.toUpperCase();
        const selectedCollectionType = collectionTypeFilter.value.toUpperCase();
        const searchTerm = searchInput.value.toLowerCase().trim();

        filteredItems = allItems.filter(item => {
            const itemRare = (item.Rare || 'NONE').toString().toUpperCase();
            const itemType = (item.Type || 'NONE').toString().toUpperCase();
            const itemCollectionType = (item.collectionType || 'NONE').toString().toUpperCase();
            const itemName = (item.name || '').toLowerCase();
            const itemId = String(item.Id || '').toLowerCase();
            const itemDesc = (item.desc || '').toLowerCase();
            const itemIcon = (item.Icon || '').toLowerCase();

            const matchesRareType = selectedRareType === 'ALL' || itemRare === selectedRareType;
            const matchesItemType = selectedItemType === 'ALL' || itemType === selectedItemType;
            const matchesCollectionType = selectedCollectionType === 'ALL' || itemCollectionType === selectedCollectionType;

            const matchesSearch = searchTerm === '' ||
                itemName.includes(searchTerm) ||
                itemId.includes(searchTerm) ||
                itemType.includes(searchTerm) ||
                itemCollectionType.includes(searchTerm) ||
                itemDesc.includes(searchTerm) ||
                itemIcon.includes(searchTerm);

            return matchesRareType && matchesItemType && matchesCollectionType && matchesSearch;
        });

        currentPage = 1;
        renderItems(filteredItems);
    }

    // Open modal
    function openModal(item) {
        // ✅ FIXED: same issue here, removed extra "}"
        modalItemImage.src = `https://ff-items-icon-info.vercel.app/item-image?id=${item.Id}&key=NRCODEX`;
        modalItemName.textContent = item.name || 'N/A';
        modalItemId.textContent = item.Id || 'N/A';
        modalItemType.textContent = item.Type || 'N/A';
        modalItemCollection.textContent = item.collectionType || 'N/A';
        modalItemRarity.textContent = item.Rare || 'N/A';

        const rarityNormalized = (item.Rare || 'NONE').toUpperCase().replace(/\s/g, '_').replace(/\+/g, '_Plus');
        modalItemRarity.style.backgroundColor = rarityColorMap[rarityNormalized] || rarityColorMap['NONE'];
        modalItemRarity.style.color = (['WHITE', 'CARD'].includes(rarityNormalized)) ? '#333' : 'white';

        modalItemUnique.textContent = item.IsUnique ? 'Yes' : 'No';
        modalItemIcon.textContent = item.Icon || 'N/A';
        modalItemDescription.textContent = item.desc || 'No description available.';

        modalOverlay.classList.add('active');
    }

    // Close modal
    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    // Event Listeners
    homeIcon.addEventListener('click', () => {
        searchInput.value = '';
        rareTypeFilter.value = 'ALL';
        itemTypeFilter.value = 'ALL';
        collectionTypeFilter.value = 'ALL';
        applyFiltersAndSearch();
    });
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
        if (e.target === modalOverlay) closeModal();
    });

    // Init
    fetchItems();
});
