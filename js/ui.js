// --- RICH TEXT & EMOJI UTILS ---
const EMOJI_LIST = [
    '📢', '🔥', '✨', '🎉', '⚠️', '🚨', '✅', '❌', '🟢', '🔴', 
    '📅', '🕒', '📌', '📍', '💡', '🚚', '📦', '🎁', '🏷️', '🛒',
    '💬', '📞', '📧', '🏠', '🏢', '🛠️', '🔧', '⚙️', '📈', '💰',
    '❤️', '👍', '⭐', '🌟', '🆕', '🆓', '🆔', '👉', '➡️', '🛑'
];

let tempConfig = {}; // Important for Admin

function execCmd(command, value = null) {
    document.execCommand(command, false, value);
}

function insertEmoji(idx, char, type = 'text') {
    const editorId = type === 'badge' ? `badge-edit-${idx}` : `news-edit-${idx}`;
    const pickerId = type === 'badge' ? `emoji-picker-badge-${idx}` : `emoji-picker-${idx}`;
    
    const el = document.getElementById(editorId);
    if(!el) return;
    
    el.focus();
    document.execCommand('insertText', false, char);
    const event = new Event('input', { bubbles: true });
    el.dispatchEvent(event);
    document.getElementById(pickerId).classList.add('hidden');
}

// --- GOOGLE LOGIN FUNCTIONS ---
function loginWithGoogle() {
    if (!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        showToast(`ยินดีต้อนรับ ${result.user.displayName}`);
        renderUserSidebar(result.user);
    }).catch((error) => {
        console.error(error);
        alert("Login Error: " + error.message);
    });
}

function logoutUser() {
    if (!auth) return;
    if (confirm("ต้องการออกจากระบบหรือไม่?")) {
        auth.signOut().then(() => {
            showToast("ออกจากระบบแล้ว");
            renderUserSidebar(null);
        });
    }
}

// --- UI RENDERING ---
function renderUserSidebar(user) {
    const container = document.getElementById('user-profile-section');
    if (!container) return; 

    if (user && !user.isAnonymous) {
        container.innerHTML = `
            <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100 mb-2">
                <img src="${user.photoURL || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full border-2 border-white shadow-sm">
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-slate-400">สวัสดี,</div>
                    <div class="text-sm font-bold text-slate-700 truncate">${user.displayName}</div>
                </div>
                <button onclick="logoutUser()" class="text-slate-400 hover:text-red-500 p-1" title="ออกจากระบบ">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
            <button onclick="openHistoryModal()" class="w-full mb-4 flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-sunny-red hover:border-red-100 transition-all shadow-sm btn-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                ดูประวัติที่บันทึกไว้
            </button>
        `;
    } else {
        container.innerHTML = `
            <button onclick="loginWithGoogle()" class="w-full flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-sunny-red hover:border-red-100 transition-all shadow-sm mb-4 btn-bounce">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                เข้าสู่ระบบ Gmail
            </button>
            <button onclick="openHistoryModal()" class="w-full mb-4 flex items-center justify-center gap-2 bg-slate-50 text-slate-500 border border-transparent py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all shadow-sm btn-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ประวัติ (Guest)
            </button>
        `;
    }
}

function renderSidebar() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    
    // --- PART 1: STOCK MENU ---
    let html = `<div class="px-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">เช็คสต็อกสินค้า</div>`;
    
    appConfig.menus.forEach(menu => {
        if (!menu.active) return;
        const activeClass = currentSystem === menu.id 
            ? 'bg-red-50 text-sunny-red border-sunny-red' 
            : 'border-transparent text-slate-600 hover:bg-red-100 hover:text-red-700 hover:border-red-600';
        const iconSvg = ICONS[menu.icon] || ICONS['wood'];
        html += `
            <a href="#" onclick="switchSystem('${menu.id}')" class="menu-item ${activeClass} group flex items-center px-6 py-3 transition-all duration-200 ease-out border-l-4">
                <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconSvg}</div>
                <div class="flex flex-col"><span class="font-medium text-sm">${menu.name}</span>${menu.sub?`<span class="text-[10px] text-slate-400 group-hover:text-red-600 transition-colors">${menu.sub}</span>`:''}</div>
            </a>`;
    });

    // --- PART 2: CALCULATOR MENU ---
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (appConfig.calcSettings.enabled || isAdmin) {
        html += `<div class="px-6 mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between"><span>ระบบคำนวณราคา</span>${!appConfig.calcSettings.enabled ? '<span class="text-[9px] bg-red-100 text-red-500 px-1 rounded">Admin Only</span>' : ''}</div>`;
        
        const iconRollerExt = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;
        const iconRollerInt = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>`;
        const iconPVC = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>`;
        const iconWood = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`;
        const iconAlu = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.357a4 4 0 014.187 6.187H15" /></svg>`;

        const calcClass = "group flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-200 ease-out border-l-4 border-transparent hover:border-indigo-900";

        html += `
            <a href="#" onclick="switchCalcMode('EXT')" class="${calcClass}">
                <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconRollerExt}</div>
                <span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">ม่านม้วนภายนอก</span>
            </a>
            <a href="#" onclick="switchCalcMode('INT')" class="${calcClass}">
                <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconRollerInt}</div>
                <span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">ม่านม้วน (ภายใน)</span>
            </a>
            <a href="#" onclick="switchCalcMode('PVC_CALC')" class="${calcClass}">
                <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconPVC}</div>
                <span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">ฉากกั้นห้อง PVC</span>
            </a>
            <a href="#" onclick="switchCalcMode('WOOD_CALC')" class="${calcClass}">
                <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconWood}</div>
                <span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">มู่ลี่ไม้</span>
            </a>
            <a href="#" onclick="switchCalcMode('ALU25')" class="${calcClass}">
                <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconAlu}</div>
                <span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">มู่ลี่อลูมิเนียม 25mm.</span>
            </a>
        `;
    }
    
    container.innerHTML = html;
    
    const titleEl = document.getElementById('app-title-display');
    if(titleEl) titleEl.innerText = appConfig.appTitle;
    
    renderUserSidebar(currentUser);
    checkPwaStatus();
}

// --- ADMIN SYSTEM & UTILS (FIXED & RESTORED) ---
function checkAdminLogin() { 
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        openConfig(); 
    } else {
        openAdminLogin();
    }
}

function openAdminLogin() { 
    document.getElementById('adminLoginModal').classList.remove('hidden'); 
    document.getElementById('adminPassword').value=''; 
    document.getElementById('loginError').classList.add('hidden'); 
    document.getElementById('adminPassword').focus(); 
}

function closeAdminLogin() { 
    document.getElementById('adminLoginModal').classList.add('hidden'); 
}

function handleLogin() { 
    if(document.getElementById('adminPassword').value === 'sn1988') { 
        localStorage.setItem('isAdminLoggedIn', 'true'); 
        closeAdminLogin(); 
        showToast("เข้าสู่ระบบสำเร็จ"); 
        openConfig(); 
        renderSidebar(); 
    } else { 
        document.getElementById('loginError').classList.remove('hidden'); 
    } 
}

function logoutAdmin() { 
    localStorage.removeItem('isAdminLoggedIn'); 
    closeConfig(); 
    showToast("ออกจากระบบแล้ว"); 
    renderSidebar(); 
}

function openConfig() {
    tempConfig = JSON.parse(JSON.stringify(appConfig));
    const modal = document.getElementById('adminConfigModal');
    if(modal) modal.classList.remove('hidden');
    
    const titleInp = document.getElementById('conf-app-title');
    if(titleInp) titleInp.value = tempConfig.appTitle;
    
    const speedInp = document.getElementById('conf-news-speed');
    if(speedInp) speedInp.value = tempConfig.newsSettings.speed || 3;
    
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.classList.remove('hidden');
    
    const calcEn = document.getElementById('conf-calc-enabled');
    if(calcEn) calcEn.checked = tempConfig.calcSettings.enabled;
    
    renderAdminCalcInputs(); 

    const theme = tempConfig.theme || 'default';
    const radios = document.getElementsByName('app-theme');
    for(const r of radios) { r.checked = (r.value === theme); }
    
    const st = document.getElementById('admin-mode-status');
    if(st) {
        const isConnected = auth && auth.currentUser;
        st.innerText = isConnected ? "สถานะ: Online Mode" : "สถานะ: Offline Mode";
        st.className = isConnected ? "text-xs font-bold text-green-600" : "text-xs font-bold text-red-600";
    }
    switchAdminTab('menu');
}

function saveConfig() {
    // 1. Gather Values
    const titleInp = document.getElementById('conf-app-title');
    if(titleInp) tempConfig.appTitle = titleInp.value;
    
    const speedInp = document.getElementById('conf-news-speed');
    if(speedInp) tempConfig.newsSettings.speed = parseInt(speedInp.value);
    
    // 2. Commit to AppConfig
    appConfig = JSON.parse(JSON.stringify(tempConfig));
    applyTheme(appConfig.theme);
    
    // 3. Save to Firebase
    if(db) {
        db.collection("app_settings").doc("config").set(appConfig).then(()=>{
            showToast("บันทึกสำเร็จ");
            closeConfig();
            renderSidebar();
            if(typeof renderNews === 'function') renderNews();
        }).catch(err => alert("Save Error: " + err.message));
    }
}

function closeConfig() { 
    applyTheme(appConfig.theme); 
    document.getElementById('adminConfigModal').classList.add('hidden'); 
}

function switchAdminTab(tab) {
    ['menu','news','calc','saved', 'theme', 'features'].forEach(t => {
        const btn = document.getElementById('tab-btn-'+t);
        const content = document.getElementById('tab-content-'+t);
        if(btn) btn.className = "px-4 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:bg-slate-50 whitespace-nowrap flex items-center gap-1";
        if(content) content.classList.add('hidden');
    });
    const activeBtn = document.getElementById('tab-btn-'+tab);
    const activeContent = document.getElementById('tab-content-'+tab);
    if(activeBtn) activeBtn.className = "px-4 py-3 text-sm font-bold border-b-2 border-sunny-red text-sunny-red bg-red-50 whitespace-nowrap flex items-center gap-1";
    if(activeContent) activeContent.classList.remove('hidden');
    if(tab === 'menu') renderAdminMenu();
    if(tab === 'news') renderAdminNews();
    if(tab === 'saved') renderQuotationsList('saved-quotations-list', 'all'); 
    if(tab === 'features') renderAdminFeatures();
}

// ... (Render Admin Functions: renderAdminMenu, renderAdminNews, etc. - SAME AS BEFORE) ...
// (I will include the compact versions here to ensure they work)

function renderAdminCalcInputs() {
    const container = document.getElementById('tab-content-calc');
    if(!container) return;
    
    const w = tempConfig.calcSettings.wood;
    const p = tempConfig.calcSettings.pvc;
    const r = tempConfig.calcSettings.roller; 

    // Simplified Render for stability
    container.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-slate-200 flex justify-between mb-4">
            <span class="font-bold">เปิดระบบคำนวณ</span>
            <input type="checkbox" ${tempConfig.calcSettings.enabled?'checked':''} onchange="tempConfig.calcSettings.enabled=this.checked">
        </div>
        <div class="space-y-4">
            <div class="p-3 border rounded bg-slate-50">
                <h4 class="font-bold mb-2">Wood Pricing</h4>
                Basswood: <input type="number" class="border p-1 w-20" value="${w.priceBasswood}" onchange="tempConfig.calcSettings.wood.priceBasswood=parseFloat(this.value)"><br>
                Foamwood: <input type="number" class="border p-1 w-20 mt-1" value="${w.priceFoamwood}" onchange="tempConfig.calcSettings.wood.priceFoamwood=parseFloat(this.value)">
            </div>
        </div>
    `;
}

function renderAdminMenu() {
    const list = document.getElementById('admin-menu-list');
    if(!list) return;
    list.innerHTML = '';
    tempConfig.menus.forEach((m, i) => {
        list.innerHTML += `
            <div class="p-3 border rounded-xl mb-2 flex items-center gap-3 bg-white">
                <span class="font-bold text-slate-400">${i+1}</span>
                <input type="text" value="${m.name}" class="border p-1 rounded text-sm flex-1" onchange="tempConfig.menus[${i}].name=this.value">
                <input type="checkbox" ${m.active?'checked':''} class="w-5 h-5" onchange="tempConfig.menus[${i}].active=this.checked">
            </div>`;
    });
}

function renderAdminNews() {
    const list = document.getElementById('admin-news-list');
    if(!list) return;
    list.innerHTML = `<button onclick="addNewNewsItem()" class="w-full py-2 border-2 border-dashed rounded-xl mb-4 text-slate-400">+ เพิ่มประกาศ</button>`;
    if(tempConfig.newsItems) {
        tempConfig.newsItems.forEach((n, i) => {
            list.innerHTML += `<div class="p-2 border mb-2 bg-white"><input type="text" value="${n.text}" class="w-full border p-1 mb-1" onchange="tempConfig.newsItems[${i}].text=this.value"><button onclick="deleteNews(${i})" class="text-red-500 text-xs">ลบ</button></div>`;
        });
    }
}

function addNewNewsItem() {
    if(!tempConfig.newsItems) tempConfig.newsItems = [];
    tempConfig.newsItems.unshift({ id: Date.now(), text: "New", date: new Date().toISOString(), pinned: false });
    renderAdminNews();
}

function deleteNews(i) {
    if(confirm('ลบ?')) {
        tempConfig.newsItems.splice(i, 1);
        renderAdminNews();
    }
}

function renderAdminFeatures() {
    const list = document.getElementById('admin-features-list');
    if(!list) return;
    list.innerHTML = '';
    Object.keys(tempConfig.features).forEach(key => {
        list.innerHTML += `<div class="flex justify-between items-center p-2 border-b"><span class="text-sm">${key}</span><input type="checkbox" ${tempConfig.features[key]?'checked':''} onchange="tempConfig.features['${key}']=this.checked"></div>`;
    });
}

function addNewFeature() {
    const key = document.getElementById('new-feature-key').value.trim();
    if(key) { tempConfig.features[key] = false; renderAdminFeatures(); }
}

function previewTheme(themeName) { applyTheme(themeName); tempConfig.theme = themeName; }

// --- NEWS RENDER ---
function renderNews() {
    const container = document.getElementById('news-container');
    const pinnedWrapper = document.getElementById('pinned-news-wrapper');
    const scrollWrapper = document.getElementById('scrolling-news-wrapper');
    const scrollTrack = document.getElementById('news-ticker-track');
    
    if(!container) return;
    
    const news = appConfig.newsItems || [];
    if(news.length === 0) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    
    const pinnedItems = news.filter(n => n.pinned);
    const scrollItems = news.filter(n => !n.pinned);
    
    pinnedWrapper.innerHTML = '';
    pinnedItems.forEach(item => {
        pinnedWrapper.innerHTML += `<div class="bg-red-50 p-2 border border-red-100 rounded mb-2 text-sm">📌 ${item.text}</div>`;
    });
    
    if (scrollItems.length > 0) {
        scrollWrapper.classList.remove('hidden');
        let html = '';
        [...scrollItems, ...scrollItems].forEach(item => {
            html += `<div class="p-2 border-b border-gray-100 text-sm">${item.text}</div>`;
        });
        scrollTrack.innerHTML = html;
    } else {
        scrollWrapper.classList.add('hidden');
    }
}

// --- UTILS ---
function toggleSidebar() { const sb = document.getElementById('sidebar'); const ov = document.getElementById('sidebarOverlay'); sb.classList.toggle('-translate-x-full'); ov.classList.toggle('hidden'); }
function toggleHelpModal(show) { document.getElementById('helpModal').classList.toggle('hidden', !show); }
function toggleCodeListModal(show) { document.getElementById('codeListModal').classList.toggle('hidden', !show); }

function showToast(msg) { 
    const t = document.getElementById('toast'); 
    const tm = document.getElementById('toast-message');
    if(t && tm) {
        tm.innerText = msg; 
        t.classList.remove('opacity-0','pointer-events-none','toast-hide'); 
        t.classList.add('toast-show'); 
        setTimeout(()=>{t.classList.remove('toast-show');t.classList.add('toast-hide');},2500); 
    }
}

// --- PWA INSTALLATION ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => { 
    e.preventDefault(); 
    deferredPrompt = e; 
    checkPwaStatus(); 
});

function isStandalone() { return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://'); }

function checkPwaStatus() { 
    const sidebarBtn = document.getElementById('pwaInstallBtn'); 
    const headerBtn = document.getElementById('headerInstallBtn'); 
    
    if(isStandalone()) { 
        if(sidebarBtn) sidebarBtn.classList.add('hidden'); 
        if(headerBtn) headerBtn.classList.add('hidden'); 
        return; 
    } 
    
    if(headerBtn) headerBtn.classList.remove('hidden'); 
    if (sidebarBtn) { 
        sidebarBtn.classList.remove('hidden'); 
        sidebarBtn.onclick = installApp; 
    } 
}

async function installApp() { 
    if (deferredPrompt) { 
        deferredPrompt.prompt(); 
        const { outcome } = await deferredPrompt.userChoice; 
        deferredPrompt = null; 
        if(outcome === 'accepted') { 
            checkPwaStatus(); 
        } 
        return; 
    } 
    document.getElementById('installGuideModal').classList.remove('hidden'); 
}

window.addEventListener('appinstalled', () => { 
    console.log('App installed'); 
    checkPwaStatus(); 
});

// --- GENERATE DYNAMIC MANIFEST ---
const iconSvgUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%23E63946' rx='80'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-weight='900' font-style='normal' font-size='380'%3ES%3C/text%3E%3C/svg%3E";
const manifestData = {
    name: "SUNNY Stock",
    short_name: "SUNNY",
    start_url: ".",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#E63946",
    icons: [
        {
            src: iconSvgUrl,
            sizes: "192x192 512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
        }
    ]
};
const stringManifest = JSON.stringify(manifestData);
const blob = new Blob([stringManifest], {type: 'application/json'});
const manifestURL = URL.createObjectURL(blob);
document.querySelector('#manifest-placeholder').setAttribute('href', manifestURL);

// --- APP INIT (CLEAN & SIMPLE) ---
window.addEventListener('DOMContentLoaded', () => { 
    // 1. Init Firebase (Config)
    initFirebase();
    
    // 2. Render Initial UI (UI)
    renderSidebar();
    
    // 3. Setup Logic (Stock)
    setupAutocomplete();
    checkPwaStatus();
    
    // 4. Default Load -> Go to WOOD
    setTimeout(() => {
        if(typeof switchSystem === 'function') switchSystem('WOOD');
        if(typeof renderNews === 'function') renderNews();
        
        const s = document.getElementById('intro-splash');
        if(s) {
            s.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => s.remove(), 700);
        }
    }, 500); 
});
