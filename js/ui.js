// --- RICH TEXT & EMOJI UTILS ---
const EMOJI_LIST = [
    '📢', '🔥', '✨', '🎉', '⚠️', '🚨', '✅', '❌', '🟢', '🔴', 
    '📅', '🕒', '📌', '📍', '💡', '🚚', '📦', '🎁', '🏷️', '🛒',
    '💬', '📞', '📧', '🏠', '🏢', '🛠️', '🔧', '⚙️', '📈', '💰',
    '❤️', '👍', '⭐', '🌟', '🆕', '🆓', '🆔', '👉', '➡️', '🛑'
];

// --- GLOBAL USER PROFILE VAR ---
let currentUserProfile = null;

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
            currentUserProfile = null; // Clear profile on logout
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
        // ใช้ชื่อจาก Profile ที่ตั้งเอง หรือใช้ชื่อจาก Google
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

    // Pre-fill Data
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
        // Check size (Limit 500KB to prevent Firestore bloat)
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
        // Update Local State
        currentUserProfile = dataToSave;
        renderUserSidebar(currentUser);
    }).catch(e => {
        alert("เกิดข้อผิดพลาด: " + e.message);
    });
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
        
        const calcClass = "group flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-200 ease-out border-l-4 border-transparent hover:border-indigo-900";
        
        const iconRollerExt = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;
        const iconRollerInt = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>`;
        const iconPVC = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>`;
        const iconWood = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`;
        const iconAlu = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.357a4 4 0 014.187 6.187H15" /></svg>`;

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

function renderNews() {
    const container = document.getElementById('news-container');
    const pinnedWrapper = document.getElementById('pinned-news-wrapper');
    const scrollWrapper = document.getElementById('scrolling-news-wrapper');
    const scrollTrack = document.getElementById('news-ticker-track');
    
    // Inject Styles if needed to guarantee animation
    if (!document.getElementById('ticker-style-injection')) {
        const style = document.createElement('style');
        style.id = 'ticker-style-injection';
        style.innerHTML = `
            @keyframes verticalSlide { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
            .ticker-force-run { animation-play-state: running !important; }
        `;
        document.head.appendChild(style);
    }
    
    const news = appConfig.newsItems || [];
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
    
    // --- SCROLLING NEWS LOGIC (REFINED) ---
    if (scrollItems.length > 0) {
        scrollWrapper.classList.remove('hidden');
        scrollTrack.innerHTML = '';
        
        // Remove padding from track to ensure smooth loop calculation
        scrollTrack.classList.remove('p-2'); 
        
        let itemsHtml = '';
        scrollItems.forEach(item => {
            const isNew = isDateNew(item.date);
            // Added padding directly to item instead of track
            itemsHtml += `
                <div class="h-28 flex items-center gap-3 px-4 w-full shrink-0 hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 box-border">
                    <div class="flex-1 min-w-0 flex flex-col justify-center h-full">
                        <div class="flex items-center gap-2 mb-1">
                            ${isNew ? `<span class="px-2 py-0.5 rounded-[4px] text-[9px] font-bold shadow-sm" style="background-color: ${item.badgeColor}; color: ${item.badgeTextColor}">${item.badgeLabel}</span>` : ''}
                            <span class="text-[10px] text-slate-400 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                ${formatDate(item.date)}
                            </span>
                        </div>
                        <div class="text-sm font-medium whitespace-normal break-words leading-snug line-clamp-3" style="color: ${item.textColor}">${item.text}</div>
                    </div>
                </div>`;
        });
        
        // Double content for seamless loop
        scrollTrack.innerHTML = itemsHtml + itemsHtml;
        
        // Safe speed calculation
        const settings = appConfig.newsSettings || { speed: 3 };
        let speedVal = parseInt(settings.speed);
        if (isNaN(speedVal) || speedVal < 1) speedVal = 3;
        if (speedVal > 10) speedVal = 10;
        
        // Slower is nicer: 1=Slowest(10s), 5=Fastest(4s)
        // Base duration per item (h-28 = 7rem)
        const durationPerItem = 11 - (speedVal * 1.5); 
        const totalDuration = Math.max(durationPerItem * scrollItems.length, 2);
        
        // Reset Animation
        scrollTrack.style.animation = 'none';
        scrollTrack.offsetHeight; /* Trigger Reflow */
        scrollTrack.style.animation = `verticalSlide ${totalDuration}s linear infinite`;
        
        // Interaction
        scrollWrapper.onmouseenter = () => scrollTrack.style.animationPlayState = 'paused';
        scrollWrapper.onmouseleave = () => scrollTrack.style.animationPlayState = 'running';

    } else {
        scrollWrapper.classList.add('hidden');
    }
}

function requestNotificationPermission() {
    if (!("Notification" in window)) return alert("อุปกรณ์ไม่รองรับ");
    Notification.requestPermission().then(p => {
        if (p === "granted") showToast("เปิดแจ้งเตือนแล้ว");
        else alert("กรุณากดอนุญาตเพื่อรับแจ้งเตือน");
        renderSidebar();
    });
}

function checkAndNotifyNews(newsItems) {
    if (!newsItems || newsItems.length === 0) return;
    const latest = [...newsItems].sort((a,b) => b.id - a.id)[0];
    const lastId = parseInt(localStorage.getItem('last_notified_news_id') || '0');
    if (latest.id > lastId) {
        if (Notification.permission === "granted") new Notification("ประกาศใหม่", { body: latest.text, icon: "https://via.placeholder.com/128" });
        else showToast("ประกาศใหม่: " + latest.text);
        localStorage.setItem('last_notified_news_id', latest.id);
    }
}

function applyTheme(theme) {
    document.body.classList.remove('theme-christmas');
    let primary = '#E63946', dark = '#1D3557', showScene = 'none';
    if (theme === 'christmas') {
        document.body.classList.add('theme-christmas');
        primary = '#D62828'; dark = '#14532D'; showScene = 'block';
    }
    const scene = document.getElementById('xmas-scene');
    if(scene) scene.style.display = showScene;
    document.querySelector('meta[name="theme-color"]').setAttribute("content", primary);
    document.documentElement.style.setProperty('--sunny-red', primary);
    document.documentElement.style.setProperty('--sunny-dark', dark);
}

// --- ADMIN FUNCTIONS ---
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
    
    // Safe access for speed input
    const speedInp = document.getElementById('conf-news-speed');
    const safeSettings = tempConfig.newsSettings || { speed: 3 };
    if(speedInp) speedInp.value = safeSettings.speed || 3;
    
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
    // Default Tab
    switchAdminTab('dashboard');
}

function renderAdminCalcInputs() {
    const container = document.getElementById('tab-content-calc');
    if(!container) return;
    
    const w = tempConfig.calcSettings.wood;
    const p = tempConfig.calcSettings.pvc;
    const r = tempConfig.calcSettings.roller; 

    container.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between mb-4 sticky top-0 z-10 shadow-sm">
            <span class="font-bold text-slate-700">เปิดใช้งานระบบคำนวณ</span>
            <input type="checkbox" id="conf-calc-enabled" ${tempConfig.calcSettings.enabled ? 'checked' : ''} class="w-6 h-6 accent-sunny-red" onchange="tempConfig.calcSettings.enabled = this.checked">
        </div>

        <div class="space-y-6 pb-10">
            <div class="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h3 class="font-bold text-amber-800 border-b border-amber-200 pb-2 mb-3 flex items-center gap-2">🪵 มู่ลี่ไม้ (Wood)</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-[10px] font-bold text-slate-500">ราคา Basswood (บาท)</label><input type="number" value="${w.priceBasswood}" onchange="tempConfig.calcSettings.wood.priceBasswood = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">ราคา Foamwood (บาท)</label><input type="number" value="${w.priceFoamwood}" onchange="tempConfig.calcSettings.wood.priceFoamwood = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">ตัวคูณ (เช่น 1.2)</label><input type="number" step="0.01" value="${w.factor}" onchange="tempConfig.calcSettings.wood.factor = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">กว้างสูงสุด (Max W)</label><input type="number" step="0.01" value="${w.maxW}" onchange="tempConfig.calcSettings.wood.maxW = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">กว้างขั้นต่ำ (Min W)</label><input type="number" step="0.01" value="${w.minW}" onchange="tempConfig.calcSettings.wood.minW = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">สูงขั้นต่ำ (Min H)</label><input type="number" step="0.01" value="${w.minH}" onchange="tempConfig.calcSettings.wood.minH = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 class="font-bold text-blue-800 border-b border-blue-200 pb-2 mb-3 flex items-center gap-2">🚪 ฉากกั้นห้อง (PVC)</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-[10px] font-bold text-slate-500">ตัวคูณ (เช่น 1.2)</label><input type="number" step="0.01" value="${p.factor}" onchange="tempConfig.calcSettings.pvc.factor = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">กว้างขั้นต่ำ (Min W)</label><input type="number" step="0.01" value="${p.minW}" onchange="tempConfig.calcSettings.pvc.minW = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">เริ่มปัดเศษความสูง (เมตร)</label><input type="number" step="0.01" value="${p.stepStartH}" onchange="tempConfig.calcSettings.pvc.stepStartH = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-white"></div>
                </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 class="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">🪟 ม่านม้วน (Roller Blinds)</h3>
                <div class="grid grid-cols-2 gap-4 mt-2">
                    <div><label class="text-[10px] font-bold text-slate-500">ตัวคูณผ้า (Fabric Mult)</label><input type="number" step="0.1" value="${r.fabricMult}" onchange="tempConfig.calcSettings.roller.fabricMult = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-slate-50"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">พื้นที่ขั้นต่ำ (Min Area)</label><input type="number" step="0.1" value="${r.minArea}" onchange="tempConfig.calcSettings.roller.minArea = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-slate-50"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">ค่าอุปกรณ์ (Eq Ext)</label><input type="number" value="${r.eqExt}" onchange="tempConfig.calcSettings.roller.eqExt = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-slate-50"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">สลิง (Sling)</label><input type="number" value="${r.sling}" onchange="tempConfig.calcSettings.roller.sling = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-slate-50"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">รางบน (Rail Top)</label><input type="number" value="${r.railTop}" onchange="tempConfig.calcSettings.roller.railTop = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-slate-50"></div>
                    <div><label class="text-[10px] font-bold text-slate-500">รางล่าง (Rail Bot)</label><input type="number" value="${r.railBot}" onchange="tempConfig.calcSettings.roller.railBot = parseFloat(this.value)" class="w-full p-2 border rounded text-sm bg-slate-50"></div>
                </div>
            </div>
             <div class="text-[10px] text-slate-400 text-center pt-2">* มู่ลี่อลูมิเนียม ใช้ตารางราคาแยก</div>
        </div>
    `;
}

function closeConfig() { 
    applyTheme(appConfig.theme); 
    document.getElementById('adminConfigModal').classList.add('hidden'); 
}

function saveConfig() {
    tempConfig.appTitle = document.getElementById('conf-app-title').value;
    
    // Ensure newsSettings structure
    if (!tempConfig.newsSettings) tempConfig.newsSettings = {};
    tempConfig.newsSettings.speed = parseInt(document.getElementById('conf-news-speed').value) || 3;
    
    appConfig = tempConfig;
    applyTheme(appConfig.theme);
    
    db.collection("app_settings").doc("config").set(appConfig).then(()=>{
        showToast("บันทึกสำเร็จ");
        closeConfig();
        renderSidebar();
        renderNews(); // Refresh news immediately
    });
}

function switchAdminTab(tab) {
    ['menu','news','calc','saved', 'theme', 'features', 'dashboard'].forEach(t => {
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
    if(tab === 'dashboard') renderAdminDashboard();
}

// --- DASHBOARD RENDERER (NEW) ---
async function renderAdminDashboard() {
    const container = document.getElementById('tab-content-dashboard');
    if (!container) return;

    // Loading State
    container.innerHTML = `<div class="flex flex-col items-center justify-center h-64"><span class="loader w-10 h-10 border-4 border-slate-200 border-t-sunny-red rounded-full mb-4"></span><span class="text-slate-400">กำลังประมวลผลข้อมูล...</span></div>`;

    try {
        // Fetch real data if not present (using logic similar to renderQuotationsList)
        let quotes = tempQuotes;
        if (!quotes || quotes.length === 0) {
            // Try fetching from DB first if online
            if (db && auth && auth.currentUser) {
                const snap = await db.collection("quotations").get();
                quotes = [];
                snap.forEach(doc => quotes.push({ ...doc.data(), docId: doc.id }));
            } else {
                // Offline/Guest
                quotes = JSON.parse(localStorage.getItem('sunny_quotations')) || [];
            }
            tempQuotes = quotes;
        }

        // Calculate Stats
        const totalDocs = quotes.length;
        let totalValue = 0;
        let woodCount = 0, pvcCount = 0, rollerCount = 0, aluCount = 0;
        
        // Data for Chart
        const last7Days = {};
        for(let i=6; i>=0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const k = d.toLocaleDateString('th-TH');
            last7Days[k] = 0;
        }

        quotes.forEach(q => {
            // Parse Total (remove commas/text)
            const amount = parseFloat((q.total || "0").toString().replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
            totalValue += amount;

            // Categories
            if (q.type.includes('ไม้')) woodCount++;
            else if (q.type.includes('PVC') || q.type.includes('ฉาก')) pvcCount++;
            else if (q.type.includes('ม่านม้วน')) rollerCount++;
            else aluCount++;

            // Chart Data
            const qDate = new Date(q.date || q.id).toLocaleDateString('th-TH');
            if (last7Days[qDate] !== undefined) last7Days[qDate] += amount;
        });

        // Prepare Recent Activity (Top 5)
        const recent = [...quotes].sort((a,b) => (b.id||0) - (a.id||0)).slice(0, 5);

        // --- RENDER HTML ---
        container.innerHTML = `
            <div class="max-w-5xl mx-auto space-y-6">
                <div class="flex justify-between items-center mb-2">
                    <div>
                        <h3 class="text-2xl font-black text-slate-800">Overview</h3>
                        <p class="text-xs text-slate-400">ภาพรวมระบบล่าสุด</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-bold text-slate-400">อัพเดทล่าสุด</div>
                        <div class="text-sm font-bold text-slate-600">${new Date().toLocaleTimeString('th-TH')}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="rounded-2xl p-5 bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-125 transition-transform"><svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg></div>
                        <div class="relative z-10">
                            <div class="text-xs font-medium opacity-80 mb-1">ยอดเสนอราคา (ทั้งหมด)</div>
                            <div class="text-2xl font-black tracking-tight">${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})} ฿</div>
                            <div class="mt-2 text-[10px] bg-white/20 inline-block px-2 py-0.5 rounded backdrop-blur-sm">System Total</div>
                        </div>
                    </div>
                    
                    <div class="rounded-2xl p-5 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-125 transition-transform"><svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg></div>
                        <div class="relative z-10">
                            <div class="text-xs font-medium opacity-80 mb-1">จำนวนใบเสนอราคา</div>
                            <div class="text-2xl font-black tracking-tight">${totalDocs} ใบ</div>
                            <div class="mt-2 text-[10px] bg-white/20 inline-block px-2 py-0.5 rounded backdrop-blur-sm">+${recent.length} Recent</div>
                        </div>
                    </div>

                     <div class="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-125 transition-transform"><svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg></div>
                        <div class="relative z-10">
                            <div class="text-xs font-medium opacity-80 mb-1">รอการอนุมัติ (Pending)</div>
                            <div class="text-2xl font-black tracking-tight">${Math.floor(totalDocs * 0.3)} รายการ</div>
                            <div class="mt-2 text-[10px] bg-white/20 inline-block px-2 py-0.5 rounded backdrop-blur-sm">Simulated Data</div>
                        </div>
                    </div>

                    <div class="rounded-2xl p-5 bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg relative overflow-hidden group">
                         <div class="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-125 transition-transform"><svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg></div>
                        <div class="relative z-10">
                            <div class="text-xs font-medium opacity-80 mb-1">มูลค่าเฉลี่ย/ใบ</div>
                            <div class="text-2xl font-black tracking-tight">${totalDocs > 0 ? (totalValue / totalDocs).toLocaleString(undefined, {maximumFractionDigits:0}) : 0} ฿</div>
                            <div class="mt-2 text-[10px] bg-white/20 inline-block px-2 py-0.5 rounded backdrop-blur-sm">Avg. Ticket Size</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div class="flex justify-between items-center mb-6">
                            <h4 class="font-bold text-slate-700">แนวโน้มยอดขาย (7 วันล่าสุด)</h4>
                            <span class="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Weekly View</span>
                        </div>
                        <div class="h-48 flex items-end justify-between gap-2 px-2 relative">
                            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                                <div class="border-t border-slate-200 w-full h-px"></div>
                                <div class="border-t border-slate-200 w-full h-px"></div>
                                <div class="border-t border-slate-200 w-full h-px"></div>
                            </div>
                            ${Object.keys(last7Days).map((date, i) => {
                                const val = last7Days[date];
                                const max = Math.max(...Object.values(last7Days)) || 1;
                                const height = (val / max) * 100;
                                const hFinal = height < 10 ? 10 : height; // Min height
                                return `
                                    <div class="w-full bg-slate-50 rounded-t-lg relative group flex flex-col justify-end items-center hover:bg-slate-100 transition-colors cursor-pointer">
                                        <div class="w-3/4 bg-gradient-to-t from-sunny-red to-pink-400 rounded-t-md opacity-80 group-hover:opacity-100 transition-all relative" style="height: ${hFinal}%">
                                             <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">${val.toLocaleString()}</div>
                                        </div>
                                        <div class="mt-2 text-[9px] text-slate-400 font-bold rotate-0 truncate w-full text-center">${date.split('/')[0]}/${date.split('/')[1]}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                        <h4 class="font-bold text-slate-700 w-full mb-4 text-left">สัดส่วนสินค้า</h4>
                        <div class="relative w-40 h-40">
                             <div class="w-full h-full rounded-full" style="background: conic-gradient(
                                #E63946 0% ${ (woodCount/totalDocs)*100 }%, 
                                #F59E0B ${ (woodCount/totalDocs)*100 }% ${ ((woodCount+pvcCount)/totalDocs)*100 }%, 
                                #3B82F6 ${ ((woodCount+pvcCount)/totalDocs)*100 }% ${ ((woodCount+pvcCount+rollerCount)/totalDocs)*100 }%, 
                                #8B5CF6 ${ ((woodCount+pvcCount+rollerCount)/totalDocs)*100 }% 100%
                             )"></div>
                             <div class="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                                <div class="text-center">
                                    <span class="block text-2xl font-black text-slate-700">${totalDocs}</span>
                                    <span class="text-[9px] text-slate-400 uppercase">Items</span>
                                </div>
                             </div>
                        </div>
                        <div class="w-full mt-6 space-y-2">
                             <div class="flex justify-between text-xs"><span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-sunny-red"></span> ไม้ (Wood)</span> <span class="font-bold">${woodCount}</span></div>
                             <div class="flex justify-between text-xs"><span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> PVC</span> <span class="font-bold">${pvcCount}</span></div>
                             <div class="flex justify-between text-xs"><span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> ม่านม้วน</span> <span class="font-bold">${rollerCount}</span></div>
                             <div class="flex justify-between text-xs"><span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-violet-500"></span> อลูมิเนียม</span> <span class="font-bold">${aluCount}</span></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h4 class="font-bold text-slate-700">รายการล่าสุด (Recent Activity)</h4>
                        <button onclick="switchAdminTab('saved')" class="text-xs text-sunny-red font-bold hover:underline">ดูทั้งหมด</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th class="px-6 py-4">ID / วันที่</th>
                                    <th class="px-6 py-4">ลูกค้า / เจ้าของ</th>
                                    <th class="px-6 py-4">ประเภท</th>
                                    <th class="px-6 py-4 text-right">ยอดรวม</th>
                                    <th class="px-6 py-4 text-center">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-600">
                                ${recent.map(r => `
                                    <tr class="hover:bg-slate-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="font-bold text-slate-700">#${(r.id || '').toString().slice(-4)}</div>
                                            <div class="text-[10px] text-slate-400">${new Date(r.date).toLocaleDateString('th-TH')}</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="font-bold text-slate-700">${r.ownerName || 'Guest User'}</div>
                                            <div class="text-[10px] text-slate-400">${r.ownerEmail || 'Local Device'}</div>
                                        </td>
                                        <td class="px-6 py-4"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">${r.type}</span></td>
                                        <td class="px-6 py-4 text-right font-bold text-slate-700">${r.total}</td>
                                        <td class="px-6 py-4 text-center">
                                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${r.uid ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}">
                                                <span class="w-1.5 h-1.5 rounded-full ${r.uid ? 'bg-green-500' : 'bg-gray-400'}"></span>
                                                ${r.uid ? 'Online' : 'Local'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${recent.length === 0 ? '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">ยังไม่มีข้อมูล</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

    } catch (e) {
        console.error("Dashboard Error:", e);
        container.innerHTML = `<div class="text-center text-red-400 py-10">เกิดข้อผิดพลาดในการโหลดข้อมูล: ${e.message}</div>`;
    }
}

function renderAdminMenu() {
    const list = document.getElementById('admin-menu-list');
    if (!list) return;
    list.innerHTML = '';
    
    tempConfig.menus.forEach((menu, idx) => {
        const slots = [
            { key: 'bgImage1', label: 'ช่องซ้าย (Left)' },
            { key: 'bgImage2', label: 'ช่องกลาง (Center)' },
            { key: 'bgImage3', label: 'ช่องขวา (Right)' }
        ];

        let slotsHtml = '';
        slots.forEach(slot => {
            const currentVal = menu[slot.key] || '';
            const urls = currentVal.split(',').map(s => s.trim());
            if (urls.length === 1 && urls[0] === '') urls.pop(); 

            let inputsHtml = '';
            urls.forEach((url, uIdx) => {
                inputsHtml += `
                    <div class="flex items-center gap-1 mb-1">
                        <span class="text-[9px] text-slate-300 w-3 text-right">${uIdx+1}.</span>
                        <input type="text" value="${url}" 
                            onchange="updateMenuImage(${idx}, '${slot.key}', ${uIdx}, this.value)"
                            class="flex-1 min-w-0 p-1.5 border border-slate-200 rounded text-[10px] text-slate-600 bg-white focus:ring-1 focus:ring-sunny-red focus:outline-none placeholder:text-slate-200" 
                            placeholder="https://...">
                        <button onclick="removeMenuImage(${idx}, '${slot.key}', ${uIdx})" class="text-slate-300 hover:text-red-500 p-1 flex items-center justify-center h-6 w-6 bg-slate-50 hover:bg-red-50 rounded transition-colors" title="ลบภาพ"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                `;
            });

            slotsHtml += `
                <div class="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col h-full">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[9px] text-slate-500 font-bold">${slot.label}</span>
                        <button onclick="addMenuImage(${idx}, '${slot.key}')" class="text-[9px] bg-white border border-slate-200 hover:border-sunny-red hover:text-sunny-red px-2 py-0.5 rounded transition-colors shadow-sm flex items-center gap-1"><span>+</span> เพิ่มภาพ</button>
                    </div>
                    <div class="space-y-1 flex-1 overflow-y-auto max-h-32 custom-scrollbar">
                        ${inputsHtml.length > 0 ? inputsHtml : '<div class="text-[9px] text-slate-300 italic text-center py-4 border-2 border-dashed border-slate-100 rounded">ไม่มีรูปภาพ</div>'}
                    </div>
                </div>
            `;
        });

        list.innerHTML += `
            <div class="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-slate-100 rounded text-slate-500">${ICONS[menu.icon]||'?'}</div>
                    <div class="flex-grow space-y-1">
                        <input type="text" value="${menu.name}" onchange="tempConfig.menus[${idx}].name=this.value" class="w-full p-1 border rounded text-sm font-bold">
                        <input type="text" value="${menu.sub}" onchange="tempConfig.menus[${idx}].sub=this.value" class="w-full p-1 border rounded text-xs text-slate-500">
                    </div>
                    <div class="flex flex-col items-center">
                        <input type="checkbox" ${menu.active?'checked':''} onchange="tempConfig.menus[${idx}].active=this.checked" class="w-5 h-5 accent-sunny-red cursor-pointer">
                        <span class="text-[8px] text-slate-400 mt-1">แสดง</span>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 block">จัดการภาพพื้นหลัง (แยก 3 ช่องอิสระ)</label>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                        ${slotsHtml}
                    </div>
                    <div class="text-[9px] text-slate-400 mt-1">* กดปุ่มเพิ่มภาพเพื่อใส่ URL รูปภาพใหม่ โดยระบบจะสไลด์รูปวนไปตามลำดับ</div>
                </div>
            </div>`;
    });
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

// --- APP INIT ---
function initFirebase() {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                console.log("Auth Status:", user.isAnonymous ? "Guest Mode" : "Member Mode (" + user.email + ")");
                
                // --- NEW: Fetch User Profile ---
                if (!user.isAnonymous) {
                    db.collection('users').doc(user.uid).onSnapshot(doc => {
                        currentUserProfile = doc.exists ? doc.data() : null;
                        if(typeof renderUserSidebar === 'function') renderUserSidebar(user);
                    });
                }
                // -------------------------------
                
                if(typeof renderUserSidebar === 'function') renderUserSidebar(user);
                
                if (!configListenerSet) {
                    db.collection("app_settings").doc("config").onSnapshot((doc) => {
                        if (doc.exists) {
                            const newData = doc.data();
                            if(typeof checkAndNotifyNews === 'function') checkAndNotifyNews(newData.newsItems || []);
                            appConfig = newData;
                            
                            // Deep Merge Defaults incase new fields added
                            if(!appConfig.calcSettings) appConfig.calcSettings = DEFAULT_CONFIG.calcSettings;
                            if(!appConfig.calcSettings.wood) appConfig.calcSettings.wood = DEFAULT_CONFIG.calcSettings.wood;
                            if(!appConfig.calcSettings.pvc) appConfig.calcSettings.pvc = DEFAULT_CONFIG.calcSettings.pvc;
                            if(!appConfig.calcSettings.roller) appConfig.calcSettings.roller = DEFAULT_CONFIG.calcSettings.roller;

                            if(!appConfig.newsItems) appConfig.newsItems = [];
                            if(!appConfig.theme) appConfig.theme = 'default';
                            
                            localStorage.setItem('sunny_app_config', JSON.stringify(appConfig));
                            
                            if(typeof renderSidebar === 'function') renderSidebar(); 
                            if(typeof renderNews === 'function') renderNews(); 
                            if(typeof applyTheme === 'function') applyTheme(appConfig.theme);
                            if(currentSystem && typeof switchSystem === 'function') switchSystem(currentSystem);
                        } else { 
                            db.collection("app_settings").doc("config").set(appConfig); 
                        }
                    }, error => console.error("Config Listener Error:", error));
                    configListenerSet = true;
                }

            } else {
                console.log("No user, signing in anonymously...");
                auth.signInAnonymously().catch(e => console.error("Anon Auth Error:", e));
            }
        });
    } catch (e) { console.error("Firebase Init Error:", e); }
}

window.addEventListener('DOMContentLoaded', () => { 
    // 1. Init Firebase (Config)
    initFirebase();
    
    // 2. Render Initial UI (UI)
    renderSidebar();
    
    // 3. Setup Logic (Stock)
    setupAutocomplete();
    checkPwaStatus();
    
    // 4. Always Render News First (Fixes "News Missing")
    if(typeof renderNews === 'function') renderNews();

    // 5. Check URL & Decide Page Load
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get('mode');

    if (sharedMode) {
        // CASE: DEEP LINK (Run Deep Link Logic Only)
        checkUrlParams(); 
    } else {
        // CASE: NORMAL (Run Default Logic)
        setTimeout(() => {
            if(typeof switchSystem === 'function') switchSystem('WOOD');
        }, 500);
    }

    // Remove Splash
    const s = document.getElementById('intro-splash');
    if(s) {
        s.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => s.remove(), 700);
    }
});
