// --- CALCULATOR VARIABLES ---
let calcMode = 'EXT';
let calcUnit = 'm';
let calcItems = [];

// --- CALCULATOR FUNCTIONS ---
function setCalcUnit(u) {
    calcUnit = u;
}

function switchCalcMode(mode) {
    openCalculator(mode);
    if(typeof toggleSidebar === 'function') toggleSidebar();
}

function openCalculator(mode) {
    calcMode = mode;
    const searchSection = document.getElementById('searchSection');
    const calcSection = document.getElementById('calculatorSection');
    
    // Safety check for elements
    if (searchSection) searchSection.classList.add('hidden');
    if (calcSection) calcSection.classList.remove('hidden');
    
    const titleText = document.getElementById('calcTitleText');
    const titleIcon = document.getElementById('calcTitleIcon');
    const priceInput = document.getElementById('calcPrice');
    const sysSelect = document.getElementById('calcSystemSelectContainer'); // ของ ALU
    const woodSelect = document.getElementById('calcWoodSelectContainer'); // ของ WOOD

    // Reset visibility if elements exist
    if(sysSelect) sysSelect.classList.add('hidden');
    if(woodSelect) woodSelect.classList.add('hidden');
    
    if (priceInput) {
        priceInput.readOnly = false;
        priceInput.value = "";
    }

    if (titleText && titleIcon) {
        if (mode === 'EXT') {
            titleText.innerText = 'คำนวณม่านม้วนภายนอก';
            titleIcon.innerText = '🪟';
            if(priceInput) priceInput.placeholder = "ระบุราคา";
        } else if (mode === 'INT') {
            titleText.innerText = 'คำนวณราคาม่านม้วน';
            titleIcon.innerText = '🏠';
            if(priceInput) priceInput.placeholder = "ระบุราคา";
        } else if (mode === 'PVC_CALC') {
            titleText.innerText = 'คำนวณฉากกั้นห้อง PVC';
            titleIcon.innerText = '🚪';
            if(priceInput) priceInput.placeholder = "ระบุราคา/ตร.ล.";
        } else if (mode === 'WOOD_CALC') {
            titleText.innerText = 'คำนวณมู่ลี่ไม้';
            titleIcon.innerText = '🪵';
            if(woodSelect) woodSelect.classList.remove('hidden');
            if(priceInput) priceInput.placeholder = "ว่างไว้เพื่อใช้ราคามาตรฐาน"; 
        } else if (mode === 'ALU25') {
            titleText.innerText = 'คำนวณมู่ลี่อลูมิเนียม 25mm.';
            titleIcon.innerText = '📏';
            if(sysSelect) sysSelect.classList.remove('hidden');
            if(priceInput) {
                priceInput.readOnly = true;
                priceInput.placeholder = "รอค้นหาอัตโนมัติ...";
            }
            if(typeof loadAlu25PriceData === 'function') loadAlu25PriceData();
        }
    }

    renderCalcTable();
}

function addCalcItem() {
    const wInputEl = document.getElementById('calcW');
    const hInputEl = document.getElementById('calcH');
    const qtyInputEl = document.getElementById('calcQty');
    const priceInputEl = document.getElementById('calcPrice');

    if (!wInputEl || !hInputEl) {
        alert("ไม่พบช่องกรอกข้อมูล กรุณารีเฟรชหน้าเว็บ");
        return;
    }

    const wInput = parseFloat(wInputEl.value);
    const hInput = parseFloat(hInputEl.value);
    const qty = parseInt(qtyInputEl.value) || 1;
    
    if(!wInput || !hInput) { alert('กรุณากรอกความกว้างและความสูง'); return; }

    let price = 0;
    let totalPerSet = 0;
    let details = ``;
    let finalW = wInput;
    let finalH = hInput;
    let displayUnit = 'm';
    let systemLabel = '';

    // --- สูตรเดิม: แปลงหน่วยพื้นฐานเป็นเมตร (ถ้าเกิน 10 ถือว่าเป็น cm) ---
    let wM = (wInput >= 10) ? wInput / 100 : wInput;
    let hM = (hInput >= 10) ? hInput / 100 : hInput;
    
    // Config values (with fallbacks)
    const woodConf = (appConfig.calcSettings && appConfig.calcSettings.wood) ? appConfig.calcSettings.wood : { priceBasswood: 789, priceFoamwood: 750, factor: 1.2, maxW: 2.40, minW: 0.80, minH: 1.00 };
    const pvcConf = (appConfig.calcSettings && appConfig.calcSettings.pvc) ? appConfig.calcSettings.pvc : { factor: 1.2, minW: 1.00, stepStartH: 2.00 };
    const rollerConf = (appConfig.calcSettings && appConfig.calcSettings.roller) ? appConfig.calcSettings.roller : { fabricMult: 1.2, minArea: 1.2, eqExt: 1956, railTop: 200, railBot: 150, sling: 69 };

    // --- 1. WOODEN BLINDS Logic ---
    if (calcMode === 'WOOD_CALC') {
        if (wM > woodConf.maxW) {
            const confirmCalc = confirm(`คำเตือน: มู่ลี่ไม้ทำความกว้างได้สูงสุดที่ ${woodConf.maxW.toFixed(2)} เมตรเท่านั้น\n\nคุณกรอกมา: ${wM.toFixed(2)} เมตร\n\nกด [ตกลง] เพื่อคำนวณราคาตามขนาดเดิม\nกด [ยกเลิก] เพื่อแก้ไขขนาด`);
            if (!confirmCalc) return; 
        }

        const woodTypeEl = document.querySelector('input[name="woodType"]:checked');
        const woodType = woodTypeEl ? woodTypeEl.value : 'BASSWOOD'; // Default fallback
        const userPrice = parseFloat(priceInputEl.value);
        
        let defaultPrice = (woodType === 'BASSWOOD') ? woodConf.priceBasswood : woodConf.priceFoamwood;
        price = userPrice || defaultPrice; 

        systemLabel = `มู่ลี่ไม้ (${woodType === 'BASSWOOD' ? 'Basswood' : 'Foamwood'})`;
        displayUnit = 'm';

        let adjustW = (wM < woodConf.minW) ? woodConf.minW : wM;
        let adjustH = (hM < woodConf.minH) ? woodConf.minH : hM;

        finalW = wM.toFixed(2);
        finalH = hM.toFixed(2);

        const area = adjustW * adjustH * woodConf.factor;
        totalPerSet = area * price;

        details = `ขนาดจริง: ${finalW} x ${finalH} ม.<br>
                   เรทคำนวณ: ${adjustW.toFixed(2)} x ${adjustH.toFixed(2)} ม. (ขั้นต่ำ ${woodConf.minW}x${woodConf.minH})<br>
                   พื้นที่: ${area.toFixed(2)} ตร.ล. (x${woodConf.factor})<br>
                   ราคา: ${area.toFixed(2)} x ${price.toLocaleString()} = ${totalPerSet.toLocaleString()} บ.
                   ${userPrice ? '<br>(กำหนดราคาเอง)' : ''}`;
    }

    // --- 2. PVC Partition Logic ---
    else if (calcMode === 'PVC_CALC') {
        price = parseFloat(priceInputEl.value);
        if(!price) { alert('กรุณาระบุราคา'); return; }
        
        systemLabel = 'ฉากกั้นห้อง PVC';
        displayUnit = 'm';
        
        finalW = wM.toFixed(2);
        finalH = hM.toFixed(2);

        let adjustW = (wM < pvcConf.minW) ? pvcConf.minW : wM;

        let adjustH = pvcConf.stepStartH; 
        if (hM <= 2.01) adjustH = 2.00;
        else if (hM <= 2.21) adjustH = 2.20;
        else if (hM <= 2.41) adjustH = 2.40;
        else if (hM <= 2.61) adjustH = 2.60;
        else if (hM <= 2.81) adjustH = 2.80;
        else if (hM <= 3.01) adjustH = 3.00;
        else if (hM <= 3.31) adjustH = 3.30;
        else adjustH = 3.50; 

        const area = adjustW * adjustH * pvcConf.factor;
        totalPerSet = area * price;

        details = `ขนาดจริง: ${finalW} x ${finalH} ม.<br>
                   เรทคำนวณ: ${adjustW.toFixed(2)} x ${adjustH.toFixed(2)} ม.<br>
                   พื้นที่: ${area.toFixed(2)} ตร.ล. (รวมคูณ ${pvcConf.factor})<br>
                   ราคา: ${area.toFixed(2)} x ${price.toLocaleString()} = ${totalPerSet.toLocaleString()} บ.`;
    }

    // --- 3. ALU 25 Logic ---
    else if (calcMode === 'ALU25') {
        const roundCustom = (val) => Math.round(val / 10) * 10;
        let lookupW = roundCustom(wInput);
        let lookupH = roundCustom(hInput);
        
        finalW = wInput;
        finalH = hInput; 
        displayUnit = 'cm';

        const key = `${lookupW}*${lookupH}`;
        const sysTypeEl = document.querySelector('input[name="aluSystem"]:checked');
        const sysType = sysTypeEl ? sysTypeEl.value : 'STD';
        const db = sysType === 'STD' ? (typeof alu25Cache !== 'undefined' ? alu25Cache.STD : null) : (typeof alu25Cache !== 'undefined' ? alu25Cache.CHAIN : null);

        systemLabel = sysType === 'STD' ? 'มู่ลี่อลูมิเนียม (ธรรมดา)' : 'มู่ลี่อลูมิเนียม (โซ่วน)';

        if (!db || !db[key]) {
            alert(`ไม่พบราคาสำหรับขนาด ${lookupW}x${lookupH} (ปัดเศษจาก ${wInput}x${hInput}) ในระบบ ${sysType === 'STD' ? 'ธรรมดา' : 'โซ่วน'}`);
            return;
        }

        price = db[key];
        totalPerSet = price;
        details = `ขนาดจริง: ${wInput}x${hInput} cm<br>ปรับขนาดคำนวณ: ${lookupW}x${lookupH} cm<br>ระบบ: ${sysType==='STD'?'ธรรมดา':'โซ่วน'}<br>ราคาตามตาราง: ${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;
        if(priceInputEl) priceInputEl.value = price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    } 
    
    // --- 4. Roller / Ext Logic ---
    else {
        price = parseFloat(priceInputEl.value);
        if(!price) { alert('กรุณาระบุราคา'); return; }

        systemLabel = calcMode === 'EXT' ? 'ม่านม้วนภายนอก' : 'ม่านม้วน';

        finalW = wM.toFixed(2);
        finalH = hM.toFixed(2);
        displayUnit = 'm';

        let rawArea = wM * hM * rollerConf.fabricMult;
        let finalArea = rawArea < rollerConf.minArea ? rollerConf.minArea : rawArea;
        let fabricCost = finalArea * price;

        if(calcMode === 'EXT') {
            const topRail = wM * rollerConf.railTop;
            const botRail = wM * rollerConf.railBot;
            const sling = hM * rollerConf.sling * 2;
            totalPerSet = fabricCost + rollerConf.eqExt + topRail + botRail + sling;
            details = `ราคาผ้า: ${finalW}x${finalH}x${rollerConf.fabricMult} = ${rawArea.toFixed(2)} ${rawArea<rollerConf.minArea?`(ปรับเป็น ${rollerConf.minArea})`:''} x ${price} = ${fabricCost.toLocaleString()} บ.<br>ค่าอุปกรณ์: ${rollerConf.eqExt.toLocaleString()} บ.<br>รางบน: ${finalW}x${rollerConf.railTop} = ${topRail.toLocaleString()} บ.<br>รางล่าง: ${finalW}x${rollerConf.railBot} = ${botRail.toLocaleString()} บ.<br>สลิง: ${finalH}x${rollerConf.sling}x2 = ${sling.toLocaleString()} บ.`;
        } else {
            totalPerSet = fabricCost;
            details = `ราคาผ้า: ${finalW}x${finalH}x${rollerConf.fabricMult} = ${rawArea.toFixed(2)} ${rawArea<rollerConf.minArea?`(ปรับเป็น ${rollerConf.minArea})`:''} x ${price} = ${fabricCost.toLocaleString()} บ.`;
        }
    }
    
    const grandTotal = totalPerSet * qty;
    
    // Push to array and render
    calcItems.push({ w: finalW, h: finalH, unit: displayUnit, price: price, qty: qty, totalPerSet: totalPerSet, grandTotal: grandTotal, details: details, label: systemLabel });
    
    console.log("Added Item:", calcItems); // Debug Log
    
    renderCalcTable();
    
    // Clear inputs
    if(wInputEl) wInputEl.value = '';
    if(hInputEl) hInputEl.value = '';
    if(calcMode !== 'ALU25' && calcMode !== 'WOOD_CALC' && priceInputEl) priceInputEl.value = ''; 
    if(calcMode === 'WOOD_CALC' && priceInputEl) priceInputEl.value = '';
}

function renderCalcTable() {
    // This logic is now handled in ui.js to support responsive design
    // But we keep basic logic here as fallback or for data processing
    if(typeof window.renderCalcTable === 'function' && window.renderCalcTable !== renderCalcTable) {
        // If ui.js overrides this, let it handle rendering
        // return;  <-- เอาออกเพื่อให้แน่ใจว่ามันทำงาน ถ้า ui.js ไม่ได้ overwrite จริงๆ
    }
    
    // Fallback rendering (Standard Table)
    const tbody = document.getElementById('calcTableBody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    let sum = 0;
    calcItems.forEach((item, idx) => {
        sum += item.grandTotal;
        tbody.innerHTML += `
            <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td class="px-3 py-3 font-bold">
                    ชุดที่ ${idx+1}
                    <div class="text-xs text-slate-400 font-normal">${item.label || ''}</div>
                </td>
                <td class="px-3 py-3 text-slate-500">${item.w}x${item.h} ${item.unit}</td>
                <td class="px-3 py-3 text-right">${item.totalPerSet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="px-3 py-3 text-right font-bold">${item.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="px-3 py-3 text-right"><button onclick="removeCalcItem(${idx})" class="text-red-300 hover:text-red-500 btn-bounce">x</button></td>
            </tr>`;
    });
    
    const totalItemsEl = document.getElementById('totalItems');
    const grandTotalEl = document.getElementById('grandTotal');
    
    if(totalItemsEl) totalItemsEl.innerText = calcItems.length;
    if(grandTotalEl) grandTotalEl.innerText = sum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function removeCalcItem(idx) { 
    calcItems.splice(idx, 1); 
    renderCalcTable(); 
}

function clearCalc() { 
    calcItems = []; 
    currentEditingId = null;
    currentEditingDocId = null;
    renderCalcTable(); 
}

// --- QUOTATION MODAL (FIXED & DEBUGGED) ---
function showQuotationModal() {
    console.log("Checking quotation items...", calcItems);

    // 1. Check if items exist
    if (!calcItems || calcItems.length === 0) { 
        alert('กรุณาเพิ่มรายการคำนวณก่อนสร้างใบเสนอราคา'); 
        return; 
    }

    // 2. Check Modal Element
    const modal = document.getElementById('quotationModal');
    if (!modal) {
        console.error("Critical Error: element #quotationModal not found in HTML");
        alert("ระบบขัดข้อง: ไม่พบหน้าต่างใบเสนอราคา");
        return;
    }

    // 3. Show Modal
    modal.classList.remove('hidden');
    
    // --- ส่วนที่แก้ไข: ดึงข้อมูลร้านค้าจาก User Profile มาแสดง ---
    const headerArea = document.getElementById('quotationHeaderArea');
    if (headerArea) {
        // เช็คว่ามี profile และมีชื่อร้านหรือไม่ (currentUserProfile มาจาก ui.js)
        if (typeof currentUserProfile !== 'undefined' && currentUserProfile && currentUserProfile.shopName) {
            const logoHtml = currentUserProfile.shopLogo 
                ? `<img src="${currentUserProfile.shopLogo}" class="h-20 w-20 object-contain rounded-lg border border-slate-100 mr-4 bg-white">` 
                : '';
            
            headerArea.innerHTML = `
                <div class="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                    <div class="flex items-start">
                        ${logoHtml}
                        <div>
                            <h1 class="text-2xl font-bold text-slate-800">${currentUserProfile.shopName}</h1>
                            <p class="text-sm text-slate-500 mt-1 whitespace-pre-line">${currentUserProfile.shopAddress || ''}</p>
                            <p class="text-[10px] text-sunny-red font-bold mt-2 uppercase tracking-widest">Quotation / ใบเสนอราคา</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-400 uppercase font-bold">วันที่</div>
                        <div class="font-bold text-slate-800">${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div class="text-xs text-slate-400 uppercase font-bold mt-2">ผู้เสนอราคา</div>
                        <div class="font-bold text-slate-600">${currentUserProfile.displayName || '-'}</div>
                         <div class="mt-2"><span class="text-[10px] bg-red-50 text-sunny-red px-2 py-1 rounded font-bold">${calcMode}</span></div>
                    </div>
                </div>`;
        } else {
            // ถ้าไม่มีข้อมูลร้าน ให้แสดง Header เดิม (SUNNY)
            headerArea.innerHTML = `
                <div class="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                    <div><h1 class="text-3xl font-black text-sunny-red italic tracking-tighter">SUNNY</h1><p class="text-sm text-slate-500 font-bold mt-1">QUOTATION / ใบเสนอราคา</p></div>
                    <div class="text-right"><div class="text-xs text-slate-400 uppercase font-bold">วันที่</div><div class="font-bold text-slate-800">${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div><div class="text-xs text-slate-400 uppercase font-bold mt-2">ประเภท</div><div class="font-bold text-sunny-red bg-red-50 px-2 py-0.5 rounded">${calcMode}</div></div>
                </div>`;
        }
    }
    
    // 5. Render Items inside Modal
    const tbody = document.getElementById('qBody');
    const detailContent = document.getElementById('qDetailContent');
    const grandTotalEl = document.getElementById('qGrandTotal');

    if (tbody) tbody.innerHTML = '';
    if (detailContent) detailContent.innerHTML = '';
    
    let sum = 0;
    
    calcItems.forEach((item, idx) => {
        sum += item.grandTotal;
        if (tbody) {
            tbody.innerHTML += `<tr><td class="py-2"><span class="font-bold">ชุดที่ ${idx+1}</span> <span class="text-xs text-slate-500 ml-2">(${item.w}x${item.h} ${item.unit})</span><div class="text-xs text-slate-400">${item.label || ''}</div></td><td class="py-2 text-center">${item.qty}</td><td class="py-2 text-right">${item.totalPerSet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td class="py-2 text-right font-bold">${item.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>`;
        }
        if (detailContent) {
            detailContent.innerHTML += `<div class="border-b border-slate-200 pb-2 last:border-0"><span class="font-bold text-sunny-red">ชุดที่ ${idx+1} (${item.label||''}):</span><br>${item.details}</div>`;
        }
    });
    
    if (grandTotalEl) grandTotalEl.innerText = sum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' บาท';
}

function closeQuotation() { document.getElementById('quotationModal').classList.add('hidden'); }
function toggleQDetails() { document.getElementById('qDetails').classList.toggle('hidden'); }
function captureQuotation() { html2canvas(document.querySelector("#quotationModal > div"), { scale: 2, useCORS: true }).then(canvas => { const link = document.createElement('a'); link.download = `Sunny_Quote_${Date.now()}.png`; link.href = canvas.toDataURL(); link.click(); }); }

function saveCurrentQuotation() {
    const user = currentUser;
    const isMember = user && !user.isAnonymous;
    
    if (isMember && (!db || !auth)) {
        alert('ระบบกำลังเชื่อมต่อฐานข้อมูล กรุณารอสักครู่แล้วลองใหม่...');
        return;
    }

    try {
        if (!calcItems || !Array.isArray(calcItems) || calcItems.length === 0) {
            alert('ไม่พบรายการสินค้า กรุณาลองคำนวณใหม่');
            return;
        }

        let isUpdate = false;
        if (currentEditingId || currentEditingDocId) {
            if (confirm("คุณกำลังแก้ไขรายการเดิม\nกด [ตกลง] เพื่อบันทึกทับรายการเดิม (Update)\nกด [ยกเลิก] เพื่อบันทึกเป็นรายการใหม่ (Save as New)")) {
                isUpdate = true;
            }
        } else {
            const msg = isMember ? 'ยืนยันบันทึกเข้าระบบ (บัญชีของคุณ)?' : 'ยืนยันบันทึกใบเสนอราคา (ในเครื่องนี้)?';
            if (!confirm(msg)) return;
        }

        const finalId = (isUpdate && currentEditingId) ? currentEditingId : Date.now();
        let typeLabel = 'ม่านม้วน';
        if(calcMode === 'EXT') typeLabel = 'ม่านม้วนภายนอก';
        else if(calcMode === 'PVC_CALC') typeLabel = 'ฉากกั้นห้อง PVC';
        else if(calcMode === 'WOOD_CALC') typeLabel = 'มู่ลี่ไม้';
        else if(calcMode === 'ALU25') typeLabel = 'มู่ลี่อลูมิเนียม 25mm.';

        const qData = { 
            id: finalId,
            date: new Date().toISOString(), 
            type: typeLabel, 
            total: document.getElementById('qGrandTotal').innerText, 
            items: JSON.parse(JSON.stringify(calcItems)) 
        };
        
        if (isMember) {
            qData.uid = user.uid;
            qData.ownerEmail = user.email;
            // บันทึกชื่อร้าน/ผู้เสนอราคา ณ ตอนนั้นลงไปด้วย เพื่อใช้ค้นหาหรือแสดงผลประวัติ
            qData.ownerName = (typeof currentUserProfile !== 'undefined' && currentUserProfile) ? (currentUserProfile.displayName || user.displayName) : user.displayName;
            
            if (isUpdate && currentEditingDocId) {
                db.collection("quotations").doc(currentEditingDocId).update(qData).then(() => { 
                    showToast("แก้ไขข้อมูลเรียบร้อย");
                    closeQuotation();
                    clearCalc(); 
                }).catch(e => { console.error(e); alert("เกิดข้อผิดพลาดในการอัพเดท: " + e.message); });
            } else {
                delete qData.docId; 
                db.collection("quotations").add(qData).then(() => { 
                    showToast("บันทึกรายการใหม่เรียบร้อย");
                    closeQuotation();
                    clearCalc();
                }).catch(e => { console.error(e); alert("เกิดข้อผิดพลาดในการบันทึก: " + e.message); });
            }
        } else {
            let saved = [];
            try { saved = JSON.parse(localStorage.getItem('sunny_quotations')) || []; } catch(e) { saved = []; }
            if (isUpdate && currentEditingId) {
                const idx = saved.findIndex(x => x.id === currentEditingId);
                if (idx !== -1) { saved[idx] = qData; showToast("แก้ไขข้อมูล (Guest) เรียบร้อย"); } 
                else { saved.push(qData); showToast("บันทึกใหม่ (Guest) เรียบร้อย"); }
            } else {
                saved.push(qData); showToast("บันทึก (Guest) เรียบร้อย");
            }
            localStorage.setItem('sunny_quotations', JSON.stringify(saved));
            closeQuotation();
            clearCalc();
        }
    } catch (e) {
        console.error("Critical Save Error:", e);
        alert("เกิดข้อผิดพลาดร้ายแรง: " + e.message);
    }
}

// --- HISTORY & MANAGEMENT ---
async function deleteOnlineQuote(docId, containerId, mode) { 
    if(!confirm('ยืนยันการลบข้อมูลนี้ถาวร?')) return; 
    try { 
        await db.collection("quotations").doc(docId).delete(); 
        showToast("ลบข้อมูลเรียบร้อย"); 
        renderQuotationsList(containerId, mode); 
    } catch(e) { console.error(e); alert("Error: " + e.message); } 
}

function deleteOfflineQuote(id) { 
    if(!confirm('ลบรายการนี้?')) return; 
    let saved = JSON.parse(localStorage.getItem('sunny_quotations')) || []; 
    saved = saved.filter(x => x.id !== id); 
    localStorage.setItem('sunny_quotations', JSON.stringify(saved)); 
    renderQuotationsList('user-history-list', 'mine'); 
}

async function renderQuotationsList(containerId, mode = 'mine') {
    const list = document.getElementById(containerId);
    if(!list) return;
    list.innerHTML = '<div class="text-center py-8"><span class="loader inline-block w-6 h-6 border-2 border-slate-200 border-t-sunny-red rounded-full"></span></div>';

    let quotes = [];
    const user = currentUser;

    try {
        if (mode === 'all') {
            const snap = await db.collection("quotations").get();
            snap.forEach(doc => quotes.push({ ...doc.data(), docId: doc.id }));
        } else {
            if (user && !user.isAnonymous) {
                 const snap = await db.collection("quotations").where("uid", "==", user.uid).get();
                 snap.forEach(doc => quotes.push({ ...doc.data(), docId: doc.id }));
            } else {
                 quotes = JSON.parse(localStorage.getItem('sunny_quotations')) || [];
            }
        }
    } catch(e) {
        console.error(e);
        list.innerHTML = `<div class="text-center text-red-400">Error: ${e.message}</div>`;
        return;
    }

    quotes.sort((a,b) => (b.id || 0) - (a.id || 0));
    tempQuotes = quotes; 

    if (quotes.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-400 py-8 flex flex-col items-center"><span class="text-4xl mb-2 opacity-30">📭</span>ไม่มีรายการบันทึก</div>`;
        return;
    }

    list.innerHTML = '';
    quotes.forEach((q, index) => {
        const dateStr = new Date(q.date || q.id).toLocaleString('th-TH');
        const ownerInfo = (mode === 'all' && q.ownerName) ? `<div class="text-[10px] text-sunny-red bg-red-50 px-1 rounded inline-block mb-1">👤 ${q.ownerName}</div>` : '';
        
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group mb-2";
        div.innerHTML = `
            <div>
                ${ownerInfo}
                <div class="font-bold text-slate-700 text-sm">${q.type} ${!q.uid ? '<span class="text-[9px] bg-gray-100 text-gray-500 px-1 rounded">Local</span>' : ''}</div>
                <div class="text-xs text-slate-400 mt-0.5">📅 ${dateStr} <span class="text-slate-300">|</span> ${q.items.length} รายการ</div>
            </div>
            <div class="text-right">
                <div class="font-black text-lg text-sunny-red">${q.total}</div>
                <div class="flex gap-2 justify-end mt-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick='loadQuoteByIndex(${index})' class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg font-bold">แก้ไข/ดู</button>
                    <button onclick="${(mode === 'all' || (user && !user.isAnonymous)) ? `deleteOnlineQuote('${q.docId}', '${containerId}', '${mode}')` : `deleteOfflineQuote(${q.id})`}" class="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-500 text-xs rounded-lg font-bold">ลบ</button>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

function loadQuoteByIndex(index) {
    const q = tempQuotes[index];
    if(!q) return;
    
    if(q.type.includes('ภายนอก')) calcMode = 'EXT';
    else if(q.type.includes('PVC') || q.type.includes('ฉาก')) calcMode = 'PVC_CALC';
    else if(q.type.includes('ไม้') || q.type.includes('Wood')) calcMode = 'WOOD_CALC';
    else if(q.type.includes('25mm') || q.type.includes('อลู')) calcMode = 'ALU25';
    else calcMode = 'INT';

    calcItems = q.items || []; 
    currentEditingId = q.id;
    currentEditingDocId = q.docId || null;
    
    document.getElementById('historyModal').classList.add('hidden');
    if(typeof closeConfig === 'function') closeConfig();
    
    openCalculator(calcMode);
    showQuotationModal();
    showToast("โหลดข้อมูลเรียบร้อย");
}

function openHistoryModal() {
    document.getElementById('historyModal').classList.remove('hidden');
    renderQuotationsList('user-history-list', 'mine');
}
