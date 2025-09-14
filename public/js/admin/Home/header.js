// public/js/admin-layout.js
document.addEventListener('DOMContentLoaded', function () {
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const btnClose = document.getElementById('btn-close-sidebar');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const body = document.body;
  const themeBtn = document.getElementById('btn-theme-toggle');

  /* ---------------- Sidebar ---------------- */

  // Restore collapsed state (desktop)
  if (localStorage.getItem('sidebar-collapsed') === 'true') {
    body.classList.add('sidebar-collapsed');
  }

  // Toggle handler
  btnToggle?.addEventListener('click', () => {
    if (window.innerWidth < 992) {
      // mobile: show overlay and slide-in
      sidebar.classList.add('open');
      overlay.classList.add('show');
      document.documentElement.style.overflow = 'hidden';
      btnToggle.setAttribute('aria-expanded', 'true');
    } else {
      // desktop: collapse to mini sidebar
      body.classList.toggle('sidebar-collapsed');
      const collapsed = body.classList.contains('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', collapsed ? 'true' : 'false');
    }
  });

  // Close sidebar on overlay or close button
  const closeSidebarMobile = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.documentElement.style.overflow = '';
    btnToggle.setAttribute('aria-expanded', 'false');
  };

  overlay?.addEventListener('click', closeSidebarMobile);
  btnClose?.addEventListener('click', closeSidebarMobile);

  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebarMobile();
  });

  /* ---------------- Dark Mode ---------------- */
  if (localStorage.getItem('site-theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeBtn) themeBtn.innerHTML = '<i class="ri-moon-line fs-5"></i>';
  }

  themeBtn?.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');

    if (isDark) {
      themeBtn.innerHTML = '<i class="ri-moon-line fs-5"></i>';
      localStorage.setItem('site-theme', 'dark');
    } else {
      themeBtn.innerHTML = '<i class="ri-sun-line fs-5"></i>';
      localStorage.setItem('site-theme', 'light');
    }
  });

  /* ---------------- Active Nav Highlight ---------------- */
  (function highlightByPath(){
    try {
      const path = window.location.pathname.toLowerCase();
      const links = document.querySelectorAll('#app-sidebar [data-path]');
      links.forEach(l => {
        const p = (l.getAttribute('data-path') || '').toLowerCase();
        if (!p) return;
        if (path === p || path.startsWith(p)) {
          document.querySelectorAll('#app-sidebar .nav-link.active').forEach(n => n.classList.remove('active'));
          l.classList.add('active');
          const parentCollapse = l.closest('.collapse');
          if (parentCollapse) {
            bootstrap.Collapse.getOrCreateInstance(parentCollapse, {toggle: false}).show();
          }
        }
      });
    } catch(e){ /* ignore */ }
  })();
});

document.addEventListener("DOMContentLoaded", () => {
  const dropdownToggles = document.querySelectorAll('[data-bs-toggle="collapse"]');

  dropdownToggles.forEach(toggle => {
    const target = document.querySelector(toggle.getAttribute("href"));
    const arrow = toggle.querySelector(".dropdown-arrow");

    if (target && arrow) {
      target.addEventListener("show.bs.collapse", () => {
        arrow.classList.add("rotate");
      });
      target.addEventListener("hide.bs.collapse", () => {
        arrow.classList.remove("rotate");
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("auth") === "success") {
    Swal.fire({
      icon: "success",
      title: "Verification Completed!",
      timer: 1500,
      showConfirmButton: false
    });
  }
});
