// =========================================================
// 🚨 1. EMERGENCY SPLASH REMOVER (ทำงานทันที บรรทัดแรกสุด)
// =========================================================
(function() {
    // ตั้งเวลา 3 วินาที บังคับลบหน้าโลโก้ทิ้ง ไม่สนว่าระบบจะ Error หรือไม่
    var safetyTimer = setTimeout(function() {
        var s = document.getElementById('intro-splash');
        if (s) {
            console.warn("🛡️ Safety Valve Activated: Forcing Splash Removal");
            s.style.opacity = '0';
            s.style.pointerEvents = 'none';
            setTimeout(function() { if(s) s.remove(); }, 1000);
        }
    }, 2500); // 2.5 วินาที
})();

// =========================================
// 2. GLOBAL VARIABLES
// =========================================
const EMOJI_LIST = ['📢', '🔥', '✨', '🎉', '✅', '❌', '🟢', '🔴', '📅', '🕒', '📌', '📍', '📦', '🛒', '💬', '📞', '🏠', '⚙️', '💰', '❤️', '⭐', '🆕'];
let tempConfig = {}; // Admin Config Placeholder

// =========================================
// 3. MAIN INIT LOGIC
// =========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ System Starting...");

    // A. เชื่อมต่อฐานข้อมูล (ครอบด้วย Try-Catch กันเว็บพัง)
    try {
        if(typeof initFirebase === 'function') initFirebase();
    } catch(e) { console.error("Firebase Error:", e); }

    // B. ตรวจสอบโหมด (Normal หรือ Link Share)
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');

    if (sharedMode) {
        // >>> โหมดลิ้งค์แชร์: ซ่อนทุกอย่างแล้วเปิดเครื่องคิดเลข
        console.log("🚀 Standalone Mode:", sharedMode);
        initStandaloneMode(sharedMode);
    } else {
        // >>> โหมดปกติ: โหลดเมนูและหน้าแรก
        console.log("🟢 Normal Mode");
        initNormalMode();
    }

    // C. ลบหน้าโลโก้ (แบบปกติ เมื่อโหลดเสร็จเร็ว)
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if(s) {
            s.style.transition = "opacity 0.5s ease";
            s.style.opacity = '0';
            setTimeout(() => { if(s) s.remove(); }, 500);
        }
    }, 800); // ถ้าโหลดเร็ว ลบเลยใน 0.8 วิ
});

// --- ฟังก์ชันโหลดหน้าแชร์ (Standalone) ---
function initStandaloneMode(mode) {
    // 1. ซ่อน UI ที่ไม่จำเป็น
    const hideIds = ['sidebar', 'sidebarOverlay', 'headerSection', 'searchSection', 'news-container', 'user-profile-section'];
    hideIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });

    // 2. ปรับหน้าจอให้เต็ม
    const main = document.querySelector('main');
    if(main) {
        main.style.marginLeft = '0';
        main.style.width = '100%';
        main.style.display = 'flex';
        main.style.justifyContent = 'center';
        main.style.paddingTop = '20px';
    }

    // 3. ซ่อนปุ่มเมนูมือถือ
    const toggles = document.querySelectorAll('button[onclick="toggleSidebar()"]');
    toggles.forEach(t => t.style.display = 'none');

    // 4. เปิดเครื่องคิดเลข (รอ 0.5 วิ ให้ calc.js โหลดทัน)
    setTimeout(() => {
        if(typeof switchCalcMode === 'function') {
            switchCalcMode(mode);
            const calc = document.getElementById('calculatorSection');
            if(calc) {
                calc.classList.remove('hidden');
                calc.style.display = 'block';
                // ลบเงาออกเพื่อให้เนียนกับพื้นหลัง (Optional)
                const inner = calc.querySelector('.bg-white');
                if(inner) { inner.style.boxShadow = 'none'; inner.style.border = 'none'; }
            }
        }
    }, 500);
}

// --- ฟังก์ชันโหลดหน้าปกติ ---
function initNormalMode() {
    renderSidebar();
    
    // รอโหลดหน้า STOCK (WOOD)
    setTimeout(() => {
        if(typeof switchSystem === 'function') switchSystem('WOOD');
        if(typeof renderNews === 'function') renderNews();
        if(typeof currentUser !== 'undefined') renderUserSidebar(currentUser);
        if(typeof checkPwaStatus === 'function') checkPwaStatus();
    }, 200);
}

// =========================================
// 4. UI HELPERS & SHARED FUNCTIONS
// =========================================
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

function shareCurrentPage() {
    const url = window.location.origin + window.location.pathname + '?mode=' + calcMode;
    navigator.clipboard.writeText(url).then(() => showToast("คัดลอกลิงก์แล้ว!")).catch(e => prompt("Link:", url));
}

function renderSidebar() {
    const c = document.getElementById('sidebar-menu-container');
    if (!c) return;
    
    // Safety check: ถ้า appConfig ยังไม่มา ให้ใช้ค่าว่างไปก่อน
    const menus = (typeof appConfig !== 'undefined' && appConfig.menus) ? appConfig.menus : [];
    
    let html = `<div class="px-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">เช็คสต็อกสินค้า</div>`;
    
    menus.forEach(m => {
        if (!m.active) return;
        const icon = (typeof ICONS !== 'undefined' && ICONS[m.icon]) ? ICONS[m.icon] : '📦';
        const active = (typeof currentSystem !== 'undefined' && currentSystem === m.id) ? 'bg-red-50 text-sunny-red border-sunny-red' : 'border-transparent text-slate-600 hover:bg-red-50';
        html += `<a href="#" onclick="switchSystem('${m.id}')" class="flex items-center px-6 py-3 border-l-4 ${active} transition-all"><div class="w-8 mr-2">${icon}</div><div><div class="text-sm font-bold">${m.name}</div><div class="text-[10px] text-slate-400">${m.sub||''}</div></div></a>`;
    });

    // Calculator Menu
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    const isCalc = (typeof appConfig !== 'undefined' && appConfig.calcSettings && appConfig.calcSettings.enabled);
    
    if (isCalc || isAdmin) {
        html += `<div class="px-6 mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">ระบบคำนวณราคา</div>`;
        const cls = "flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 border-l-4 border-transparent hover:border-indigo-900 transition-all";
        const i = `<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
        
        html += `
            <a href="#" onclick="switchCalcMode('EXT')" class="${cls}">${i}<span>ม่านม้วนภายนอก</span></a>
            <a href="#" onclick="switchCalcMode('INT')" class="${cls}">${i}<span>ม่านม้วน (ภายใน)</span></a>
            <a href="#" onclick="switchCalcMode('PVC_CALC')" class="${cls}">${i}<span>ฉากกั้นห้อง PVC</span></a>
            <a href="#" onclick="switchCalcMode('WOOD_CALC')" class="${cls}">${i}<span>มู่ลี่ไม้</span></a>
            <a href="#" onclick="switchCalcMode('ALU25')" class="${cls}">${i}<span>มู่ลี่อลูมิเนียม 25mm.</span></a>
        `;
    }
    c.innerHTML = html;
    
    const t = document.getElementById('app-title-display');
    if(t && typeof appConfig !== 'undefined') t.innerText = appConfig.appTitle || 'SUNNY';
}

function renderUserSidebar(user) {
    const c = document.getElementById('user-profile-section');
    if (!c) return;
    if (user && !user.isAnonymous) {
        c.innerHTML = `<div class="p-3 bg-red-50 rounded-xl mb-2 flex items-center gap-2"><div class="font-bold text-sm text-sunny-red">${user.displayName}</div><button onclick="logoutUser()" class="ml-auto text-xs text-red-500">ออก</button></div>`;
    } else {
        c.innerHTML = `<button onclick="loginWithGoogle()" class="w-full py-2 bg-white border rounded-xl text-xs font-bold shadow-sm mb-2">Login Gmail</button>`;
    }
    c.innerHTML += `<button onclick="openHistoryModal()" class="w-full py-2 text-slate-400 text-xs hover:text-sunny-red text-center">ดูประวัติ</button>`;
}

function renderNews() {
    const c = document.getElementById('news-container');
    if(!c || typeof appConfig === 'undefined' || !appConfig.newsItems) return;
    if(appConfig.newsItems.length === 0) { c.classList.add('hidden'); return; }
    c.classList.remove('hidden');
    
    const w = document.getElementById('pinned-news-wrapper');
    if(w) {
        w.innerHTML = '';
        appConfig.newsItems.filter(n=>n.pinned).forEach(n => {
            w.innerHTML += `<div class="bg-red-50 p-2 border border-red-100 rounded mb-2 text-sm">📌 <b>${n.badgeLabel||'ประกาศ'}:</b> ${n.text}</div>`;
        });
    }
}

// =========================================
// 5. ADMIN & AUTH (Simplified)
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
function logoutAdmin() { localStorage.removeItem('isAdminLoggedIn'); closeConfig(); }

function openConfig() {
    if(typeof appConfig === 'undefined') return alert("System Loading...");
    tempConfig = JSON.parse(JSON.stringify(appConfig));
    document.getElementById('adminConfigModal').classList.remove('hidden');
    renderAdminCalcInputs();
    switchAdminTab('menu');
}

function saveConfig() {
    appConfig = JSON.parse(JSON.stringify(tempConfig));
    if(typeof db !== 'undefined') {
        db.collection("app_settings").doc("config").set(appConfig).then(()=>{
            showToast("บันทึกสำเร็จ");
            closeConfig();
            renderSidebar();
            renderNews();
        }).catch(e => alert("Save Error: "+e.message));
    }
}
function closeConfig() { document.getElementById('adminConfigModal').classList.add('hidden'); }

// Admin Tabs & Renderers (Simplified for stability)
function switchAdminTab(tab) {
    ['menu','news','calc'].forEach(t => { 
        const el = document.getElementById('tab-content-'+t);
        const btn = document.getElementById('tab-btn-'+t);
        if(el) el.classList.add('hidden');
        if(btn) btn.className = "px-4 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500";
    });
    document.getElementById('tab-content-'+tab).classList.remove('hidden');
    document.getElementById('tab-btn-'+tab).className = "px-4 py-3 text-sm font-bold border-b-2 border-sunny-red text-sunny-red";
    
    if(tab==='menu') renderAdminMenu();
    if(tab==='news') renderAdminNews();
}

function renderAdminCalcInputs() {
    const c = document.getElementById('tab-content-calc');
    if(!c) return;
    if(!tempConfig.calcSettings) tempConfig.calcSettings = { enabled: true, wood:{}, pvc:{}, roller:{} };
    const w = tempConfig.calcSettings.wood || {};
    c.innerHTML = `
        <div class="p-4 bg-slate-50 border rounded mb-4 flex justify-between"><span class="font-bold">ระบบคำนวณ</span><input type="checkbox" ${tempConfig.calcSettings.enabled?'checked':''} onchange="tempConfig.calcSettings.enabled=this.checked"></div>
        <div class="space-y-2 text-sm">
            <b>Wood Price:</b><br>
            Basswood: <input type="number" value="${w.priceBasswood||0}" class="border p-1 w-20" onchange="tempConfig.calcSettings.wood.priceBasswood=Number(this.value)">
            Foamwood: <input type="number" value="${w.priceFoamwood||0}" class="border p-1 w-20" onchange="tempConfig.calcSettings.wood.priceFoamwood=Number(this.value)">
        </div>`;
}

function renderAdminMenu() {
    const l = document.getElementById('admin-menu-list');
    if(!l) return;
    l.innerHTML = '';
    if(tempConfig.menus) tempConfig.menus.forEach((m,i) => {
        l.innerHTML += `<div class="p-2 border mb-1 flex gap-2 bg-white"><input value="${m.name}" class="border flex-1" onchange="tempConfig.menus[${i}].name=this.value"><input type="checkbox" ${m.active?'checked':''} onchange="tempConfig.menus[${i}].active=this.checked"></div>`;
    });
}

function renderAdminNews() {
    const l = document.getElementById('admin-news-list');
    if(!l) return;
    l.innerHTML = `<button onclick="addNewNewsItem()" class="w-full border p-2 mb-2">+ ข่าวใหม่</button>`;
    if(tempConfig.newsItems) tempConfig.newsItems.forEach((n,i) => {
        l.innerHTML += `<div class="p-2 border mb-1 bg-white flex gap-2"><input value="${n.text}" class="border flex-1" onchange="tempConfig.newsItems[${i}].text=this.value"><button onclick="deleteNews(${i})" class="text-red-500">ลบ</button></div>`;
    });
}
function addNewNewsItem() { if(!tempConfig.newsItems) tempConfig.newsItems=[]; tempConfig.newsItems.unshift({text:'New', pinned:false, date:new Date().toISOString(), id:Date.now()}); renderAdminNews(); }
function deleteNews(i) { tempConfig.newsItems.splice(i,1); renderAdminNews(); }

// --- AUTH & PWA ---
function loginWithGoogle() { if(auth) auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(r => { showToast("Login OK"); renderUserSidebar(r.user); }); }
function logoutUser() { if(auth) auth.signOut().then(() => { showToast("Logged Out"); renderUserSidebar(null); }); }
function checkPwaStatus() { const b = document.getElementById('pwaInstallBtn'); if(b && !window.matchMedia('(display-mode: standalone)').matches) b.classList.remove('hidden'); }
function installApp() { if(deferredPrompt) deferredPrompt.prompt(); }
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; checkPwaStatus(); });

// --- PLACEHOLDERS TO PREVENT ERRORS ---
function setupAutocomplete() {} 
function switchSystem() {} 
function toggleSidebar() { const s=document.getElementById('sidebar'); if(s) s.classList.toggle('-translate-x-full'); const o=document.getElementById('sidebarOverlay'); if(o) o.classList.toggle('hidden'); }
function toggleHelpModal(show) { document.getElementById('helpModal').classList.toggle('hidden', !show); }
function toggleCodeListModal(show) { document.getElementById('codeListModal').classList.toggle('hidden', !show); }
