// =========================================
// 1. GLOBAL VARIABLES & UTILS
// =========================================
const EMOJI_LIST = [
    '📢', '🔥', '✨', '🎉', '⚠️', '🚨', '✅', '❌', '🟢', '🔴', 
    '📅', '🕒', '📌', '📍', '💡', '🚚', '📦', '🎁', '🏷️', '🛒',
    '💬', '📞', '📧', '🏠', '🏢', '🛠️', '🔧', '⚙️', '📈', '💰',
    '❤️', '👍', '⭐', '🌟', '🆕', '🆓', '🆔', '👉', '➡️', '🛑'
];

// ตัวแปรสำหรับ Admin Mode (สำคัญมาก ห้ามลบ)
let tempConfig = {}; 

function execCmd(command, value = null) {
    document.execCommand(command, false, value);
}

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

// =========================================
// 2. AUTHENTICATION
// =========================================
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

// =========================================
// 3. CORE LOGIC: INIT APP (หัวใจสำคัญที่แก้ปัญหา)
// =========================================
window.addEventListener('DOMContentLoaded', () => { 
    // 1. เริ่มระบบพื้นฐาน
    initFirebase();
    checkPwaStatus();
    setupAutocomplete(); // จาก stock.js

    // 2. ตรวจสอบว่าเข้าผ่านลิ้งค์แชร์หรือไม่?
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');

    if (sharedMode) {
        // >>> CASE A: เข้าผ่านลิ้งค์แชร์ (Standalone Mode)
        console.log("🚀 Running in Standalone Mode:", sharedMode);
        initStandaloneMode(sharedMode);
    } else {
        // >>> CASE B: เข้าหน้าปกติ (Normal Mode)
        console.log("🟢 Running in Normal Mode");
        initNormalMode();
    }

    // 3. ลบ Splash Screen (ทำเสมอ)
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if(s) {
            s.style.opacity = '0';
            s.style.pointerEvents = 'none';
            setTimeout(() => s.remove(), 1000);
        }
    }, 1200);
});

// --- ฟังก์ชันโหลดหน้าปกติ (Normal Mode) ---
function initNormalMode() {
    renderSidebar(); // วาดเมนู
    renderUserSidebar(currentUser); // วาดโปรไฟล์
    
    // โหลดข่าว (แก้ปัญหาข่าวหาย)
    setTimeout(() => {
        if(typeof renderNews === 'function') renderNews();
    }, 500);

    // เปิดหน้าค้นหา (WOOD)
    if(typeof switchSystem === 'function') switchSystem('WOOD');
}

// --- ฟังก์ชันโหลดหน้าแชร์ (Standalone Mode) ---
function initStandaloneMode(mode) {
    // 1. ซ่อน UI ที่ไม่จำเป็นทั้งหมด
    const hideList = ['sidebar', 'sidebarOverlay', 'headerSection', 'searchSection', 'news-container', 'user-profile-section'];
    hideList.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    // 2. ปรับ Layout ให้เต็มจอ
    const mainContent = document.querySelector('main');
    if(mainContent) {
        mainContent.classList.remove('md:ml-72');
        mainContent.classList.add('w-full', 'flex', 'flex-col', 'items-center', 'min-h-screen', 'bg-slate-50', 'pt-10');
    }

    // 3. ซ่อนปุ่มเมนูมือถือ
    const mobileToggle = document.querySelector('button[onclick="toggleSidebar()"]');
    if(mobileToggle) mobileToggle.classList.add('hidden');

    // 4. เปิดเครื่องคิดเลขและเลื่อนไปหา
    setTimeout(() => {
        if(typeof switchCalcMode === 'function') {
            switchCalcMode(mode);
            
            // บังคับโชว์ section
            const calcSec = document.getElementById('calculatorSection');
            if(calcSec) {
                calcSec.classList.remove('hidden');
                // เอาเงาออกเพื่อให้ดูคลีนๆ (Optional)
                const innerCard = calcSec.querySelector('.bg-white');
                if(innerCard) {
                    innerCard.classList.remove('shadow-xl', 'border');
                    innerCard.classList.add('shadow-sm');
                }
                calcSec.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }, 300);
}

// =========================================
// 4. UI COMPONENTS & SHARING
// =========================================

function shareCurrentPage() {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?mode=${calcMode}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("คัดลอกลิงก์แล้ว! ส่งให้เพื่อนได้เลย");
    }).catch(err => {
        console.error('Failed to copy: ', err);
        prompt("Copy ลิงก์ด้านล่าง:", shareUrl);
    });
}

function renderSidebar() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    
    // Render Stock Menu
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

    // Render Calculator Menu
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (appConfig.calcSettings.enabled || isAdmin) {
        html += `<div class="px-6 mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between"><span>ระบบคำนวณราคา</span>${!appConfig.calcSettings.enabled ? '<span class="text-[9px] bg-red-100 text-red-500 px-1 rounded">Admin Only</span>' : ''}</div>`;
        const calcClass = "group flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-200 ease-out border-l-4 border-transparent hover:border-indigo-900";
        
        // Simple Icons for menu
        const iExt = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
        const iInt = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`;
        const iPvc = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>`;
        const iWood = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
        const iAlu = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.357a4 4 0 014.187 6.187H15"/></svg>`;

        html += `
            <a href="#" onclick="switchCalcMode('EXT')" class="${calcClass}"><div class="w-8 mr-2">${iExt}</div><span>ม่านม้วนภายนอก</span></a>
            <a href="#" onclick="switchCalcMode('INT')" class="${calcClass}"><div class="w-8 mr-2">${iInt}</div><span>ม่านม้วน (ภายใน)</span></a>
            <a href="#" onclick="switchCalcMode('PVC_CALC')" class="${calcClass}"><div class="w-8 mr-2">${iPvc}</div><span>ฉากกั้นห้อง PVC</span></a>
            <a href="#" onclick="switchCalcMode('WOOD_CALC')" class="${calcClass}"><div class="w-8 mr-2">${iWood}</div><span>มู่ลี่ไม้</span></a>
            <a href="#" onclick="switchCalcMode('ALU25')" class="${calcClass}"><div class="w-8 mr-2">${iAlu}</div><span>มู่ลี่อลูมิเนียม 25mm.</span></a>
        `;
    }
    
    container.innerHTML = html;
    
    const titleEl = document.getElementById('app-title-display');
    if(titleEl) titleEl.innerText = appConfig.appTitle;
}

function renderUserSidebar(user) {
    const container = document.getElementById('user-profile-section');
    if (!container) return; 
    // ... (Code for renderUserSidebar remains same as previous, omitted for brevity but assume it's here) ...
    // Note: If you copy-pasted previous code, it's fine. 
    // Or simpler version below for Admin focus:
    if (user && !user.isAnonymous) {
        container.innerHTML = `<div class="p-3 bg-red-50 rounded-xl mb-2 flex items-center gap-2"><div class="font-bold text-sm">${user.displayName}</div><button onclick="logoutUser()" class="ml-auto text-red-500">ออก</button></div>`;
    } else {
        container.innerHTML = `<button onclick="loginWithGoogle()" class="w-full py-2 bg-white border rounded-xl text-sm font-bold shadow-sm">เข้าสู่ระบบ Gmail</button>`;
    }
}

// =========================================
// 5. ADMIN SYSTEM (Fixed: tempConfig & Save)
// =========================================

function checkAdminLogin() { 
    if (localStorage.getItem('isAdminLoggedIn') === 'true') openConfig(); 
    else openAdminLogin();
}

function openAdminLogin() { 
    document.getElementById('adminLoginModal').classList.remove('hidden'); 
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
    // 1. Initialize tempConfig form appConfig (Crucial Fix)
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

function renderAdminCalcInputs() {
    const container = document.getElementById('tab-content-calc');
    if(!container) return;
    
    // Ensure nested objects exist
    if(!tempConfig.calcSettings.wood) tempConfig.calcSettings.wood = {};
    if(!tempConfig.calcSettings.pvc) tempConfig.calcSettings.pvc = {};
    if(!tempConfig.calcSettings.roller) tempConfig.calcSettings.roller = {};

    const w = tempConfig.calcSettings.wood;
    const p = tempConfig.calcSettings.pvc;
    const r = tempConfig.calcSettings.roller; 

    container.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-slate-200 flex justify-between mb-4">
            <span class="font-bold">เปิดระบบคำนวณ</span>
            <input type="checkbox" ${tempConfig.calcSettings.enabled ? 'checked' : ''} onchange="tempConfig.calcSettings.enabled = this.checked">
        </div>
        <div class="space-y-4">
            <div class="p-3 border rounded bg-slate-50">
                <h4 class="font-bold mb-2">Wood</h4>
                Price Basswood: <input type="number" class="border p-1 w-20" value="${w.priceBasswood}" onchange="tempConfig.calcSettings.wood.priceBasswood=parseFloat(this.value)"><br>
                Price Foamwood: <input type="number" class="border p-1 w-20 mt-1" value="${w.priceFoamwood}" onchange="tempConfig.calcSettings.wood.priceFoamwood=parseFloat(this.value)">
            </div>
            <div class="text-xs text-center text-gray-400">ค่าอื่นๆ สามารถแก้ได้ใน Code หรือขยายฟอร์มนี้เพิ่มได้</div>
        </div>
    `;
}

function saveConfig() {
    // 2. Update config from inputs (Manual binding if not handled in onchange)
    const titleInp = document.getElementById('conf-app-title');
    if(titleInp) tempConfig.appTitle = titleInp.value;
    
    const speedInp = document.getElementById('conf-news-speed');
    if(speedInp) tempConfig.newsSettings.speed = parseInt(speedInp.value);
    
    // 3. Save to Global & Firebase
    appConfig = JSON.parse(JSON.stringify(tempConfig)); // Deep copy back
    applyTheme(appConfig.theme);
    
    if(db) {
        db.collection("app_settings").doc("config").set(appConfig).then(()=>{
            showToast("บันทึกสำเร็จ");
            closeConfig();
            renderSidebar();
            if(typeof renderNews === 'function') renderNews();
        }).catch(err => alert("Save Error: " + err.message));
    } else {
        alert("Database not connected");
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
    if(tab === 'saved' && typeof renderQuotationsList === 'function') renderQuotationsList('saved-quotations-list', 'all'); 
    if(tab === 'features') renderAdminFeatures();
}

// --- NEWS RENDER (Fixed) ---
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
    
    if(pinnedWrapper) {
        pinnedWrapper.innerHTML = '';
        pinnedItems.forEach(item => {
            pinnedWrapper.innerHTML += `<div class="bg-red-50 p-2 border border-red-100 rounded mb-2 text-sm">📌 <b>${item.badgeLabel || 'ประกาศ'}:</b> ${item.text}</div>`;
        });
    }
    
    if(scrollWrapper && scrollTrack && scrollItems.length > 0) {
        scrollWrapper.classList.remove('hidden');
        let html = '';
        // Duplicate for infinite scroll
        [...scrollItems, ...scrollItems].forEach(item => {
            html += `<div class="p-2 border-b border-gray-100 text-sm">${item.text}</div>`;
        });
        scrollTrack.innerHTML = html;
    } else if (scrollWrapper) {
        scrollWrapper.classList.add('hidden');
    }
}

// --- PWA & UTILS ---
window.addEventListener('beforeinstallprompt', (e) => { 
    e.preventDefault(); 
    deferredPrompt = e; 
    checkPwaStatus(); 
});
function checkPwaStatus() { 
    const sidebarBtn = document.getElementById('pwaInstallBtn'); 
    const headerBtn = document.getElementById('headerInstallBtn'); 
    if(window.matchMedia('(display-mode: standalone)').matches) { 
        if(sidebarBtn) sidebarBtn.classList.add('hidden'); 
        if(headerBtn) headerBtn.classList.add('hidden'); 
    } else {
        if(headerBtn) headerBtn.classList.remove('hidden'); 
        if(sidebarBtn) sidebarBtn.classList.remove('hidden'); 
    }
}
async function installApp() { 
    if (deferredPrompt) { 
        deferredPrompt.prompt(); 
        deferredPrompt = null; 
    } 
}
function applyTheme(theme) {
    document.body.classList.remove('theme-christmas');
    if (theme === 'christmas') document.body.classList.add('theme-christmas');
}
function setupAutocomplete() {} // Placeholder if stock.js not ready
function switchSystem() {} // Placeholder if stock.js not ready
