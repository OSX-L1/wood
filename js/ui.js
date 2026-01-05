// --- RICH TEXT & EMOJI UTILS ---
const EMOJI_LIST = [
    '📢', '🔥', '✨', '🎉', '⚠️', '🚨', '✅', '❌', '🟢', '🔴', 
    '📅', '🕒', '📌', '📍', '💡', '🚚', '📦', '🎁', '🏷️', '🛒',
    '💬', '📞', '📧', '🏠', '🏢', '🛠️', '🔧', '⚙️', '📈', '💰',
    '❤️', '👍', '⭐', '🌟', '🆕', '🆓', '🆔', '👉', '➡️', '🛑'
];

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
        });
    }
}

// --- SHARING FUNCTION ---
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

// --- URL PARSER (Deep Link Logic Updated) ---
function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');
    
    if (sharedMode) {
        console.log("Deep Link Detected:", sharedMode);
        
        // 1. ซ่อนส่วนที่ไม่เกี่ยวข้องทันที
        const searchSection = document.getElementById('searchSection');
        const newsContainer = document.getElementById('news-container');
        
        if(searchSection) searchSection.classList.add('hidden');
        if(newsContainer) newsContainer.classList.add('hidden');

        // 2. เรียกเปิดเครื่องคิดเลข (หน่วงเวลานิดหน่อยเพื่อให้ calc.js โหลดเสร็จ)
        setTimeout(() => {
            if(typeof switchCalcMode === 'function') {
                switchCalcMode(sharedMode);
                
                // เลื่อนหน้าจอลงมาหาเครื่องคิดเลข
                const calcSec = document.getElementById('calculatorSection');
                if(calcSec) {
                    calcSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);
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
    
    // PART 1: Stock Menu
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

    // PART 2: Calculator Menu
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

// Helpers attached to window for inline onclicks in Admin Menu
window.addMenuImage = (menuIdx, slotKey) => {
    let current = tempConfig.menus[menuIdx][slotKey] || '';
    let arr = current.split(',').map(s => s.trim());
    if (arr.length === 1 && arr[0] === '') arr = [];
    arr.push(''); 
    if(arr.length === 1 && arr[0] === '') tempConfig.menus[menuIdx][slotKey] = ' '; 
    else tempConfig.menus[menuIdx][slotKey] = arr.join(',');
    renderAdminMenu();
};

window.updateMenuImage = (menuIdx, slotKey, imgIdx, newValue) => {
    let current = tempConfig.menus[menuIdx][slotKey] || '';
    let arr = current.split(','); 
    arr = arr.map(s => s.trim());
    if (arr.length === 1 && arr[0] === '') arr = [];
    while(arr.length <= imgIdx) arr.push('');
    arr[imgIdx] = newValue.trim();
    tempConfig.menus[menuIdx][slotKey] = arr.join(',');
};

window.removeMenuImage = (menuIdx, slotKey, imgIdx) => {
    let current = tempConfig.menus[menuIdx][slotKey] || '';
    let arr = current.split(',').map(s => s.trim());
    if (arr.length === 1 && arr[0] === '') arr = [];
    arr.splice(imgIdx, 1);
    tempConfig.menus[menuIdx][slotKey] = arr.join(',');
    renderAdminMenu();
};

function renderAdminNews() {
    const list = document.getElementById('admin-news-list'); 
    list.innerHTML = '';
    const sorted = [...tempConfig.newsItems].sort((a,b) => (b.pinned===a.pinned)? 0 : b.pinned? 1 : -1);
    
    sorted.forEach((item, idx) => {
        const realIdx = tempConfig.newsItems.findIndex(x => x.id === item.id);
        
        let emojiGridText = EMOJI_LIST.map(e => `<button onclick="insertEmoji(${realIdx}, '${e}', 'text')" class="text-xl hover:bg-slate-100 p-2 rounded transition-colors">${e}</button>`).join('');
        let emojiGridBadge = EMOJI_LIST.map(e => `<button onclick="insertEmoji(${realIdx}, '${e}', 'badge')" class="text-xl hover:bg-slate-100 p-2 rounded transition-colors">${e}</button>`).join('');

        const createToolbar = (type) => `
            <div class="flex gap-1 mb-1.5 flex-wrap items-center">
                <button onmousedown="event.preventDefault()" onclick="execCmd('bold')" class="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-50 hover:text-sunny-red min-w-[24px]">B</button>
                <button onmousedown="event.preventDefault()" onclick="execCmd('italic')" class="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] italic hover:bg-slate-50 hover:text-sunny-red min-w-[24px]">I</button>
                <button onmousedown="event.preventDefault()" onclick="execCmd('underline')" class="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] underline hover:bg-slate-50 hover:text-sunny-red min-w-[24px]">U</button>
                <div class="w-px h-6 bg-slate-200 mx-1"></div>
                <button onmousedown="event.preventDefault()" onclick="document.getElementById('emoji-picker-${type === 'badge' ? 'badge-' : ''}${realIdx}').classList.toggle('hidden')" class="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50 hover:text-sunny-red">😀</button>
            </div>
        `;

        list.innerHTML += `
            <div class="p-4 rounded-xl border ${item.pinned ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'} relative group shadow-sm mb-4">
                <div class="flex flex-col gap-3">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex-1 space-y-2">
                            <div class="flex justify-between items-end"><label class="text-[10px] text-slate-400 font-bold uppercase">ข้อความประกาศ</label></div>
                            ${createToolbar('text')}
                            <div class="relative">
                                <div id="news-edit-${realIdx}" contenteditable="true" class="w-full p-2 text-sm border rounded bg-white focus:outline-none focus:ring-1 focus:ring-sunny-red min-h-[60px] max-h-32 overflow-y-auto font-sans" oninput="tempConfig.newsItems[${realIdx}].text = this.innerHTML">${item.text}</div>
                                <div id="emoji-picker-${realIdx}" class="hidden absolute top-8 left-0 z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-2 w-64 mt-1">
                                    <div class="flex justify-between items-center px-2 pb-2 border-b border-slate-100 mb-2"><span class="text-xs font-bold text-slate-400">เลือก Emoji</span><button onclick="document.getElementById('emoji-picker-${realIdx}').classList.add('hidden')" class="text-slate-300 hover:text-red-500 text-xs">✕</button></div>
                                    <div class="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto custom-scrollbar">${emojiGridText}</div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2 pt-8">
                            <button onclick="togglePinNews(${realIdx})" class="${item.pinned?'text-white bg-sunny-red':'text-slate-400 bg-white border'} p-2 rounded-lg shadow-sm transition-all hover:scale-105" title="${item.pinned?'ยกเลิกปักหมุด':'ปักหมุด'}"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg></button>
                            <button onclick="deleteNews(${realIdx})" class="text-slate-400 hover:text-red-500 bg-white border p-2 rounded-lg shadow-sm transition-all hover:scale-105" title="ลบ"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-200 pt-3 mt-1">
                        <div class="relative">
                            <label class="block text-[10px] text-slate-500 font-bold mb-1">ข้อความป้าย (Badge)</label>
                            <div class="flex items-center gap-1 mb-1">
                                <button onmousedown="event.preventDefault()" onclick="document.getElementById('emoji-picker-badge-${realIdx}').classList.toggle('hidden')" class="p-1 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50">😀</button>
                            </div>
                            <div id="badge-edit-${realIdx}" contenteditable="true" class="w-full p-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-sunny-red font-bold text-slate-600 bg-white min-h-[30px] whitespace-nowrap overflow-hidden" oninput="tempConfig.newsItems[${realIdx}].badgeLabel = this.innerHTML">${item.badgeLabel}</div>
                            <div id="emoji-picker-badge-${realIdx}" class="hidden absolute bottom-full left-0 mb-1 z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-2 w-64">
                                <div class="flex justify-between items-center px-2 pb-2 border-b border-slate-100 mb-2"><span class="text-xs font-bold text-slate-400">Emoji (ป้าย)</span><button onclick="document.getElementById('emoji-picker-badge-${realIdx}').classList.add('hidden')" class="text-slate-300 hover:text-red-500 text-xs">✕</button></div>
                                <div class="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto custom-scrollbar">${emojiGridBadge}</div>
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-500 font-bold mb-1">สีพื้นหลังป้าย</label>
                            <div class="flex items-center gap-2">
                                <input type="color" value="${item.badgeColor}" onchange="tempConfig.newsItems[${realIdx}].badgeColor=this.value" class="h-8 w-10 border rounded cursor-pointer p-0 overflow-hidden">
                                <span class="text-[10px] text-slate-400 font-mono">${item.badgeColor}</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-500 font-bold mb-1">สีตัวอักษรป้าย</label>
                            <div class="flex items-center gap-2">
                                <input type="color" value="${item.badgeTextColor}" onchange="tempConfig.newsItems[${realIdx}].badgeTextColor=this.value" class="h-8 w-10 border rounded cursor-pointer p-0 overflow-hidden">
                                <span class="text-[10px] text-slate-400 font-mono">${item.badgeTextColor}</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-500 font-bold mb-1">สีข้อความหลัก</label>
                            <div class="flex items-center gap-2">
                                <input type="color" value="${item.textColor}" onchange="tempConfig.newsItems[${realIdx}].textColor=this.value" class="h-8 w-10 border rounded cursor-pointer p-0 overflow-hidden">
                                <span class="text-[10px] text-slate-400 font-mono">${item.textColor}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end pt-2 border-t border-slate-100 border-dashed">
                        <div class="flex items-center gap-2">
                            <label class="text-[10px] text-slate-400">วันที่:</label>
                            <input type="date" value="${item.date.split('T')[0]}" onchange="tempConfig.newsItems[${realIdx}].date=this.value" class="text-xs border rounded p-1 text-slate-500 bg-slate-50">
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

function togglePinNews(idx) {
    tempConfig.newsItems[idx].pinned = !tempConfig.newsItems[idx].pinned;
    renderAdminNews();
}

function addNewNewsItem() { 
    tempConfig.newsItems.unshift({ 
        id: Date.now(), 
        text: "ประกาศใหม่...", 
        date: new Date().toISOString(), 
        pinned: false, 
        badgeLabel: "NEW!", 
        badgeColor: "#E63946", 
        badgeTextColor: "#FFFFFF", 
        textColor: "#334155" 
    }); 
    renderAdminNews(); 
}

function deleteNews(idx) { 
    if(confirm('ลบประกาศนี้?')) {
        tempConfig.newsItems.splice(idx, 1); 
        renderAdminNews(); 
    }
}

function renderAdminFeatures() {
    const list = document.getElementById('admin-features-list');
    list.innerHTML = '';
    Object.keys(tempConfig.features).forEach(key => {
        list.innerHTML += `<div class="flex justify-between items-center p-3 bg-white border rounded-xl"><span class="font-mono text-sm">${key}</span><input type="checkbox" ${tempConfig.features[key]?'checked':''} onchange="tempConfig.features['${key}']=this.checked" class="w-5 h-5 accent-purple-600"></div>`;
    });
}

function addNewFeature() {
    const key = document.getElementById('new-feature-key').value.trim();
    if(key) {
        tempConfig.features[key] = false;
        renderAdminFeatures();
        document.getElementById('new-feature-key').value='';
    }
}

function previewTheme(themeName) { applyTheme(themeName); tempConfig.theme = themeName; }

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

// --- APP INIT (FIXED) ---
window.addEventListener('DOMContentLoaded', () => { 
    // 1. Init Firebase
    initFirebase();
    
    // 2. Render UI
    renderSidebar();
    
    // 3. Setup Logic
    setupAutocomplete();
    checkPwaStatus();
    
    // 4. CHECK URL (IMPORTANT)
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');

    if (sharedMode) {
        // CASE: DEEP LINK (ข้ามหน้าค้นหา ไปหน้าคำนวณเลย)
        checkUrlParams(); 
    } else {
        // CASE: NORMAL ENTRY (ไปหน้าค้นหาตามปกติ)
        setTimeout(() => {
            if(typeof switchSystem === 'function') switchSystem('WOOD');
            if(typeof renderNews === 'function') renderNews();
        }, 500);
    }

    // Remove Splash Screen
    const s = document.getElementById('intro-splash');
    if(s) {
        s.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => s.remove(), 700);
    }
});
