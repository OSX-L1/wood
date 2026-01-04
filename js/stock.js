// --- CORE SYSTEM VARIABLES ---
const WOOD_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1132498145&single=true&output=csv";
const PVC_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1230787558&single=true&output=csv";
const ROLLER_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1019928538&single=true&output=csv";
const ALU_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1880232984&single=true&output=csv";

// NEW CSVs for ALU25
const ALU25_STD_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=684509454&single=true&output=csv";
const ALU25_CHAIN_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=374964719&single=true&output=csv";

const ICONS = {
    wood: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>',
    alu: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>',
    pvc: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>',
    roller: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
};

let currentSystem = 'WOOD'; 
let cache = { WOOD: null, PVC: null, ROLLER: null, ALU: null };
let alu25Cache = { STD: null, CHAIN: null };
let slideshowIntervals = []; // Store multiple intervals for header bg

// --- HELPER FUNCTIONS ---
function isValidCode(c){if(!c||c.includes(',')||c.includes('"')||c.length>20)return false; const b=['SLAT','PCS','BOX','จำนวน','NAME','CODE','PRICE','35MM','50MM','F-WOOD','25MM','รหัส','คงเหลือ','ชื่อ','ความสูง']; return !b.some(w=>c.toUpperCase().includes(w));}

const STOCK_COLUMNS_WOOD={'4ft':{col:4,meter:'1.22 ม.'},'4.5ft':{col:6,meter:'1.37 ม.'},'5ft':{col:8,meter:'1.52 ม.'},'5.5ft':{col:10,meter:'1.68 ม.'},'6ft':{col:12,meter:'1.83 ม.'},'6.5ft':{col:14,meter:'1.98 ม.'},'7ft':{col:16,meter:'2.13 ม.'},'8ft':{col:18,meter:'2.44 ม.'}};

// --- PARSERS ---
function parseWoodCSV(t){const l=t.trim().split('\n'),d={};let lc=null;for(let i=2;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(!c&&lc){const h=Object.values(STOCK_COLUMNS_WOOD).some(o=>cr[o.col]&&cr[o.col]!=='0');if(cr[1]||h)c=lc}if(c){c=c.toUpperCase();if(!isValidCode(c))continue;lc=c;if(!d[c]){d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{}};Object.keys(STOCK_COLUMNS_WOOD).forEach(k=>d[c].stocks[k]=0)}for(const[k,o]of Object.entries(STOCK_COLUMNS_WOOD))if(cr.length>o.col)d[c].stocks[k]+=parseInt(cr[o.col].replace(/,/g,'')||0,10)}}return d}
function parseAluCSV(t){const l=t.trim().split('\n'),d={};for(let i=1;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(c){c=c.toUpperCase();if(!isValidCode(c))continue;const v=parseInt(cr[2].replace(/,/g,'')||0,10);if(!d[c])d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{'คงเหลือ':v}};else d[c].stocks['คงเหลือ']+=v}}return d}
function parsePvcCSV(t){const l=t.trim().split('\n'),d={};const hr=l[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c=>c.trim().replace(/^"|"$/g,''));const hm=[];for(let i=2;i<hr.length;i++)if(hr[i]&&!isNaN(parseInt(hr[i])))hm.push({index:i,label:hr[i]});for(let i=2;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(c){c=c.toUpperCase();if(!isValidCode(c))continue;if(!d[c])d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{}};hm.forEach(h=>{if(cr.length>h.index)d[c].stocks[h.label]=(d[c].stocks[h.label]||0)+parseInt(cr[h.index].replace(/,/g,'')||0,10)})}}return d}
function parseRollerCSV(t){const l=t.trim().split('\n'),d={};for(let i=3;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(c){c=c.toUpperCase();if(!isValidCode(c))continue;const v=parseInt(cr[2].replace(/,/g,'')||0,10);if(!d[c])d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{'คงเหลือ':v}};else d[c].stocks['คงเหลือ']+=v}}return d}
function parsePriceCSV(text) {
    const lines = text.trim().split('\n');
    const data = {};
    lines.forEach(line => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2) {
            let size = cols[0];
            let price = parseFloat(cols[1].replace(/,/g, ''));
            if (size && !isNaN(price)) {
                data[size] = price;
            }
        }
    });
    return data;
}

// --- DATA FETCHING ---
async function fetchData(sysId) {
    const system = sysId || currentSystem; 
    if (cache[system]) return cache[system];
    let url = (system==='WOOD')?WOOD_CSV_URL:(system==='ALU')?ALU_CSV_URL:(system==='PVC')?PVC_CSV_URL:ROLLER_CSV_URL;
    try {
        const response = await fetch(url, { cache: "no-store" }); if (!response.ok) throw new Error('Network Error');
        const text = await response.text(); let parsedData;
        if (system==='WOOD') parsedData = parseWoodCSV(text); else if (system==='ALU') parsedData = parseAluCSV(text); else if (system==='PVC') parsedData = parsePvcCSV(text); else parsedData = parseRollerCSV(text);
        cache[system] = parsedData; 
        if (currentSystem === system) {
            const dateEl = document.getElementById('lastUpdateDisplay');
            if(dateEl) dateEl.innerText = new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'; 
        }
        return parsedData;
    } catch (e) { console.error(e); throw e; }
}

async function loadAlu25PriceData() {
    if (!alu25Cache.STD) {
        try { const res = await fetch(ALU25_STD_URL); const text = await res.text(); alu25Cache.STD = parsePriceCSV(text); } catch(e) { console.error("Error loading ALU STD", e); }
    }
    if (!alu25Cache.CHAIN) {
        try { const res = await fetch(ALU25_CHAIN_URL); const text = await res.text(); alu25Cache.CHAIN = parsePriceCSV(text); } catch(e) { console.error("Error loading ALU CHAIN", e); }
    }
}

async function updateProductList() {
    const activeSystem = currentSystem; 
    const browse = document.getElementById('browseListContainer');
    if(!browse) return;
    
    browse.innerHTML = `<div class="flex justify-center items-center h-full text-slate-400"><span class="loader w-6 h-6 border-2 border-slate-300 border-t-sunny-red rounded-full mr-2"></span> กำลังโหลด...</div>`;
    try {
        const data = await fetchData(activeSystem);
        if (currentSystem !== activeSystem) return;

        const browseContent = document.createDocumentFragment();
        const codes = Object.keys(data).sort();
        if(codes.length===0) { browse.innerHTML = `<div class="text-center text-slate-400 mt-10">ไม่พบสินค้า</div>`; return; }
        
        codes.forEach(code => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left bg-slate-50 hover:bg-red-50 p-4 rounded-xl border border-slate-100 hover:border-red-100 transition-all flex justify-between items-center group btn-bounce mb-2";
            btn.onclick = () => { document.getElementById('productCodeInput').value = code; toggleCodeListModal(false); searchProduct(); };
            btn.innerHTML = `<div><span class="block font-bold text-lg text-slate-700 group-hover:text-sunny-red transition-colors">${code}</span></div><svg class="h-5 w-5 text-slate-300 group-hover:text-sunny-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`;
            browseContent.appendChild(btn);
        });
        browse.innerHTML = '';
        browse.appendChild(browseContent);
    } catch (error) { browse.innerHTML = `<div class="text-center text-red-400 mt-10">โหลดรายชื่อไม่สำเร็จ</div>`; }
}

// --- SEARCH FUNCTION ---
async function searchProduct() {
    const input = document.getElementById('productCodeInput'); 
    const code = input.value.trim().toUpperCase(); 
    document.getElementById('suggestion-box').classList.add('hidden');
    if (!code) return;
    
    const ids = ['loadingIndicator', 'productCard', 'errorMessage', 'initialMessage']; 
    ids.forEach(id => document.getElementById(id).classList.add('hidden')); 
    
    document.getElementById('loadingIndicator').classList.remove('hidden'); 
    const btn = document.getElementById('searchButton'); 
    btn.disabled = true; 
    btn.innerHTML = '<span class="loader block w-5 h-5 border-2 border-white/50 border-t-white rounded-full"></span>';
    
    try {
        const data = await fetchData(currentSystem); 
        const result = data[code];
        document.getElementById('loadingIndicator').classList.add('hidden'); 
        btn.disabled = false; 
        btn.innerText = 'ค้นหา';
        
        if (result) {
            document.getElementById('productCodeDisplay').innerText = code; 
            document.getElementById('productName').innerText = result.name;
            const grid = document.getElementById('stockGrid'); 
            grid.innerHTML = '';
            const isSingle = currentSystem === 'ROLLER' || currentSystem === 'ALU';
            grid.className = isSingle ? 'grid grid-cols-1 gap-4 pb-4 max-w-sm mx-auto' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-4';
            
            const createCard = (label, sub, qty) => {
                const isZero = qty === 0, isLow = qty > 0 && qty < 20;
                return `<div class="bento-card relative rounded-2xl p-4 border flex flex-col justify-between ${isSingle?'h-40 items-center justify-center text-center':'h-28'} ${isZero?'bg-slate-50 opacity-60 text-slate-400':(isLow?'bg-white border-red-200 ring-1 ring-red-100 text-red-600':'bg-white text-slate-800')} shadow-sm group">
                    <div class="${isSingle?'w-full flex justify-between mb-2':'flex justify-between items-start'}"><div><span class="font-bold text-base md:text-lg">${label}</span>${sub?`<span class="block text-[10px] bg-slate-100 px-1.5 rounded-md w-fit mt-0.5 ${isSingle?'mx-auto':''}">${sub}</span>`:''}</div><div class="rounded-full p-1 ${isZero?'bg-red-100 text-red-400':(isLow?'bg-red-500 text-white':'bg-green-500 text-white')}"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${isZero?'M6 18L18 6M6 6l12 12':'M5 13l4 4L19 7'}"></path></svg></div></div>
                    <div class="${isSingle?'text-center mt-2':'text-right'}"><span class="block ${isSingle?'text-5xl':'text-3xl'} font-black tracking-tight leading-none">${qty.toLocaleString()}</span>${isSingle?'<span class="text-sm text-slate-400 mt-1 block">คงเหลือ</span>':''}</div></div>`;
            };

            if(currentSystem==='WOOD') Object.keys(STOCK_COLUMNS_WOOD).forEach(k => grid.innerHTML+=createCard(k, STOCK_COLUMNS_WOOD[k].meter, result.stocks[k]));
            else if(currentSystem==='PVC') Object.keys(result.stocks).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(k => grid.innerHTML+=createCard(`สูง ${k}`, 'ซม.', result.stocks[k]));
            else grid.innerHTML += createCard('จำนวนคงเหลือ', '', result.stocks['คงเหลือ']);
            document.getElementById('productCard').classList.remove('hidden');
        } else {
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('errorText').innerText = `ไม่พบรหัส: ${code} ในระบบ ${appConfig.menus.find(m=>m.id===currentSystem).name}`;
        }
    } catch (error) { 
        console.error(error); 
        document.getElementById('loadingIndicator').classList.add('hidden'); 
        btn.disabled = false; 
        btn.innerText = 'ค้นหา'; 
        document.getElementById('errorMessage').classList.remove('hidden'); 
        document.getElementById('errorText').innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'; 
    }
}

// --- AUTOCOMPLETE ---
function setupAutocomplete() {
    const input = document.getElementById('productCodeInput');
    const box = document.getElementById('suggestion-box');
    if(!input || !box) return; 

    const showSuggestions = () => {
        const val = input.value.trim().toUpperCase();
        const data = cache[currentSystem];
        if (!data) return;

        const codes = Object.keys(data).sort();
        let matches = [];
        
        if (!val) {
            matches = codes.slice(0, 50);
        } else {
            const starts = codes.filter(c => c.startsWith(val));
            const includes = codes.filter(c => !c.startsWith(val) && c.includes(val));
            matches = [...starts, ...includes].slice(0, 50);
        }

        if (matches.length === 0) {
            box.classList.add('hidden');
            return;
        }

        let html = '';
        matches.forEach(code => {
            const name = data[code].name || '';
            const displayCode = val ? code.replace(val, `<span class="text-sunny-red bg-red-50">${val}</span>`) : code;
            
            html += `
                <div class="p-3 hover:bg-red-50 cursor-pointer flex justify-between items-center transition-colors group" onclick="selectSuggestion('${code}')">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-sunny-red transition-colors"></span>
                        <span class="font-bold text-slate-700 text-lg">${displayCode}</span>
                    </div>
                    <span class="text-xs text-slate-400 font-normal bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover:border-red-100 group-hover:text-sunny-red transition-colors">${name}</span>
                </div>
            `;
        });
        
        box.innerHTML = html;
        box.classList.remove('hidden');
    };

    input.addEventListener('input', showSuggestions);
    input.addEventListener('focus', showSuggestions);
    
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !box.contains(e.target)) {
            box.classList.add('hidden');
        }
    });
}

function selectSuggestion(code) {
    const input = document.getElementById('productCodeInput');
    input.value = code;
    document.getElementById('suggestion-box').classList.add('hidden');
    searchProduct();
}

// --- SYSTEM SWITCHING ---
function switchSystem(system) {
    currentSystem = system;
    document.getElementById('searchSection').classList.remove('hidden');
    document.getElementById('calculatorSection').classList.add('hidden');
    
    const menu = appConfig.menus.find(m => m.id === system);
    if(!menu) return;
    
    document.getElementById('systemTitle').innerText = "ระบบเช็คสต็อก " + menu.name;
    document.getElementById('productTypeLabel').innerText = menu.name;
    
    const header = document.getElementById('headerSection');
    const headerContent = document.getElementById('headerContentWrapper');
    
    slideshowIntervals.forEach(clearInterval);
    slideshowIntervals = [];
    
    const oldBento = header.querySelector('.bento-grid-bg');
    if (oldBento) oldBento.remove();
    
    let hasImages = false;
    const slotImages = [[], [], []];

    if (menu.bgImage1 || menu.bgImage2 || menu.bgImage3) {
        hasImages = true;
        if(menu.bgImage1) slotImages[0] = menu.bgImage1.split(',').map(url => url.trim()).filter(url => url !== '');
        if(menu.bgImage2) slotImages[1] = menu.bgImage2.split(',').map(url => url.trim()).filter(url => url !== '');
        if(menu.bgImage3) slotImages[2] = menu.bgImage3.split(',').map(url => url.trim()).filter(url => url !== '');
    } else if (menu.bgImage && menu.bgImage.trim() !== '') {
        hasImages = true;
        const images = menu.bgImage.split(',').map(url => url.trim()).filter(url => url !== '');
        if (images.length > 0) {
             images.forEach((img, i) => slotImages[i % 3].push(img));
             if(slotImages[1].length === 0 && images[0]) slotImages[1].push(images[0]);
             if(slotImages[2].length === 0 && images[0]) slotImages[2].push(images[0]);
        }
    }

    if (hasImages) {
        header.classList.add('header-custom-bg');
        header.classList.remove('wooden-pattern');
        headerContent.classList.add('header-content-glass');
        header.style.backgroundImage = '';
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'bento-grid-bg grid grid-cols-3 gap-0.5 bg-white/20'; 
        
        [0, 1, 2].forEach(colIndex => {
            const colDiv = document.createElement('div');
            colDiv.className = 'relative w-full h-full overflow-hidden bg-slate-100/50'; 

            const colImgs = slotImages[colIndex];
            if (colImgs.length > 0) {
                colImgs.forEach((url, imgIdx) => {
                    const slide = document.createElement('div');
                    slide.className = `bg-slide-item ${imgIdx === 0 ? 'active' : ''}`;
                    slide.style.backgroundImage = `url('${url}')`;
                    colDiv.appendChild(slide);
                });
                
                if (colImgs.length > 1) {
                    let cur = 0;
                    setTimeout(() => {
                        const interval = setInterval(() => {
                            const slides = colDiv.querySelectorAll('.bg-slide-item');
                            if(slides.length === 0) return;
                            slides[cur].classList.remove('active');
                            cur = (cur + 1) % slides.length;
                            slides[cur].classList.add('active');
                        }, 5000 + (colIndex * 1500)); 
                        slideshowIntervals.push(interval);
                    }, colIndex * 800);
                }
            } else {
                colDiv.className += ' wooden-pattern opacity-50';
            }
            gridContainer.appendChild(colDiv);
        });
        header.insertBefore(gridContainer, header.firstChild);

    } else {
        header.style.backgroundImage = '';
        header.classList.remove('header-custom-bg');
        header.classList.add('wooden-pattern');
        headerContent.classList.remove('header-content-glass');
    }
    
    document.getElementById('productCodeInput').value = '';
    document.getElementById('productCodeInput').placeholder = system==='WOOD'?'เช่น B35-34...':system==='PVC'?'เช่น 926...':system==='ALU'?'เช่น 001...':'เช่น SZH...';
    document.getElementById('productCard').classList.add('hidden');
    document.getElementById('initialMessage').classList.remove('hidden');
    const sb = document.getElementById('suggestion-box'); if(sb) sb.classList.add('hidden');
    
    if(typeof renderSidebar === 'function') renderSidebar(); 
    if (window.innerWidth < 768) {
        const sb = document.getElementById('sidebar');
        if(sb) sb.classList.add('-translate-x-full');
        const ov = document.getElementById('sidebarOverlay');
        if(ov) ov.classList.add('hidden');
    }
    updateProductList();
}
