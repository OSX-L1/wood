// =========================================
// 0. IMMEDIATE SAFETY VALVE (ทำงานทันทีบรรทัดแรก)
// =========================================
(function() {
    // ตั้งเวลาบังคับลบโลโก้ทิ้งแน่นอนเมื่อครบ 3 วินาที ไม่สน Error ใดๆ
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if (s) {
            console.log("🛡️ Safety Valve: Removing Splash Screen");
            s.style.opacity = '0';
            s.style.pointerEvents = 'none';
            setTimeout(() => { if(s) s.remove(); }, 1000);
        }
    }, 3000);
})();

// =========================================
// 1. GLOBAL VARIABLES & UTILS
// =========================================
const EMOJI_LIST = [
    '📢', '🔥', '✨', '🎉', '⚠️', '🚨', '✅', '❌', '🟢', '🔴', 
    '📅', '🕒', '📌', '📍', '💡', '🚚', '📦', '🎁', '🏷️', '🛒',
    '💬', '📞', '📧', '🏠', '🏢', '🛠️', '🔧', '⚙️', '📈', '💰',
    '❤️', '👍', '⭐', '🌟', '🆕', '🆓', '🆔', '👉', '➡️', '🛑'
];

let tempConfig = {}; 

function execCmd(command, value = null) {
    try { document.execCommand(command, false, value); } catch(e){}
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
// 2. MAIN APP INIT (เปลี่ยนมาใช้ DOMContentLoaded)
// =========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ DOM Ready. Initializing App...");

    // 1. ตรวจสอบโหมดก่อนเลย (Normal vs Deep Link)
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');

    if (sharedMode) {
        // >>> CASE A: เข้าผ่านลิ้งค์แชร์ (Standalone)
        console.log("🚀 Standalone Mode Detected:", sharedMode);
        initStandaloneMode(sharedMode);
    } else {
        // >>> CASE B: โหมดปกติ
        console.log("🟢 Normal Mode Detected");
        initNormalMode();
    }

    // 2. พยายามเชื่อมต่อระบบหลังบ้าน (แยก try/catch ไม่ให้พังทั้งหน้า)
    try {
        if(typeof initFirebase === 'function') initFirebase();
        if(typeof checkPwaStatus === 'function') checkPwaStatus();
        if(typeof setupAutocomplete === 'function') setupAutocomplete();
    } catch(e) {
        console.error("System Init Warning:", e);
    }

    // 3. ลบ Splash Screen (Normal removal)
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if(s) {
            s.style.opacity = '0';
            setTimeout(() => { if(s) s.remove(); }, 1000);
        }
    }, 800);
});

// --- ฟังก์ชันโหลดหน้าปกติ ---
function initNormalMode() {
    renderSidebar();
    
    // โหลดหน้า STOCK (WOOD) และ News
    // ใช้ setTimeout เพื่อให้แน่ใจว่า Element ถูกสร้างเสร็จแล้ว
    setTimeout(() => {
        if(typeof switchSystem === 'function') switchSystem('WOOD');
        if(typeof renderNews === 'function') renderNews();
        if(typeof currentUser !== 'undefined') renderUserSidebar(currentUser);
    }, 100);
}

// --- ฟังก์ชันโหลดหน้าแชร์ (Standalone) ---
function initStandaloneMode(mode) {
    // 1. ซ่อน UI ที่ไม่จำเป็นทั้งหมดทันที
    const elementsToHide = [
        'sidebar', 
        'sidebarOverlay', 
        'headerSection', 
        'searchSection', 
        'news-container', 
        'user-profile-section'
    ];
    
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('hidden');
            el.style.display = 'none'; // Double Force Hide
        }
    });

    // 2. ปรับ Layout ให้เต็มจอ
    const mainContent = document.querySelector('main');
    if(mainContent) {
        mainContent.style.marginLeft = '0';
        mainContent.style.width = '100%';
        mainContent.style.maxWidth = '100%';
        mainContent.classList.add('flex', 'justify-center', 'pt-4');
    }

    // 3. ซ่อนปุ่มเปิดเมนู
    const toggles = document.querySelectorAll('button[onclick="toggleSidebar()"]');
    toggles.forEach(t => t.style.display = 'none');

    // 4. บังคับเปิดหน้าคำนวณ
    setTimeout(() => {
        if(typeof switchCalcMode === 'function') {
            switchCalcMode(mode); // เรียกฟังก์ชันเปิดเครื่องคิดเลข
            
            // ดึง Element เครื่องคิดเลขมาแสดงและปรับแต่ง
            const calcSec = document.getElementById('calculatorSection');
            if(calcSec) {
                calcSec.classList.remove('hidden');
                calcSec.style.display = 'block';
                calcSec.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }, 200);
}

// =========================================
// 3. UI & AUTH FUNCTIONS
// =========================================
function loginWithGoogle() {
    if (!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        showToast("Login Success");
        renderUserSidebar(result.user);
    }).catch(e => alert(e.message));
}

function logoutUser() {
    if(!auth) return;
    auth.signOut().then(() => { 
        showToast("Logged Out"); 
        renderUserSidebar(null); 
    });
}

function shareCurrentPage() {
    const url = window.location.origin + window.location.pathname + '?mode=' + calcMode;
    navigator.clipboard.writeText(url).then(() => showToast("Link Copied!"));
}

function renderSidebar() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    
    // Safety check for appConfig
    const menus = (typeof appConfig !== 'undefined' && appConfig.menus) ? appConfig.menus : [];
    
    let html = `<div class="px-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">เช็คสต็อกสินค้า</div>`;
    
    menus.forEach(menu => {
        if (!menu.active) return;
        const activeClass = (typeof currentSystem !== 'undefined' && currentSystem === menu.id) 
            ? 'bg-red-50 text-sunny-red border-sunny-red' 
            : 'border-transparent text-slate-600 hover:bg-red-100 hover:text-red-700 hover:border-red-600';
        
        const iconSvg = (typeof ICONS !== 'undefined' && ICONS[menu.icon]) ? ICONS[menu.icon] : '<span>📦</span>';
        
        html += `
            <a href="#" onclick="switchSystem('${menu.id}')" class="menu-item ${activeClass} group flex items-center px-6 py-3 transition-all duration-200 ease-out border-l-4">
                <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconSvg}</div>
                <div class="flex flex-col"><span class="font-medium text-sm">${menu.name}</span>${menu.sub?`<span class="text-[10px] text-slate-400 group-hover:text-red-600 transition-colors">${menu.sub}</span>`:''}</div>
            </a>`;
    });

    // Calculator Section
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    const isCalcEnabled = (typeof appConfig !== 'undefined' && appConfig.calcSettings && appConfig.calcSettings.enabled);
    
    if (isCalcEnabled || isAdmin) {
        html += `<div class="px-6 mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between"><span>ระบบคำนวณราคา</span>${!isCalcEnabled ? '<span class="text-[9px] bg-red-100 text-red-500 px-1 rounded">Admin Only</span>' : ''}</div>`;
        const cClass = "group flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-200 ease-out border-l-4 border-transparent hover:border-indigo-900";
        const icon = '<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
        
        html += `
            <a href="#" onclick="switchCalcMode('EXT')" class="${cClass}">${icon}<span>ม่านม้วนภายนอก</span></a>
            <a href="#" onclick="switchCalcMode('INT')" class="${cClass}">${icon}<span>ม่านม้วน (ภายใน)</span></a>
            <a href="#" onclick="switchCalcMode('PVC_CALC')" class="${cClass}">${icon}<span>ฉากกั้นห้อง PVC</span></a>
            <a href="#" onclick="switchCalcMode('WOOD_CALC')" class="${cClass}">${icon}<span>มู่ลี่ไม้</span></a>
            <a href="#" onclick="switchCalcMode('ALU25')" class="${cClass}">${icon}<span>มู่ลี่อลูมิเนียม 25mm.</span></a>
        `;
    }
    
    container.innerHTML = html;
    
    const t = document.getElementById('app-title-display');
    if(t && typeof appConfig !== 'undefined') t.innerText = appConfig.appTitle || 'SUNNY';
}

function renderUserSidebar(user) {
    const c = document.getElementById('user-profile-section');
    if (!c) return; 
    if (user && !user.isAnonymous) {
        c.innerHTML = `<div class="p-3 bg-red-50 rounded-xl mb-2 flex items-center gap-2"><div class="font-bold text-sm">${user.displayName}</div><button onclick="logoutUser()" class="ml-auto text-xs text-red-500">ออก</button></div>`;
    } else {
        c.innerHTML = `<button onclick="loginWithGoogle()" class="w-full py-2 bg-white border rounded-xl text-xs font-bold shadow-sm">Login Gmail</button>`;
    }
}

// =========================================
// 4. ADMIN & NEWS (Safe Version)
// =========================================
function checkAdminLogin() { 
    if (localStorage.getItem('isAdminLoggedIn') === 'true') openConfig(); 
    else document.getElementById('adminLoginModal').classList.remove('hidden');
}
function closeAdminLogin() { document.getElementById('adminLoginModal').classList.add('hidden'); }
function handleLogin() { 
    if(document.getElementById('adminPassword').value === 'sn1988') { 
        localStorage.setItem('isAdminLoggedIn', 'true'); 
        closeAdminLogin(); 
        openConfig(); 
    } else { alert("รหัสผิด"); }
}
function logoutAdmin() { localStorage.removeItem('isAdminLoggedIn'); closeConfig(); renderSidebar(); }

function openConfig() {
    if(typeof appConfig === 'undefined') return alert("System Loading...");
    tempConfig = JSON.parse(JSON.stringify(appConfig));
    document.getElementById('adminConfigModal').classList.remove('hidden');
    
    const t = document.getElementById('conf-app-title');
    if(t) t.value = tempConfig.appTitle || '';
    
    renderAdminCalcInputs();
    switchAdminTab('menu');
}

function saveConfig() {
    const t = document.getElementById('conf-app-title');
    if(t) tempConfig.appTitle = t.value;
    
    appConfig = JSON.parse(JSON.stringify(tempConfig));
    if(typeof applyTheme === 'function') applyTheme(appConfig.theme);
    
    if(typeof db !== 'undefined') {
        db.collection("app_settings").doc("config").set(appConfig).then(()=>{
            showToast("บันทึกสำเร็จ");
            closeConfig();
            renderSidebar();
            if(typeof renderNews === 'function') renderNews();
        }).catch(e => alert("Save Error: "+e.message));
    }
}

function closeConfig() { document.getElementById('adminConfigModal').classList.add('hidden'); }

function renderAdminCalcInputs() {
    const c = document.getElementById('tab-content-calc');
    if(!c) return;
    if(!tempConfig.calcSettings) tempConfig.calcSettings = { enabled: true, wood:{}, pvc:{}, roller:{} };
    
    c.innerHTML = `
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between mb-4">
            <span class="font-bold">เปิดระบบคำนวณ</span>
            <input type="checkbox" ${tempConfig.calcSettings.enabled?'checked':''} onchange="tempConfig.calcSettings.enabled=this.checked">
        </div>
        <div class="text-xs text-center text-gray-400">แก้ไขค่าพารามิเตอร์อื่นๆ ได้ใน Code</div>
    `;
}

function renderAdminMenu() {
    const list = document.getElementById('admin-menu-list');
    if (!list) return;
    list.innerHTML = '';
    if(tempConfig.menus) {
        tempConfig.menus.forEach((m, i) => {
            list.innerHTML += `
                <div class="p-3 border rounded-xl mb-2 flex items-center gap-3 bg-white">
                    <span class="font-bold text-slate-400">${i+1}</span>
                    <input type="text" value="${m.name}" class="border p-1 rounded text-sm flex-1" onchange="tempConfig.menus[${i}].name=this.value">
                    <input type="checkbox" ${m.active?'checked':''} onchange="tempConfig.menus[${i}].active=this.checked">
                </div>`;
        });
    }
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

function switchAdminTab(tab) {
    ['menu','news','calc','saved', 'theme', 'features'].forEach(t => {
        const el = document.getElementById('tab-content-'+t);
        const btn = document.getElementById('tab-btn-'+t);
        if(el) el.classList.add('hidden');
        if(btn) btn.className = "px-4 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500";
    });
    
    const target = document.getElementById('tab-content-'+tab);
    const targetBtn = document.getElementById('tab-btn-'+tab);
    if(target) target.classList.remove('hidden');
    if(targetBtn) targetBtn.className = "px-4 py-3 text-sm font-bold border-b-2 border-sunny-red text-sunny-red";
    
    if(tab==='menu') renderAdminMenu();
    if(tab==='news') renderAdminNews();
    if(tab==='calc') renderAdminCalcInputs();
    if(tab==='saved' && typeof renderQuotationsList === 'function') renderQuotationsList('saved-quotations-list', 'all'); 
}

function renderNews() {
    const container = document.getElementById('news-container');
    const pinnedWrapper = document.getElementById('pinned-news-wrapper');
    
    if(!container || typeof appConfig === 'undefined' || !appConfig.newsItems) return;

    if(appConfig.newsItems.length === 0) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    
    if(pinnedWrapper) {
        pinnedWrapper.innerHTML = '';
        appConfig.newsItems.filter(n=>n.pinned).forEach(item => {
            pinnedWrapper.innerHTML += `<div class="bg-red-50 p-2 border border-red-100 rounded mb-2 text-sm">📌 ${item.text}</div>`;
        });
    }
    
    // Scrolling news omitted for brevity/stability, can be added back if needed
    const scrollWrapper = document.getElementById('scrolling-news-wrapper');
    if(scrollWrapper) scrollWrapper.classList.remove('hidden');
}

// --- UTILS ---
function checkPwaStatus() { 
    const b = document.getElementById('pwaInstallBtn'); 
    if(b) b.classList.remove('hidden'); 
}
function installApp() { if(deferredPrompt) deferredPrompt.prompt(); }
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });

function setupAutocomplete() {} // Fallback
function switchSystem() {} // Fallback
function insertEmoji() {} // Fallback
function togglePinNews() {}
function renderAdminFeatures() {}
function addNewFeature() {}
function previewTheme() {}
function toggleSidebar() { const s=document.getElementById('sidebar'); if(s) s.classList.toggle('-translate-x-full'); const o=document.getElementById('sidebarOverlay'); if(o) o.classList.toggle('hidden'); }
function toggleHelpModal(show) { document.getElementById('helpModal').classList.toggle('hidden', !show); }
function toggleCodeListModal(show) { document.getElementById('codeListModal').classList.toggle('hidden', !show); }
