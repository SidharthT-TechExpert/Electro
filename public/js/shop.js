  // Set selected values for price dropdowns
document.getElementById('minPriceSelect').value = '<%= minPrice || 0 %>';
document.getElementById('maxPriceSelect').value = '<%= maxPrice || 100000 %>';

    // AJAX Filtering
    function applyFilters() {
      const search = document.getElementById('searchInput').value;
      const minPrice = document.getElementById('minPriceSelect').value;
      const maxPrice = document.getElementById('maxPriceSelect').value;
      const selectedCategory = document.querySelector('.category-filter.active')?.dataset.id || '';
      const selectedBrand = document.querySelector('.brand-filter.active')?.dataset._id || '';

      const query = new URLSearchParams({
        search,
        minPrice,
        maxPrice,
        category: selectedCategory,
        brand: selectedBrand
      });

      window.location.href = '/shop?' + query.toString();
    }

    // Category click
    document.querySelectorAll('.category-filter').forEach(el => el.addEventListener('click', function (e) {
      e.preventDefault();
      const isActive = this.classList.contains('active');
      document.querySelectorAll('.category-filter').forEach(c => c.classList.remove('active'));
      if (!isActive) this.classList.add('active');
      applyFilters();
    }));

    // Brand click with toggle/unselect
    document.querySelectorAll('.brand-filter').forEach(el => el.addEventListener('click', function (e) {
      e.preventDefault();
      const isActive = this.classList.contains('active');
      document.querySelectorAll('.brand-filter').forEach(b => b.classList.remove('active'));
      if (!isActive) this.classList.add('active');
      applyFilters();
    }));

    // Search enter key
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') applyFilters();
    });
