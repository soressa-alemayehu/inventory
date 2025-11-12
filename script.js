// script.js - shared behaviors for index.html, inventory.html, sales.html, suppliers.html
// - Highlights active nav link based on current page
// - Initializes Dashboard chart if present
// - Renders Inventory product table & recent activity when on inventory.html
// - Renders Sales orders table, sales chart and recent activity when on sales.html
// - Renders Suppliers table, pie chart and top-suppliers list when on suppliers.html
// - All data is front-end sample data for now (no API calls)




document.addEventListener('DOMContentLoaded', async () => {
  // --- Load header into placeholder ---
  const headerContainer = document.getElementById('header');
  if (headerContainer) {
    try {
      const response = await fetch('header.html');
      const html = await response.text();
      headerContainer.innerHTML = html;
    } catch (error) {
      console.error('Error loading header:', error);
    }
  }
  
  // --- nav active highlight (based on href / pathname) ---
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const current = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    // mark active link
    if (href === current || (href === 'index.html' && current === '')) {
      link.classList.add('active');
    }
  });

  // Utility
  function escapeHtml(s=''){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ---------------------
  // DASHBOARD (index.html)
  // ---------------------
  const stockCanvas = document.getElementById('stockChart');
  if (stockCanvas) {
    const ctx = stockCanvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [
          { label: 'Stock Out', data: [2000,3000,2500,3800,1200,2800,4200,5100,3600,4200,2300,1800], backgroundColor: 'rgba(123,97,255,0.85)', stack: 'Stack 0' },
          { label: 'Stock In',  data: [4000,11000,16000,17000,8000,9000,11000,16000,14000,12000,15000,10500], backgroundColor: 'rgba(58,160,255,0.95)', stack: 'Stack 0' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, grid: { color: '#f0f3f7' }, ticks: { callback: v => v >= 1000 ? (v/1000)+'k' : v } }
        }
      }
    });

    // populate right-rail fast-moving items if present
    const fastItems = [
      { name: 'Macbook Pro', icon: 'fa-laptop' },
      { name: 'iPhone 14 pro', icon: 'fa-mobile-screen-button' },
      { name: 'Zoom75', icon: 'fa-camera' },
      { name: 'Airpods Pro', icon: 'fa-headphones' }
    ];
    const fmList = document.getElementById('fastMovingList');
    if (fmList) {
      fmList.innerHTML = '';
      fastItems.forEach(it => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="product-icon"><i class="fa-solid ${it.icon}"></i></span> ${escapeHtml(it.name)}`;
        fmList.appendChild(li);
      });
    }

    window.addEventListener('resize', () => chart.resize());
  }

  // -----------------------
  // INVENTORY (inventory.html)
  // -----------------------
  const productTbody = document.getElementById('productTbody');
  if (productTbody) {
    const PRODUCTS = [
      { id: 1, name: 'Macbook Pro', code: '#0001', type: 'Laptop', price: '$1,241', qty: 44, image: 'https://via.placeholder.com/80x60?text=MBP' },
      { id: 2, name: 'iPhone 14 pro', code: '#0002', type: 'Phone', price: '$1,499', qty: 23, image: 'https://via.placeholder.com/80x60?text=iPhone' },
      { id: 3, name: 'Zoom75', code: '#0003', type: 'Keyboard', price: '$215', qty: 23, image: 'https://via.placeholder.com/80x60?text=Zoom75' },
      { id: 4, name: 'Airpods Pro', code: '#0004', type: 'Earphones', price: '$249', qty: 23, image: 'https://via.placeholder.com/80x60?text=Airpods' },
      { id: 5, name: 'Samsung Galaxy Fold', code: '#0005', type: 'Phone', price: '$1,199', qty: 23, image: 'https://via.placeholder.com/80x60?text=Fold' },
      { id: 6, name: 'Samsung Odyssey', code: '#0006', type: 'Displays', price: '$500', qty: 23, image: 'https://via.placeholder.com/80x60?text=Odyssey' },
      { id: 7, name: 'Logitech Superlight', code: '#0007', type: 'Mouse', price: '$150', qty: 28, image: 'https://via.placeholder.com/80x60?text=Mouse' },
      { id: 8, name: 'Dell Monitor', code: '#0008', type: 'Displays', price: '$350', qty: 15, image: 'https://via.placeholder.com/80x60?text=Dell' }
    ];

    const RECENT = [
      { text: 'Restocked 6 Products', detail: 'Macbook Pro • 1m ago', thumb: 'https://via.placeholder.com/60?text=MBP' },
      { text: 'Sold 2 Products', detail: 'iPhone 14 pro • 12m ago', thumb: 'https://via.placeholder.com/60?text=Phone' },
      { text: 'Sold 1 Product', detail: 'Zoom75 • 23m ago', thumb: 'https://via.placeholder.com/60?text=Zoom' },
      { text: 'Restocked 12 Product', detail: 'Zoom75 • 42m ago', thumb: 'https://via.placeholder.com/60?text=Zoom' }
    ];

    // inventory state
    const PER_PAGE = 6;
    let currentPage = 1;
    let currentFilter = '';

    const inventorySearch = document.getElementById('inventorySearch');
    const pagination = document.getElementById('pagination');
    const selectAll = document.getElementById('selectAll');

    function filteredProducts() {
      if (!currentFilter) return PRODUCTS.slice();
      const f = currentFilter.toLowerCase();
      return PRODUCTS.filter(p => p.name.toLowerCase().includes(f) || p.code.toLowerCase().includes(f) || p.type.toLowerCase().includes(f));
    }

    function renderProducts(page = 1) {
      currentPage = page;
      const list = filteredProducts();
      const total = list.length;
      const pages = Math.max(1, Math.ceil(total / PER_PAGE));
      const start = (page - 1) * PER_PAGE;
      const pageItems = list.slice(start, start + PER_PAGE);

      productTbody.innerHTML = '';
      pageItems.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-check"><input class="row-check" type="checkbox" data-id="${p.id}" /></td>
          <td>
            <div class="product-name">
              <img class="product-thumb" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" />
              <div>
                <div style="font-weight:600">${escapeHtml(p.name)}</div>
                <div class="product-code">${escapeHtml(p.code)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(p.code)}</td>
          <td>${escapeHtml(p.type)}</td>
          <td class="product-price">${escapeHtml(p.price)}</td>
          <td>${escapeHtml(String(p.qty))}</td>
          <td><img src="${escapeHtml(p.image)}" alt="" style="width:56px;height:40px;border-radius:6px;object-fit:cover" /></td>
        `;
        productTbody.appendChild(tr);
      });

      // pagination
      pagination.innerHTML = '';
      for (let i=1;i<=pages;i++){
        const btn = document.createElement('button');
        btn.textContent = String(i);
        if (i === page) btn.classList.add('active');
        btn.addEventListener('click', () => renderProducts(i));
        pagination.appendChild(btn);
      }

      if (selectAll) selectAll.checked = false;
    }

    if (inventorySearch) {
      inventorySearch.addEventListener('input', (e) => {
        currentFilter = e.target.value.trim();
        renderProducts(1);
      });
    }

    if (selectAll) {
      selectAll.addEventListener('change', (e) => {
        const checked = e.target.checked;
        Array.from(document.querySelectorAll('.row-check')).forEach(c => c.checked = checked);
      });
    }

    // render recent activity
    const recentUl = document.getElementById('recentActivity');
    if (recentUl) {
      recentUl.innerHTML = '';
      RECENT.forEach(it => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${escapeHtml(it.thumb)}" alt="" /><div><div style="font-weight:600">${escapeHtml(it.text)}</div><div style="color:var(--muted);font-size:13px">${escapeHtml(it.detail)}</div></div>`;
        recentUl.appendChild(li);
      });
    }

    // global search (top-right) applies to inventory page if used there
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const invSearch = document.getElementById('inventorySearch');
        if (invSearch) {
          invSearch.value = val;
          currentFilter = val;
          renderProducts(1);
        }
      });
    }

    // initial render
    renderProducts(1);
  }

  // -----------------------
  // SALES (sales.html)
  // -----------------------
  const salesTbody = document.getElementById('salesTbody');
  if (salesTbody) {
    const SALES = [
      { id:1, product:'Macbook Pro', code:'#0001', category:'Laptop', quantity:1, total:'$1,241' },
      { id:2, product:'iPhone 14 pro', code:'#0002', category:'Phone', quantity:2, total:'$2,998' },
      { id:3, product:'Zoom75', code:'#0003', category:'Keyboard', quantity:3, total:'$645' },
      { id:4, product:'Airpods Pro', code:'#0004', category:'Earphones', quantity:1, total:'$249' },
      { id:5, product:'Samsung Galaxy Fold', code:'#0005', category:'Phone', quantity:1, total:'$1,199' },
      { id:6, product:'Logitech Superlight', code:'#0007', category:'Mouse', quantity:2, total:'$300' },
      { id:7, product:'Dell Monitor', code:'#0008', category:'Displays', quantity:1, total:'$350' },
      { id:8, product:'Accessory Kit', code:'#0009', category:'Accessory', quantity:5, total:'$125' }
    ];

    const RECENT_SALES = [
      { text: 'Ordered 11 Products', actor: 'Grace Moreta', time: '1 m ago' },
      { text: 'Ordered 24 Products', actor: 'Allison Siphron', time: '12 m ago' },
      { text: 'Ordered 4 Products', actor: 'Makenna Doman', time: '23 m ago' },
      { text: 'Ordered 24 Products', actor: 'Makenna Doman', time: '42 m ago' },
      { text: 'Ordered 16 Products', actor: 'Ahmad Vetrovs', time: '2 h ago' }
    ];

    // sales pagination
    const PER_PAGE = 6;
    let currentPage = 1;
    const salesPagination = document.getElementById('salesPagination');

    function renderSales(page = 1) {
      currentPage = page;
      salesTbody.innerHTML = '';
      const start = (page - 1) * PER_PAGE;
      const rows = SALES.slice(start, start + PER_PAGE);
      rows.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-check"><input type="checkbox" data-id="${s.id}" /></td>
          <td>${escapeHtml(s.product)}</td>
          <td>${escapeHtml(s.code)}</td>
          <td>${escapeHtml(s.category)}</td>
          <td>${escapeHtml(String(s.quantity))}</td>
          <td>${escapeHtml(s.total)}</td>
          <td style="color:var(--blue);font-weight:600">View Invoice</td>
        `;
        salesTbody.appendChild(tr);
      });

      // pagination buttons
      salesPagination.innerHTML = '';
      const pages = Math.max(1, Math.ceil(SALES.length / PER_PAGE));
      for (let i=1;i<=pages;i++){
        const btn = document.createElement('button');
        btn.textContent = String(i);
        if (i === page) btn.classList.add('active');
        btn.addEventListener('click', ()=> renderSales(i));
        salesPagination.appendChild(btn);
      }
    }

    // render recent activity in right rail
    const recentContainer = document.getElementById('salesRecentActivity');
    if (recentContainer) {
      recentContainer.innerHTML = '';
      RECENT_SALES.forEach(it => {
        const li = document.createElement('li');
        li.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><span class="product-icon" style="width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3aa0ff,#7b61ff);color:#fff"><i class="fa-solid fa-user"></i></span><div><div style="font-weight:600">${escapeHtml(it.text)}</div><div style="color:var(--muted);font-size:13px">${escapeHtml(it.actor)} • ${escapeHtml(it.time)}</div></div></div>`;
        recentContainer.appendChild(li);
      });
    }

    // sales chart (line)
    const salesCanvas = document.getElementById('salesChart');
    if (salesCanvas) {
      const ctx = salesCanvas.getContext('2d');
      const salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [
            { label: 'Direct Sales', data: [8000,12000,9000,15000,8000,11000,14000,9000,16000,10000,20000,22000], borderColor: 'rgba(58,160,255,1)', backgroundColor: 'rgba(58,160,255,0.06)', tension:0.32, pointRadius:3 },
            { label: 'Retail', data: [5000,8000,7000,9000,6500,7000,8000,6000,12000,8000,9000,10000], borderColor: 'rgba(123,97,255,1)', backgroundColor: 'rgba(123,97,255,0.06)', tension:0.32, pointRadius:3 },
            { label: 'Wholesale', data: [6000,6500,7000,8000,7200,6800,7500,14000,11000,9500,12000,15000], borderColor: 'rgba(219,50,111,1)', backgroundColor: 'rgba(219,50,111,0.06)', tension:0.32, pointRadius:3 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'top' } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f0f3f7' }, ticks: { callback: v => v >= 1000 ? (v/1000)+'k' : v } }
          }
        }
      });

      window.addEventListener('resize', ()=> salesChart.resize());
    }

    // wire search box for sales filter (client-side)
    const salesSearch = document.getElementById('salesSearch');
    if (salesSearch) {
      salesSearch.addEventListener('input', (e) => {
        const q = (e.target.value || '').toLowerCase().trim();
        const filtered = SALES.filter(s => s.product.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
        // render filtered without pagination (or you can implement paged filter)
        salesTbody.innerHTML = '';
        filtered.slice(0, 50).forEach(s => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="col-check"><input type="checkbox" data-id="${s.id}" /></td>
            <td>${escapeHtml(s.product)}</td>
            <td>${escapeHtml(s.code)}</td>
            <td>${escapeHtml(s.category)}</td>
            <td>${escapeHtml(String(s.quantity))}</td>
            <td>${escapeHtml(s.total)}</td>
            <td style="color:var(--blue);font-weight:600">View Invoice</td>
          `;
          salesTbody.appendChild(tr);
        });
        // reset pagination to show pages for filtered results
        const salesPagination = document.getElementById('salesPagination');
        if (salesPagination) salesPagination.innerHTML = '';
      });
    }

    // initial render
    renderSales(1);
  }

  // ------------------------
  // SUPPLIERS (suppliers.html)
  // ------------------------
  const suppliersTbody = document.getElementById('suppliersTbody');
  if (suppliersTbody) {
    const SUPPLIERS = [
      { id:1, name:'Apple', email:'apple@gmail.com', phone:'+63 123 4243', logo:'https://via.placeholder.com/40?text=A' , share: 61},
      { id:2, name:'Samsung', email:'samsung@gmail.com', phone:'+63 133 3453', logo:'https://via.placeholder.com/40?text=S', share: 15},
      { id:3, name:'Mugna Tech', email:'logitech@gmail.com', phone:'+63 433 4451', logo:'https://via.placeholder.com/40?text=M', share: 11},
      { id:4, name:'Logitech', email:'xiao.mi@gmail.com', phone:'+63 433 4531', logo:'https://via.placeholder.com/40?text=L', share: 5},
      { id:5, name:'Asus', email:'asus@gmail.com', phone:'+63 234 6457', logo:'https://via.placeholder.com/40?text=AS', share: 4},
      { id:6, name:'Lian Li', email:'microsoft@gmail.com', phone:'+63 546 8345', logo:'https://via.placeholder.com/40?text=LL', share: 2},
      { id:7, name:'NZXT', email:'hello@mugna.tech', phone:'+63 917 1033 599', logo:'https://via.placeholder.com/40?text=N', share: 1},
      { id:8, name:'Xiaomi', email:'lianli@gmail.com', phone:'+63 123 3345', logo:'https://via.placeholder.com/40?text=X', share: 1},
      { id:9, name:'Microsoft', email:'akko@gmail.com', phone:'+63 334 5673', logo:'https://via.placeholder.com/40?text=MS', share: 0},
      { id:10, name:'Sony', email:'intel@gmail.com', phone:'+63 986 7465', logo:'https://via.placeholder.com/40?text=SY', share: 0},
      { id:11, name:'Dell', email:'nvidia@gmail.com', phone:'+63 461 4677', logo:'https://via.placeholder.com/40?text=D', share: 0}
    ];

    // suppliers pagination & state
    const PER_PAGE_SUP = 8;
    let currentSupPage = 1;
    let currentSupFilter = '';

    const suppliersPagination = document.getElementById('suppliersPagination');
    const suppliersSearch = document.getElementById('suppliersSearch');

    function filteredSuppliers() {
      if (!currentSupFilter) return SUPPLIERS.slice();
      const f = currentSupFilter.toLowerCase();
      return SUPPLIERS.filter(s => s.name.toLowerCase().includes(f) || (s.email||'').toLowerCase().includes(f) || (s.phone||'').toLowerCase().includes(f));
    }

    function renderSuppliers(page = 1) {
      currentSupPage = page;
      const list = filteredSuppliers();
      const pages = Math.max(1, Math.ceil(list.length / PER_PAGE_SUP));
      const start = (page - 1) * PER_PAGE_SUP;
      const pageItems = list.slice(start, start + PER_PAGE_SUP);

      suppliersTbody.innerHTML = '';
      pageItems.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-check"><input type="checkbox" data-id="${s.id}" /></td>
          <td>
            <div style="display:flex;align-items:center;gap:12px">
              <img src="${escapeHtml(s.logo)}" alt="${escapeHtml(s.name)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" />
              <div style="font-weight:600">${escapeHtml(s.name)}</div>
            </div>
          </td>
          <td>${escapeHtml(s.email)}</td>
          <td>${escapeHtml(s.phone)}</td>
          <td style="color:var(--blue);font-weight:600">Order History</td>
        `;
        suppliersTbody.appendChild(tr);
      });

      // pagination buttons
      suppliersPagination.innerHTML = '';
      for (let i=1;i<=pages;i++){
        const btn = document.createElement('button');
        btn.textContent = String(i);
        if (i === page) btn.classList.add('active');
        btn.addEventListener('click', ()=> renderSuppliers(i));
        suppliersPagination.appendChild(btn);
      }
    }

    if (suppliersSearch) {
      suppliersSearch.addEventListener('input', (e) => {
        currentSupFilter = e.target.value.trim();
        renderSuppliers(1);
      });
    }

    // render top suppliers pie and list
    const suppliersPieCanvas = document.getElementById('suppliersPie');
    if (suppliersPieCanvas) {
      const ctx = suppliersPieCanvas.getContext('2d');
      // derive top 4 shares
      const top = SUPPLIERS.slice().sort((a,b)=>b.share-a.share).slice(0,4);
      const labels = top.map(t=>t.name);
      const data = top.map(t=>t.share);
      const colors = ['#3aa0ff','#ef3b83','#59c24a','#7b61ff'];
      const pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data, backgroundColor: colors }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });

      // populate top supplier list
      const topList = document.getElementById('topSuppliersList');
      if (topList) {
        topList.innerHTML = '';
        top.forEach((t, idx) => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.padding = '6px 0';
          li.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colors[idx]};margin-right:8px"></span><div>${escapeHtml(t.name)}</div></div><div style="font-weight:700;color:${colors[idx]}">${t.share}%</div>`;
          topList.appendChild(li);
        });
      }

      window.addEventListener('resize', ()=> pie.resize());
    }

    // initial render
    renderSuppliers(1);
  }

  // end DOMContentLoaded
});