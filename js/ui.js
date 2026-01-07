// --- RICH TEXT & EMOJI UTILS ---
const EMOJI_LIST = [
    '📢', '🔥', '✨', '🎉', '⚠️', '🚨', '✅', '❌', '🟢', '🔴', 
    '📅', '🕒', '📌', '📍', '💡', '🚚', '📦', '🎁', '🏷️', '🛒',
    '💬', '📞', '📧', '🏠', '🏢', '🛠️', '🔧', '⚙️', '📈', '💰',
    '❤️', '👍', '⭐', '🌟', '🆕', '🆓', '🆔', '👉', '➡️', '🛑'
];

// --- GLOBAL VARIABLES ---
let currentUserProfile = null;
let tempQuotes = []; 
let tempConfig = {}; 
let deferredPrompt; 
let configListenerSet = false;
let currentSystem = 'WOOD'; // ค่าเริ่มต้น
let calcMode = 'WOOD_CALC'; // ค่าเริ่มต้น

// --- ICONS (กัน Error) ---
const ICONS = {
    'wood': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>',
    'curtain': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2"></path></svg>'
};

// --- UTILS ---
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
            currentUserProfile = null; 
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

// --- UI RENDERING ---
function renderUserSidebar(user) {
    const container = document.getElementById('user-profile-section');
    if (!container) return; 

    if (user && !user.isAnonymous) {
        const displayName = (currentUserProfile && currentUserProfile.displayName) ? currentUserProfile.displayName : user.displayName;
        const shopNameLabel = (currentUserProfile && currentUserProfile.shopName) ? `<div class="text-[10px] text-sunny-red font-bold truncate">${currentUserProfile.shopName}</div>` : '';

        container.innerHTML = `
            <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100 mb-2">
                <img src="${user.photoURL || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full border-2 border-white shadow-sm">
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-slate-400">สวัสดี,</div>
                    <div class="text-sm font-bold text-slate-700 truncate">${displayName}</div>
                    ${shopNameLabel}
                </div>
                <button onclick="logoutUser()" class="text-slate-400 hover:text-red-500 p-1" title="ออกจากระบบ">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
            
            <button onclick="openEditProfile()" class="w-full mb-2 flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-sunny-red hover:border-red-100 transition-all shadow-sm">
                ✏️ แก้ไขข้อมูลร้านค้า
            </button>

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

// --- USER PROFILE & SHOP SETTINGS ---
function openEditProfile() {
    const modal = document.getElementById('editProfileModal');
    if(!modal) return;
    modal.classList.remove('hidden');

    const nameInput = document.getElementById('edit-profile-name');
    const shopNameInput = document.getElementById('edit-shop-name');
    const shopAddrInput = document.getElementById('edit-shop-address');
    const logoPreview = document.getElementById('logo-preview');
    const logoInput = document.getElementById('edit-shop-logo-base64');

    if(currentUserProfile) {
        nameInput.value = currentUserProfile.displayName || currentUser.displayName || '';
        shopNameInput.value = currentUserProfile.shopName || '';
        shopAddrInput.value = currentUserProfile.shopAddress || '';
        if(currentUserProfile.shopLogo) {
            logoPreview.innerHTML = `<img src="${currentUserProfile.shopLogo}" class="w-full h-full object-cover">`;
            logoInput.value = currentUserProfile.shopLogo;
        } else {
            logoPreview.innerHTML = `<span class="text-[8px] text-slate-300">No Img</span>`;
            logoInput.value = '';
        }
    } else {
        nameInput.value = currentUser.displayName || '';
    }
}

function closeEditProfile() {
    document.getElementById('editProfileModal').classList.add('hidden');
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 500 * 1024) {
            alert("ขนาดไฟล์รูปภาพต้องไม่เกิน 500KB");
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            document.getElementById('logo-preview').innerHTML = `<img src="${base64}" class="w-full h-full object-cover">`;
            document.getElementById('edit-shop-logo-base64').value = base64;
            document.getElementById('logo-file-label').innerText = file.name;
        }
        reader.readAsDataURL(file);
    }
}

function saveUserProfile() {
    if(!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const name = document.getElementById('edit-profile-name').value.trim();
    const shopName = document.getElementById('edit-shop-name').value.trim();
    const address = document.getElementById('edit-shop-address').value.trim();
    const logo = document.getElementById('edit-shop-logo-base64').value;

    const dataToSave = {
        displayName: name,
        shopName: shopName,
        shopAddress: address,
        shopLogo: logo
    };

    db.collection('users').doc(uid).set(dataToSave, { merge: true }).then(() => {
        showToast("บันทึกข้อมูลเรียบร้อย");
        closeEditProfile();
        currentUserProfile = dataToSave;
        renderUserSidebar(currentUser);
    }).catch(e => {
        alert("เกิดข้อผิดพลาด: " + e.message);
    });
}

function renderSidebar() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    
    let html = `<div class="px-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">เช็คสต็อกสินค้า</div>`;
    
    // Safety check
    const menus = (typeof appConfig !== 'undefined' && appConfig.menus) ? appConfig.menus : [];

    menus.forEach(menu => {
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

    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    // Check config safely
    if ((typeof appConfig !== 'undefined' && appConfig.calcSettings && appConfig.calcSettings.enabled) || isAdmin) {
        html += `<div class="px-6 mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between"><span>ระบบคำนวณราคา</span>${(typeof appConfig !== 'undefined' && !appConfig.calcSettings.enabled) ? '<span class="text-[9px] bg-red-100 text-red-500 px-1 rounded">Admin Only</span>' : ''}</div>`;
        const calcClass = "group flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-200 ease-out border-l-4 border-transparent hover:border-indigo-900";
        const iconRollerExt = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;
        const iconRollerInt = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>`;
        const iconPVC = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>`;
        const iconWood = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`;
        const iconAlu = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.357a4 4 0 014.187 6.187H15" /></svg>`;

        html += `
            <a href="#" onclick="switchCalcMode('EXT')" class="${calcClass}"><div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconRollerExt}</div><span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">ม่านม้วนภายนอก</span></a>
            <a href="#" onclick="switchCalcMode('INT')" class="${calcClass}"><div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconRollerInt}</div><span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">ม่านม้วน (ภายใน)</span></a>
            <a href="#" onclick="switchCalcMode('PVC_CALC')" class="${calcClass}"><div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconPVC}</div><span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">ฉากกั้นห้อง PVC</span></a>
            <a href="#" onclick="switchCalcMode('WOOD_CALC')" class="${calcClass}"><div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconWood}</div><span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">มู่ลี่ไม้</span></a>
            <a href="#" onclick="switchCalcMode('ALU25')" class="${calcClass}"><div class="w-8 flex justify-center mr-2 transition-transform group-hover:scale-110 duration-200">${iconAlu}</div><span class="font-medium text-sm transition-transform group-hover:translate-x-1 duration-200">มู่ลี่อลูมิเนียม 25mm.</span></a>
        `;
    }
    
    container.innerHTML = html;
    const titleEl = document.getElementById('app-title-display');
    if(titleEl && typeof appConfig !== 'undefined') titleEl.innerText = appConfig.appTitle;
    
    renderUserSidebar(currentUser);
    checkPwaStatus();
}

function renderNews() {
    const container = document.getElementById('news-container');
    const pinnedWrapper = document.getElementById('pinned-news-wrapper');
    const scrollWrapper = document.getElementById('scrolling-news-wrapper');
    const scrollTrack = document.getElementById('news-ticker-track');
    
    if (!document.getElementById('ticker-style-injection')) {
        const style = document.createElement('style');
        style.id = 'ticker-style-injection';
        style.innerHTML = `@keyframes verticalSlide { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }`;
        document.head.appendChild(style);
    }
    
    const news = (typeof appConfig !== 'undefined' && appConfig.newsItems) ? appConfig.newsItems : [];
    if(news.length === 0) {
        if(container) container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    
    const pinnedItems = news.filter(n => n.pinned);
    const scrollItems = news.filter(n => !n.pinned);
    
    pinnedWrapper.innerHTML = '';
    const isDateNew = (d) => { if(!d) return false; return (new Date() - new Date(d)) / (1000 * 60 * 60 * 24) < 7; };
    const formatDate = (d) => { if(!d) return ''; return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }); };

    pinnedItems.forEach(item => {
        const isNew = isDateNew(item.date);
        const el = document.createElement('div');
        el.className = "bg-gradient-to-r from-red-50 to-white border border-red-100 p-3 rounded-xl shadow-sm flex items-start gap-3 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5";
        el.innerHTML = `
            <div class="absolute top-0 left-0 w-1 h-full bg-sunny-red"></div>
            <div class="text-sunny-red mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg></div>
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    ${isNew ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm" style="background-color: ${item.badgeColor}; color: ${item.badgeTextColor}">${item.badgeLabel}</span>` : ''}
                    <span class="text-[10px] text-slate-400 font-medium bg-white px-1.5 rounded border border-slate-100">${formatDate(item.date)}</span>
                </div>
                <p class="text-sm font-semibold whitespace-normal break-words leading-relaxed" style="color: ${item.textColor}">${item.text}</p>
            </div>`;
        pinnedWrapper.appendChild(el);
    });
    
    if (scrollItems.length > 0) {
        scrollWrapper.classList.remove('hidden');
        scrollTrack.innerHTML = '';
        scrollTrack.classList.remove('p-2'); 
        let itemsHtml = '';
        scrollItems.forEach(item => {
            const isNew = isDateNew(item.date);
            itemsHtml += `
                <div class="h-28 flex items-center gap-3 px-4 w-full shrink-0 hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 box-border">
                    <div class="flex-1 min-w-0 flex flex-col justify-center h-full">
                        <div class="flex items-center gap-2 mb-1">
                            ${isNew ? `<span class="px-2 py-0.5 rounded-[4px] text-[9px] font-bold shadow-sm" style="background-color: ${item.badgeColor}; color: ${item.badgeTextColor}">${item.badgeLabel}</span>` : ''}
                            <span class="text-[10px] text-slate-400 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${formatDate(item.date)}</span>
                        </div>
                        <div class="text-sm font-medium whitespace-normal break-words leading-snug line-clamp-3" style="color: ${item.textColor}">${item.text}</div>
                    </div>
                </div>`;
        });
        scrollTrack.innerHTML = itemsHtml + itemsHtml;
        const settings = (typeof appConfig !== 'undefined' && appConfig.newsSettings) ? appConfig.newsSettings : { speed: 3 };
        let speedVal = parseInt(settings.speed);
        if (isNaN(speedVal) || speedVal < 1) speedVal = 3;
        const durationPerItem = 11 - (speedVal * 1.5); 
        const totalDuration = Math.max(durationPerItem * scrollItems.length, 2);
        scrollTrack.style.animation = 'none';
        scrollTrack.offsetHeight; 
        scrollTrack.style.animation = `verticalSlide ${totalDuration}s linear infinite`;
        scrollWrapper.onmouseenter = () => scrollTrack.style.animationPlayState = 'paused';
        scrollWrapper.onmouseleave = () => scrollTrack.style.animationPlayState = 'running';
    } else {
        scrollWrapper.classList.add('hidden');
    }
}

function checkAdminLogin() { if (localStorage.getItem('isAdminLoggedIn') === 'true') { openConfig(); } else { openAdminLogin(); } }
function openAdminLogin() { document.getElementById('adminLoginModal').classList.remove('hidden'); document.getElementById('adminPassword').value=''; document.getElementById('loginError').classList.add('hidden'); document.getElementById('adminPassword').focus(); }
function closeAdminLogin() { document.getElementById('adminLoginModal').classList.add('hidden'); }
function handleLogin() { if(document.getElementById('adminPassword').value === 'sn1988') { localStorage.setItem('isAdminLoggedIn', 'true'); closeAdminLogin(); showToast("เข้าสู่ระบบสำเร็จ"); openConfig(); renderSidebar(); } else { document.getElementById('loginError').classList.remove('hidden'); } }
function logoutAdmin() { localStorage.removeItem('isAdminLoggedIn'); closeConfig(); showToast("ออกจากระบบแล้ว"); renderSidebar(); }
function openConfig() { tempConfig = JSON.parse(JSON.stringify(appConfig)); const modal = document.getElementById('adminConfigModal'); if(modal) modal.classList.remove('hidden'); const titleInp = document.getElementById('conf-app-title'); if(titleInp) titleInp.value = tempConfig.appTitle; const speedInp = document.getElementById('conf-news-speed'); const safeSettings = tempConfig.newsSettings || { speed: 3 }; if(speedInp) speedInp.value = safeSettings.speed || 3; const logoutBtn = document.getElementById('logoutBtn'); if(logoutBtn) logoutBtn.classList.remove('hidden'); const calcEn = document.getElementById('conf-calc-enabled'); if(calcEn) calcEn.checked = tempConfig.calcSettings.enabled; renderAdminCalcInputs(); const theme = tempConfig.theme || 'default'; const radios = document.getElementsByName('app-theme'); for(const r of radios) { r.checked = (r.value === theme); } const st = document.getElementById('admin-mode-status'); if(st) { const isConnected = auth && auth.currentUser; st.innerText = isConnected ? "สถานะ: Online Mode" : "สถานะ: Offline Mode"; st.className = isConnected ? "text-xs font-bold text-green-600" : "text-xs font-bold text-red-600"; } switchAdminTab('dashboard'); }
function closeConfig() { applyTheme(appConfig.theme); document.getElementById('adminConfigModal').classList.add('hidden'); }
function saveConfig() { tempConfig.appTitle = document.getElementById('conf-app-title').value; if (!tempConfig.newsSettings) tempConfig.newsSettings = {}; tempConfig.newsSettings.speed = parseInt(document.getElementById('conf-news-speed').value) || 3; appConfig = tempConfig; applyTheme(appConfig.theme); db.collection("app_settings").doc("config").set(appConfig).then(()=>{ showToast("บันทึกสำเร็จ"); closeConfig(); renderSidebar(); renderNews(); }); }
function switchAdminTab(tab) { ['menu','news','calc','saved', 'theme', 'features', 'dashboard'].forEach(t => { const btn = document.getElementById('tab-btn-'+t); const content = document.getElementById('tab-content-'+t); if(btn) btn.className = "px-4 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:bg-slate-50 whitespace-nowrap flex items-center gap-1"; if(content) content.classList.add('hidden'); }); const activeBtn = document.getElementById('tab-btn-'+tab); const activeContent = document.getElementById('tab-content-'+tab); if(activeBtn) activeBtn.className = "px-4 py-3 text-sm font-bold border-b-2 border-sunny-red text-sunny-red bg-red-50 whitespace-nowrap flex items-center gap-1"; if(activeContent) activeContent.classList.remove('hidden'); if(tab === 'menu') renderAdminMenu(); if(tab === 'news') renderAdminNews(); if(tab === 'saved') renderQuotationsList('saved-quotations-list', 'all'); if(tab === 'features') renderAdminFeatures(); if(tab === 'dashboard') renderAdminDashboard(); }
function toggleSidebar() { const sb = document.getElementById('sidebar'); const ov = document.getElementById('sidebarOverlay'); sb.classList.toggle('-translate-x-full'); ov.classList.toggle('hidden'); }
function requestNotificationPermission() { if (!("Notification" in window)) return alert("อุปกรณ์ไม่รองรับ"); Notification.requestPermission().then(p => { if (p === "granted") showToast("เปิดแจ้งเตือนแล้ว"); else alert("กรุณากดอนุญาตเพื่อรับแจ้งเตือน"); renderSidebar(); }); }
function checkAndNotifyNews(newsItems) { if (!newsItems || newsItems.length === 0) return; const latest = [...newsItems].sort((a,b) => b.id - a.id)[0]; const lastId = parseInt(localStorage.getItem('last_notified_news_id') || '0'); if (latest.id > lastId) { if (Notification.permission === "granted") new Notification("ประกาศใหม่", { body: latest.text, icon: "https://via.placeholder.com/128" }); else showToast("ประกาศใหม่: " + latest.text); localStorage.setItem('last_notified_news_id', latest.id); } }
function applyTheme(theme) { document.body.classList.remove('theme-christmas'); let primary = '#E63946', dark = '#1D3557', showScene = 'none'; if (theme === 'christmas') { document.body.classList.add('theme-christmas'); primary = '#D62828'; dark = '#14532D'; showScene = 'block'; } const scene = document.getElementById('xmas-scene'); if(scene) scene.style.display = showScene; document.querySelector('meta[name="theme-color"]').setAttribute("content", primary); document.documentElement.style.setProperty('--sunny-red', primary); document.documentElement.style.setProperty('--sunny-dark', dark); }

// --- RESTORED ADMIN FUNCTIONS (จากไฟล์ที่ใช้งานได้) ---

function renderAdminMenu() {
    const container = document.getElementById('admin-menu-list'); // แก้ ID ให้ตรง HTML
    if (!container) return;
    
    // Safety check
    if (!tempConfig.menus || !Array.isArray(tempConfig.menus)) {
        tempConfig.menus = (appConfig.menus && Array.isArray(appConfig.menus)) ? JSON.parse(JSON.stringify(appConfig.menus)) : [];
    }

    container.innerHTML = '';
    tempConfig.menus.forEach((menu, idx) => {
        const iconDisplay = (typeof ICONS !== 'undefined' && ICONS[menu.icon]) ? ICONS[menu.icon] : '?';
        container.innerHTML += `
            <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-3 mb-2">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-slate-100 rounded text-slate-500 w-8 h-8 flex justify-center items-center">${iconDisplay}</div>
                    <div class="flex-grow space-y-1">
                        <input type="text" value="${menu.name}" onchange="tempConfig.menus[${idx}].name=this.value" class="w-full p-1 border rounded text-sm font-bold">
                        <input type="text" value="${menu.sub}" onchange="tempConfig.menus[${idx}].sub=this.value" class="w-full p-1 border rounded text-xs text-slate-500">
                    </div>
                    <div class="flex flex-col items-center">
                        <input type="checkbox" ${menu.active?'checked':''} onchange="tempConfig.menus[${idx}].active=this.checked" class="w-5 h-5 accent-sunny-red cursor-pointer">
                    </div>
                </div>
                <div class="text-[9px] text-slate-400 text-center">จัดการรูปภาพพื้นหลังได้ในฐานข้อมูล</div>
            </div>`;
    });
}

function renderAdminNews() {
    const list = document.getElementById('admin-news-list'); 
    if(!list) return;
    list.innerHTML = '';
    
    if(!tempConfig.newsItems || !Array.isArray(tempConfig.newsItems)) {
        tempConfig.newsItems = [];
    }

    const sorted = [...tempConfig.newsItems].sort((a,b) => (b.pinned===a.pinned)? 0 : b.pinned? 1 : -1);
    
    sorted.forEach((item, idx) => {
        const realIdx = tempConfig.newsItems.findIndex(x => x.id === item.id);
        
        list.innerHTML += `
            <div class="p-4 rounded-xl border ${item.pinned ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'} mb-4">
                <div class="flex justify-between gap-3 mb-2">
                    <div class="flex-1">
                        <label class="text-[10px] text-slate-400 font-bold">ข้อความประกาศ</label>
                        <div contenteditable="true" class="w-full p-2 text-sm border rounded bg-white min-h-[40px]" oninput="tempConfig.newsItems[${realIdx}].text = this.innerHTML">${item.text}</div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button onclick="togglePinNews(${realIdx})" class="${item.pinned?'text-white bg-sunny-red':'text-slate-400 bg-white border'} p-2 rounded-lg shadow-sm">📌</button>
                        <button onclick="deleteNews(${realIdx})" class="text-slate-400 hover:text-red-500 bg-white border p-2 rounded-lg shadow-sm">🗑️</button>
                    </div>
                </div>
                <div class="text-[10px] text-slate-400 text-right">${new Date(item.date).toLocaleDateString('th-TH')}</div>
            </div>`;
    });
}

function togglePinNews(idx) {
    if(tempConfig.newsItems[idx]) {
        tempConfig.newsItems[idx].pinned = !tempConfig.newsItems[idx].pinned;
        renderAdminNews();
    }
}

function addNewNewsItem() { 
    if(!tempConfig.newsItems) tempConfig.newsItems = [];
    tempConfig.newsItems.unshift({ 
        id: Date.now(), text: "ประกาศใหม่...", date: new Date().toISOString(), 
        pinned: false, badgeLabel: "NEW!", badgeColor: "#E63946", badgeTextColor: "#FFFFFF", textColor: "#334155" 
    }); 
    renderAdminNews(); 
}

function deleteNews(idx) { 
    if(confirm('ลบประกาศนี้?')) {
        tempConfig.newsItems.splice(idx, 1); 
        renderAdminNews(); 
    }
}

// --- APP INIT (FIXED) ---
function initFirebase() {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                if (!user.isAnonymous) {
                    db.collection('users').doc(user.uid).onSnapshot(doc => {
                        currentUserProfile = doc.exists ? doc.data() : null;
                        if(typeof renderUserSidebar === 'function') renderUserSidebar(user);
                    });
                }
                if(typeof renderUserSidebar === 'function') renderUserSidebar(user);
                
                if (!configListenerSet) {
                    db.collection("app_settings").doc("config").onSnapshot((doc) => {
                        if (doc.exists) {
                            const newData = doc.data();
                            if(typeof checkAndNotifyNews === 'function') checkAndNotifyNews(newData.newsItems || []);
                            appConfig = newData;
                            if(!appConfig.calcSettings) appConfig.calcSettings = DEFAULT_CONFIG.calcSettings;
                            if(!appConfig.newsItems) appConfig.newsItems = [];
                            if(!appConfig.theme) appConfig.theme = 'default';
                            localStorage.setItem('sunny_app_config', JSON.stringify(appConfig));
                            if(typeof renderSidebar === 'function') renderSidebar(); 
                            if(typeof renderNews === 'function') renderNews(); 
                            if(typeof applyTheme === 'function') applyTheme(appConfig.theme);
                            if(typeof currentSystem !== 'undefined' && typeof switchSystem === 'function') switchSystem(currentSystem);
                        } else { 
                            db.collection("app_settings").doc("config").set(appConfig); 
                        }
                    }, error => console.error("Config Listener Error:", error));
                    configListenerSet = true;
                }
            } else {
                auth.signInAnonymously().catch(e => console.error("Anon Auth Error:", e));
            }
        });
    } catch (e) { console.error("Firebase Init Error:", e); }
}

// --- PWA (ANDROID ONLY) ---
function checkPwaStatus() { 
    const sidebarBtn = document.getElementById('pwaInstallBtn'); 
    const headerBtn = document.getElementById('headerInstallBtn'); 
    
    // Check if iOS (Removed modal logic)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if(isStandalone || isIOS) { 
        if(sidebarBtn) sidebarBtn.classList.add('hidden'); 
        if(headerBtn) headerBtn.classList.add('hidden'); 
        return; 
    } 
    
    if(headerBtn) headerBtn.classList.remove('hidden'); 
    if(sidebarBtn) sidebarBtn.classList.remove('hidden');

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => { deferredPrompt = null; });
        } else {
            alert("ติดตั้งแอพได้จากเมนูของเบราว์เซอร์\nเลือก 'Install App' หรือ 'Add to Home Screen'");
        }
    };

    if(headerBtn) headerBtn.onclick = handleInstall;
    if(sidebarBtn) sidebarBtn.onclick = handleInstall;
}

window.addEventListener('beforeinstallprompt', (e) => { 
    e.preventDefault(); 
    deferredPrompt = e; 
    checkPwaStatus(); 
});

window.addEventListener('DOMContentLoaded', () => { 
    initFirebase();
    if(typeof renderSidebar === 'function') renderSidebar();
    
    // ใส่ try-catch กันพัง ถ้าฟังก์ชันหาย
    try { if(typeof setupAutocomplete === 'function') setupAutocomplete(); } catch(e){}
    try { checkPwaStatus(); } catch(e){}
    try { if(typeof renderNews === 'function') renderNews(); } catch(e){}

    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');

    setTimeout(() => {
        if (sharedMode && typeof checkUrlParams === 'function') { 
            checkUrlParams(); 
        } else { 
            if(typeof switchSystem === 'function') switchSystem('WOOD'); 
        }
    }, 500);

    // Force Remove Splash Screen
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if(s) { s.classList.add('opacity-0', 'pointer-events-none'); setTimeout(() => s.remove(), 700); }
    }, 1500);
});

// --- DUMMY FUNCTIONS (ป้องกัน Error ถ้าของจริงหาย) ---
function switchSystem(sysId) {
    currentSystem = sysId;
    renderSidebar();
    // ถ้าฟังก์ชันจริงหายไป โค้ดนี้จะช่วยให้เว็บไม่พัง
    console.log("Switch System:", sysId);
}

function switchCalcMode(mode) {
    calcMode = mode;
    console.log("Switch Calc Mode:", mode);
    // Logic เปิดหน้าคำนวณ (ถ้ามี)
}
