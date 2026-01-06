/* ============================================
   SwirleePop - Product Page JavaScript
   Dynamically loads product data from JSON
   ============================================ */

(function() {
    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Track current image index for gallery navigation
    let currentImageIndex = 0;
    let productImages = [];

    // Load products data
    async function loadProduct() {
        try {
            const response = await fetch('../data/products.json');
            const data = await response.json();
            
            // Find the product by ID
            const product = data.products.find(p => p.id === productId);
            
            if (product) {
                renderProduct(product);
                renderRelatedProducts(data.products, productId);
            } else {
                showNotFound();
            }
        } catch (error) {
            console.error('Error loading product:', error);
            showNotFound();
        }
    }

    // Render product data to the page
    function renderProduct(product) {
        // Update page title
        document.title = `${product.name} | SwirleePop™`;

        // Update breadcrumb
        const breadcrumbCategory = document.getElementById('breadcrumb-category');
        breadcrumbCategory.textContent = product.category;
        breadcrumbCategory.href = product.categoryPage;
        document.getElementById('breadcrumb-product').textContent = product.name.split(' ').slice(0, 3).join(' ') + '...';

        // Update product info
        document.getElementById('productCategory').textContent = product.category;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productSubtitle').textContent = product.subtitle;

        // Update description
        const descriptionEl = document.getElementById('productDescription');
        descriptionEl.innerHTML = product.description.map(p => `<p>${p}</p>`).join('');

        // Update features
        const featuresEl = document.getElementById('productFeatures');
        featuresEl.innerHTML = product.features.map(feature => `
            <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                ${feature}
            </li>
        `).join('');

        // Update Amazon link
        document.getElementById('amazonLink').href = product.amazonUrl;

        // Setup image gallery
        productImages = product.images;
        setupGallery(product.images);
    }

    // Setup image gallery with thumbnails and navigation
    function setupGallery(images) {
        const mainImage = document.getElementById('mainImage');
        const thumbsContainer = document.getElementById('galleryThumbs');
        const galleryNav = document.getElementById('galleryNav');

        // Set main image
        mainImage.src = `../content/${images[0]}`;
        mainImage.alt = 'Product Image';

        // Create thumbnails
        thumbsContainer.innerHTML = images.map((img, index) => `
            <button class="thumb ${index === 0 ? 'active' : ''}" data-index="${index}" data-image="../content/${img}">
                <img src="../content/${img}" alt="View ${index + 1}">
            </button>
        `).join('');

        // Show navigation arrows if more than one image
        if (images.length > 1) {
            galleryNav.style.display = 'flex';
        }

        // Add click listeners to thumbnails
        thumbsContainer.querySelectorAll('.thumb').forEach(thumb => {
            thumb.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                setActiveImage(index);
            });
        });

        // Add arrow navigation listeners
        document.getElementById('prevImage').addEventListener('click', () => {
            const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
            setActiveImage(newIndex);
        });

        document.getElementById('nextImage').addEventListener('click', () => {
            const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
            setActiveImage(newIndex);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
                setActiveImage(newIndex);
            } else if (e.key === 'ArrowRight') {
                const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
                setActiveImage(newIndex);
            }
        });
    }

    // Set active image by index
    function setActiveImage(index) {
        currentImageIndex = index;
        const mainImage = document.getElementById('mainImage');
        mainImage.src = `../content/${productImages[index]}`;

        // Update thumbnail active states
        document.querySelectorAll('.thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    // Render related products (excluding current product)
    function renderRelatedProducts(products, currentId) {
        const relatedEl = document.getElementById('relatedProducts');
        const relatedProducts = products.filter(p => p.id !== currentId).slice(0, 2);

        relatedEl.innerHTML = relatedProducts.map(product => `
            <article class="product-card">
                <a href="product.html?id=${product.id}" class="product-image-link">
                    <div class="product-image">
                        <img src="../content/${product.images[0]}" alt="${product.name}">
                    </div>
                </a>
                <div class="product-info">
                    <h3><a href="product.html?id=${product.id}">${product.name.split(' ').slice(0, 4).join(' ')}...</a></h3>
                    <a href="${product.amazonUrl}" class="btn-amazon-small" target="_blank" rel="noopener">Buy on Amazon</a>
                </div>
            </article>
        `).join('');
    }

    // Show not found message
    function showNotFound() {
        document.querySelector('.product-detail .container').innerHTML = `
            <div class="empty-state" style="padding: 4rem 0;">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 64px; height: 64px; margin: 0 auto 1.5rem;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
                <h3>Product Not Found</h3>
                <p>Sorry, we couldn't find that product. It may have been removed or the link is incorrect.</p>
                <a href="../index.html" style="display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: var(--brand-teal); color: white; border-radius: 8px; font-weight: 600;">Back to Home</a>
            </div>
        `;
        document.querySelector('.related-products').style.display = 'none';
    }

    // Initialize
    if (productId) {
        loadProduct();
    } else {
        showNotFound();
    }
})();