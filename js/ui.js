// =========================================
// 1. GLOBAL VARIABLES & UTILS
// =========================================
const EMOJI_LIST = [
    '📢', '🔥', '✨', '🎉', '⚠️', '🚨', '✅', '❌', '🟢', '🔴', 
    '📅', '🕒', '📌', '📍', '💡', '🚚', '📦', '🎁', '🏷️', '🛒',
    '💬', '📞', '📧', '🏠', '🏢', '🛠️', '🔧', '⚙️', '📈', '💰',
    '❤️', '👍', '⭐', '🌟', '🆕', '🆓', '🆔', '👉', '➡️', '🛑'
];

let tempConfig = {}; // สำหรับ Admin

// --- SAFETY VALVE: บังคับลบหน้าโลโก้เสมอเมื่อผ่านไป 3.5 วินาที (ป้องกันการค้าง) ---
setTimeout(() => {
    const s = document.getElementById('intro-splash');
    if(s) s.remove();
}, 3500);

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
// 2. MAIN SYSTEM START (ใช้ window.onload เพื่อความชัวร์)
// =========================================
window.addEventListener('load', () => {
    console.log("🟢 System Loaded. Initializing...");

    // 1. ลองเชื่อมต่อฐานข้อมูล
    try {
        if(typeof initFirebase === 'function') initFirebase();
    } catch(e) { console.error("Firebase Init Failed:", e); }

    // 2. ตรวจสอบว่าเข้ามาแบบไหน (ปกติ หรือ ลิ้งค์แชร์)
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');

    if (sharedMode) {
        // >>> โหมดลิ้งค์แชร์ (Deep Link / Standalone)
        startStandaloneMode(sharedMode);
    } else {
        // >>> โหมดปกติ (Normal)
        startNormalMode();
    }

    // 3. ลบ Splash Screen (แบบปกติ)
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if(s) {
            s.style.opacity = '0';
            setTimeout(() => s.remove(), 1000);
        }
    }, 1000);
});

// --- ฟังก์ชันเริ่มโหมดปกติ ---
function startNormalMode() {
    console.log("Running Normal Mode");
    checkPwaStatus();
    renderSidebar();
    
    if(typeof setupAutocomplete === 'function') setupAutocomplete();
    
    // โหลดหน้าแรก (STOCK) และ ข่าว
    setTimeout(() => {
        if(typeof switchSystem === 'function') switchSystem('WOOD');
        if(typeof renderNews === 'function') renderNews();
        if(typeof currentUser !== 'undefined') renderUserSidebar(currentUser);
    }, 200);
}

// --- ฟังก์ชันเริ่มโหมดแชร์ (Standalone) ---
function startStandaloneMode(mode) {
    console.log("🚀 Running Standalone Mode:", mode);
    
    // 1. ลบองค์ประกอบที่ไม่ใช่ออกไปเลย (ไม่ใช่แค่ซ่อน)
    const idsToRemove = ['sidebar', 'sidebarOverlay', 'headerSection', 'searchSection', 'news-container', 'user-profile-section'];
    idsToRemove.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none'; // ใช้ display:none แทน class hidden เพื่อความชัวร์
    });

    // 2. ปรับ Layout ให้เต็มจอ
    const mainContent = document.querySelector('main');
    if(mainContent) {
        mainContent.style.marginLeft = '0px';
        mainContent.style.width = '100%';
        mainContent.style.display = 'flex';
        mainContent.style.justifyContent = 'center';
        mainContent.style.paddingTop = '20px';
    }

    // 3. ซ่อนปุ่มเปิดเมนูมือถือ
    const toggles = document.querySelectorAll('button[onclick="toggleSidebar()"]');
    toggles.forEach(t => t.style.display = 'none');

    // 4. เปิดเครื่องคิดเลขทันที
    setTimeout(() => {
        if(typeof switchCalcMode === 'function') {
            switchCalcMode(mode);
            
            const calcSec = document.getElementById('calculatorSection');
            if(calcSec) {
                calcSec.classList.remove('hidden');
                calcSec.style.display = 'block';
                
                // ปรับแต่ง UI เครื่องคิดเลขให้ดูดีตอนอยู่เดี่ยวๆ
                const innerBox = calcSec.querySelector('.bg-white');
                if(innerBox) {
                    innerBox.style.boxShadow = 'none';
                    innerBox.style.border = 'none';
                }
            }
        }
    }, 300);
}

// =========================================
// 3. UI RENDERERS
// =========================================
function renderSidebar() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    
    // ป้องกัน Error กรณี appConfig ยังไม่มา
    if (typeof appConfig === 'undefined') {
        console.warn("appConfig not ready, retrying...");
        setTimeout(renderSidebar, 500);
        return;
    }

    let html = `<div class="px-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">เช็คสต็อกสินค้า</div>`;
    
    if(appConfig.menus) {
        appConfig.menus.forEach(menu => {
            if (!menu.active) return;
            // Handle undefined ICONS
            const iconSvg = (typeof ICONS !== 'undefined' && ICONS[menu.icon]) ? ICONS[menu.icon] : '<span class="text-xl">📦</span>';
            const activeClass = (typeof currentSystem !== 'undefined' && currentSystem === menu.id)
                ? 'bg-red-50 text-sunny-red border-sunny-red' 
                : 'border-transparent text-slate-600 hover:bg-red-100 hover:text-red-700 hover:border-red-600';
                
            html += `
                <a href="#" onclick="switchSystem('${menu.id}')" class="menu-item ${activeClass} group flex items-center px-6 py-3 transition-all duration-200 ease-out border-l-4">
                    <div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconSvg}</div>
                    <div class="flex flex-col"><span class="font-medium text-sm">${menu.name}</span>${menu.sub?`<span class="text-[10px] text-slate-400 group-hover:text-red-600 transition-colors">${menu.sub}</span>`:''}</div>
                </a>`;
        });
    }

    // Calculator Menu
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    if ((appConfig.calcSettings && appConfig.calcSettings.enabled) || isAdmin) {
        html += `<div class="px-6 mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between"><span>ระบบคำนวณราคา</span>${!appConfig.calcSettings.enabled ? '<span class="text-[9px] bg-red-100 text-red-500 px-1 rounded">Admin Only</span>' : ''}</div>`;
        const calcClass = "group flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-200 ease-out border-l-4 border-transparent hover:border-indigo-900";
        
        // Icons
        const iDef = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';

        html += `
            <a href="#" onclick="switchCalcMode('EXT')" class="${calcClass}"><div class="w-8 mr-2">${iDef}</div><span>ม่านม้วนภายนอก</span></a>
            <a href="#" onclick="switchCalcMode('INT')" class="${calcClass}"><div class="w-8 mr-2">${iDef}</div><span>ม่านม้วน (ภายใน)</span></a>
            <a href="#" onclick="switchCalcMode('PVC_CALC')" class="${calcClass}"><div class="w-8 mr-2">${iDef}</div><span>ฉากกั้นห้อง PVC</span></a>
            <a href="#" onclick="switchCalcMode('WOOD_CALC')" class="${calcClass}"><div class="w-8 mr-2">${iDef}</div><span>มู่ลี่ไม้</span></a>
            <a href="#" onclick="switchCalcMode('ALU25')" class="${calcClass}"><div class="w-8 mr-2">${iDef}</div><span>มู่ลี่อลูมิเนียม 25mm.</span></a>
        `;
    }
    
    container.innerHTML = html;
    
    const titleEl = document.getElementById('app-title-display');
    if(titleEl && appConfig.appTitle) titleEl.innerText = appConfig.appTitle;
}

function renderUserSidebar(user) {
    const container = document.getElementById('user-profile-section');
    if (!container) return; 

    if (user && !user.isAnonymous) {
        container.innerHTML = `<div class="p-3 bg-red-50 rounded-xl mb-2 flex items-center gap-2"><div class="font-bold text-sm text-sunny-red">${user.displayName || 'User'}</div><button onclick="logoutUser()" class="ml-auto text-xs text-slate-400 hover:text-red-500">ออกจากระบบ</button></div>
        <button onclick="openHistoryModal()" class="w-full mb-4 py-2 bg-white border rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50">ดูประวัติที่บันทึก</button>`;
    } else {
        container.innerHTML = `
            <button onclick="loginWithGoogle()" class="w-full mb-2 py-2.5 bg-white border rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">เข้าสู่ระบบ Gmail</button>
            <button onclick="openHistoryModal()" class="w-full mb-4 py-2 text-slate-400 text-xs hover:text-sunny-red">ประวัติ (Guest)</button>
        `;
    }
}

function renderNews() {
    const container = document.getElementById('news-container');
    const pinnedWrapper = document.getElementById('pinned-news-wrapper');
    const scrollTrack = document.getElementById('news-ticker-track');
    
    if(!container || !appConfig.newsItems) return;

    if(appConfig.newsItems.length === 0) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    
    const pinnedItems = appConfig.newsItems.filter(n => n.pinned);
    const scrollItems = appConfig.newsItems.filter(n => !n.pinned);
    
    if(pinnedWrapper) {
        pinnedWrapper.innerHTML = '';
        pinnedItems.forEach(item => {
            pinnedWrapper.innerHTML += `<div class="bg-red-50 p-2.5 border border-red-100 rounded-xl mb-2 text-sm shadow-sm flex items-start gap-2"><span class="text-lg">📌</span><div><span class="font-bold text-sunny-red">${item.badgeLabel || 'ประกาศ'}:</span> ${item.text}</div></div>`;
        });
    }
    
    const scrollWrapper = document.getElementById('scrolling-news-wrapper');
    if(scrollWrapper && scrollTrack && scrollItems.length > 0) {
        scrollWrapper.classList.remove('hidden');
        let html = '';
        [...scrollItems, ...scrollItems].forEach(item => {
            html += `<div class="p-2 border-b border-dashed border-slate-200 text-sm text-slate-600">${item.text}</div>`;
        });
        scrollTrack.innerHTML = html;
    } else if (scrollWrapper) {
        scrollWrapper.classList.add('hidden');
    }
}

// =========================================
// 4. ADMIN & UTILS (Simplified for stability)
// =========================================
function checkAdminLogin() { 
    if (localStorage.getItem('isAdminLoggedIn') === 'true') openConfig(); 
    else openAdminLogin();
}
function openAdminLogin() { document.getElementById('adminLoginModal').classList.remove('hidden'); }
function closeAdminLogin() { document.getElementById('adminLoginModal').classList.add('hidden'); }
function handleLogin() { 
    if(document.getElementById('adminPassword').value === 'sn1988') { 
        localStorage.setItem('isAdminLoggedIn', 'true'); 
        closeAdminLogin(); 
        showToast("เข้าสู่ระบบสำเร็จ"); 
        openConfig(); 
    } else { 
        alert("รหัสผ่านไม่ถูกต้อง"); 
    } 
}
function logoutAdmin() { localStorage.removeItem('isAdminLoggedIn'); closeConfig(); showToast("ออกจากระบบแล้ว"); }

function openConfig() {
    tempConfig = JSON.parse(JSON.stringify(appConfig));
    const modal = document.getElementById('adminConfigModal');
    if(modal) modal.classList.remove('hidden');
    
    // Bind simple inputs
    const t = document.getElementById('conf-app-title');
    if(t) t.value = tempConfig.appTitle || '';
    
    renderAdminCalcInputs();
    switchAdminTab('menu');
}

function saveConfig() {
    const t = document.getElementById('conf-app-title');
    if(t) tempConfig.appTitle = t.value;
    
    appConfig = JSON.parse(JSON.stringify(tempConfig));
    
    if(db) {
        db.collection("app_settings").doc("config").set(appConfig).then(()=>{
            showToast("บันทึกสำเร็จ");
            closeConfig();
            renderSidebar();
            renderNews();
        }).catch(e => alert("Save Error: "+e.message));
    }
}

function closeConfig() { document.getElementById('adminConfigModal').classList.add('hidden'); }

function renderAdminCalcInputs() {
    const container = document.getElementById('tab-content-calc');
    if(!container) return;
    
    // Safety check objects
    if(!tempConfig.calcSettings) tempConfig.calcSettings = { enabled: true, wood: {}, pvc: {}, roller: {} };
    const c = tempConfig.calcSettings;

    container.innerHTML = `
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div class="flex justify-between items-center mb-4">
                <span class="font-bold">เปิดใช้งานระบบคำนวณ</span>
                <input type="checkbox" ${c.enabled?'checked':''} onchange="tempConfig.calcSettings.enabled=this.checked" class="w-6 h-6">
            </div>
            <div class="space-y-2">
                <div class="font-bold text-xs text-slate-400 uppercase">Wood Pricing</div>
                <div class="flex gap-2 items-center">Basswood: <input type="number" class="border rounded p-1 w-24" value="${c.wood?.priceBasswood || 0}" onchange="tempConfig.calcSettings.wood.priceBasswood=Number(this.value)"></div>
                <div class="flex gap-2 items-center">Foamwood: <input type="number" class="border rounded p-1 w-24" value="${c.wood?.priceFoamwood || 0}" onchange="tempConfig.calcSettings.wood.priceFoamwood=Number(this.value)"></div>
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
    list.innerHTML = `<button onclick="addNewNewsItem()" class="w-full py-2 border-2 border-dashed rounded-xl mb-4 text-slate-400 font-bold">+ เพิ่มประกาศ</button>`;
    
    if(tempConfig.newsItems) {
        tempConfig.newsItems.forEach((n, i) => {
            list.innerHTML += `
                <div class="p-3 border rounded-xl mb-2 bg-white relative">
                    <textarea class="w-full border p-2 rounded text-sm mb-2" onchange="tempConfig.newsItems[${i}].text=this.value">${n.text}</textarea>
                    <div class="flex justify-between items-center">
                        <label class="flex items-center gap-2 text-xs"><input type="checkbox" ${n.pinned?'checked':''} onchange="tempConfig.newsItems[${i}].pinned=this.checked"> ปักหมุด</label>
                        <button onclick="deleteNews(${i})" class="text-red-500 text-xs font-bold">ลบ</button>
                    </div>
                </div>`;
        });
    }
}

function addNewNewsItem() {
    if(!tempConfig.newsItems) tempConfig.newsItems = [];
    tempConfig.newsItems.unshift({ id: Date.now(), text: "ประกาศใหม่", pinned: false, date: new Date().toISOString() });
    renderAdminNews();
}

function deleteNews(i) {
    if(confirm('ลบ?')) {
        tempConfig.newsItems.splice(i, 1);
        renderAdminNews();
    }
}

function switchAdminTab(tab) {
    ['menu','news','calc'].forEach(t => document.getElementById('tab-content-'+t).classList.add('hidden'));
    ['saved','theme','features'].forEach(t => { const el = document.getElementById('tab-content-'+t); if(el) el.classList.add('hidden'); });
    
    const target = document.getElementById('tab-content-'+tab);
    if(target) target.classList.remove('hidden');
    
    if(tab==='menu') renderAdminMenu();
    if(tab==='news') renderAdminNews();
    if(tab==='calc') renderAdminCalcInputs();
}

// --- PWA ---
function checkPwaStatus() {
    const btn = document.getElementById('headerInstallBtn');
    if(btn && !window.matchMedia('(display-mode: standalone)').matches) btn.classList.remove('hidden');
}
function installApp() { if(deferredPrompt) deferredPrompt.prompt(); }
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; checkPwaStatus(); });

// --- SHARED AUTH ---
function loginWithGoogle() {
    if (!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        showToast("Login Success");
        renderUserSidebar(result.user);
    }).catch(e => alert(e.message));
}
function logoutUser() {
    auth.signOut().then(() => { showToast("Logged Out"); renderUserSidebar(null); });
}
function shareCurrentPage() {
    const url = window.location.origin + window.location.pathname + '?mode=' + calcMode;
    navigator.clipboard.writeText(url).then(() => showToast("Link Copied!"));
}
function setupAutocomplete() {} // Fallback
function insertEmoji() {} // Fallback
function toggleSidebar() { const s=document.getElementById('sidebar'); if(s) s.classList.toggle('-translate-x-full'); const o=document.getElementById('sidebarOverlay'); if(o) o.classList.toggle('hidden'); }
