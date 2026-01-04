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
    document.getElementById('searchSection').classList.add('hidden');
    document.getElementById('calculatorSection').classList.remove('hidden');
    
    const titleText = document.getElementById('calcTitleText');
    const titleIcon = document.getElementById('calcTitleIcon');
    const priceInput = document.getElementById('calcPrice');
    const sysSelect = document.getElementById('calcSystemSelectContainer'); // ของ ALU
    const woodSelect = document.getElementById('calcWoodSelectContainer'); // ของ WOOD (ใหม่)

    // Reset visibility
    if(sysSelect) sysSelect.classList.add('hidden');
    if(woodSelect) woodSelect.classList.add('hidden');
    priceInput.readOnly = false;
    priceInput.value = "";

    if (mode === 'EXT') {
        titleText.innerText = 'คำนวณม่านม้วนภายนอก';
        titleIcon.innerText = '🪟';
        priceInput.placeholder = "ระบุราคา";
    } else if (mode === 'INT') {
        titleText.innerText = 'คำนวณราคาม่านม้วน';
        titleIcon.innerText = '🏠';
        priceInput.placeholder = "ระบุราคา";
    } else if (mode === 'PVC_CALC') {
        titleText.innerText = 'คำนวณฉากกั้นห้อง PVC';
        titleIcon.innerText = '🚪';
        priceInput.placeholder = "ระบุราคา/ตร.ล.";
    } else if (mode === 'WOOD_CALC') {
        titleText.innerText = 'คำนวณมู่ลี่ไม้';
        titleIcon.innerText = '🪵';
        if(woodSelect) woodSelect.classList.remove('hidden');
        priceInput.placeholder = "ว่างไว้เพื่อใช้ราคามาตรฐาน"; // ไม่โชว์ราคาแต่บอก Hint
    } else if (mode === 'ALU25') {
        titleText.innerText = 'คำนวณมู่ลี่อลูมิเนียม 25mm.';
        titleIcon.innerText = '📏';
        if(sysSelect) sysSelect.classList.remove('hidden');
        priceInput.readOnly = true;
        priceInput.placeholder = "รอค้นหาอัตโนมัติ...";
        if(typeof loadAlu25PriceData === 'function') loadAlu25PriceData();
    }

    renderCalcTable();
}

function addCalcItem() {
    const wInput = parseFloat(document.getElementById('calcW').value);
    const hInput = parseFloat(document.getElementById('calcH').value);
    const qty = parseInt(document.getElementById('calcQty').value) || 1;
    
    if(!wInput || !hInput) { alert('กรุณากรอกความกว้างและความสูง'); return; }

    let price = 0;
    let totalPerSet = 0;
    let details = ``;
    let finalW = wInput;
    let finalH = hInput;
    let displayUnit = 'm';
    let systemLabel = '';

    // แปลงหน่วยพื้นฐานเป็นเมตร (ถ้ากรอกมาเกิน 10 สันนิษฐานว่าเป็น cm)
    let wM = (wInput >= 10) ? wInput / 100 : wInput;
    let hM = (hInput >= 10) ? hInput / 100 : hInput;

    // --- 1. WOODEN BLINDS Logic (New) ---
    if (calcMode === 'WOOD_CALC') {
        // A. เช็คความกว้างเกินกำหนด (Warning)
        if (wM > 2.40) {
            const confirmCalc = confirm(`คำเตือน: มู่ลี่ไม้ทำความกว้างได้สูงสุดที่ 2.40 เมตรเท่านั้น\n\nคุณกรอกมา: ${wM.toFixed(2)} เมตร\n\nกด [ตกลง] เพื่อคำนวณราคาตามขนาดเดิม\nกด [ยกเลิก] เพื่อแก้ไขขนาด`);
            if (!confirmCalc) return; // ยกเลิกการคำนวณ
        }

        // B. หาชนิดไม้และราคา
        const woodType = document.querySelector('input[name="woodType"]:checked').value;
        const userPrice = parseFloat(document.getElementById('calcPrice').value);
        
        let defaultPrice = (woodType === 'BASSWOOD') ? 789 : 750;
        price = userPrice || defaultPrice; // ถ้ามี User Price ใช้ User Price, ถ้าไม่มีใช้ Default

        systemLabel = `มู่ลี่ไม้ (${woodType === 'BASSWOOD' ? 'Basswood' : 'Foamwood'})`;
        displayUnit = 'm';

        // C. ปรับขนาดขั้นต่ำ (0.80 x 1.00)
        let adjustW = (wM < 0.80) ? 0.80 : wM;
        let adjustH = (hM < 1.00) ? 1.00 : hM;

        finalW = wM.toFixed(2);
        finalH = hM.toFixed(2);

        // D. สูตร: กว้าง(ปรับ) x สูง(ปรับ) x 1.2 x ราคา
        const area = adjustW * adjustH * 1.2;
        totalPerSet = area * price;

        details = `ขนาดจริง: ${finalW} x ${finalH} ม.<br>
                   เรทคำนวณ: ${adjustW.toFixed(2)} x ${adjustH.toFixed(2)} ม. (ขั้นต่ำ 0.80x1.00)<br>
                   พื้นที่: ${area.toFixed(2)} ตร.ล. (x1.2)<br>
                   ราคา: ${area.toFixed(2)} x ${price.toLocaleString()} = ${totalPerSet.toLocaleString()} บ.
                   ${userPrice ? '<br>(กำหนดราคาเอง)' : ''}`;
    }

    // --- 2. PVC Partition Logic ---
    else if (calcMode === 'PVC_CALC') {
        price = parseFloat(document.getElementById('calcPrice').value);
        if(!price) { alert('กรุณาระบุราคา'); return; }
        
        systemLabel = 'ฉากกั้นห้อง PVC';
        displayUnit = 'm';
        
        // --- ส่วนแสดงผล (ใช้ค่าจริง) ---
        finalW = wM.toFixed(2);
        finalH = hM.toFixed(2);

        // --- ส่วนคำนวณ ---
        let adjustW = (wM < 1.00) ? 1.00 : wM;

        let adjustH = 2.00; 
        if (hM <= 2.01) adjustH = 2.00;
        else if (hM <= 2.21) adjustH = 2.20;
        else if (hM <= 2.41) adjustH = 2.40;
        else if (hM <= 2.61) adjustH = 2.60;
        else if (hM <= 2.81) adjustH = 2.80;
        else if (hM <= 3.01) adjustH = 3.00;
        else if (hM <= 3.31) adjustH = 3.30;
        else adjustH = 3.50; 

        const area = adjustW * adjustH * 1.2;
        totalPerSet = area * price;

        details = `ขนาดจริง: ${finalW} x ${finalH} ม.<br>
                   เรทคำนวณ: ${adjustW.toFixed(2)} x ${adjustH.toFixed(2)} ม.<br>
                   พื้นที่: ${area.toFixed(2)} ตร.ล. (รวมคูณ 1.2)<br>
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
        const sysType = document.querySelector('input[name="aluSystem"]:checked').value;
        const db = sysType === 'STD' ? alu25Cache.STD : alu25Cache.CHAIN;

        systemLabel = sysType === 'STD' ? 'มู่ลี่อลูมิเนียม (ธรรมดา)' : 'มู่ลี่อลูมิเนียม (โซ่วน)';

        if (!db || !db[key]) {
            alert(`ไม่พบราคาสำหรับขนาด ${lookupW}x${lookupH} (ปัดเศษจาก ${wInput}x${hInput}) ในระบบ ${sysType === 'STD' ? 'ธรรมดา' : 'โซ่วน'}`);
            return;
        }

        price = db[key];
        totalPerSet = price;
        details = `ขนาดจริง: ${wInput}x${hInput} cm<br>ปรับขนาดคำนวณ: ${lookupW}x${lookupH} cm<br>ระบบ: ${sysType==='STD'?'ธรรมดา':'โซ่วน'}<br>ราคาตามตาราง: ${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;
        document.getElementById('calcPrice').value = price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    } 
    
    // --- 4. Roller / Ext Logic (Standard) ---
    else {
        price = parseFloat(document.getElementById('calcPrice').value);
        if(!price) { alert('กรุณาระบุราคา'); return; }

        systemLabel = calcMode === 'EXT' ? 'ม่านม้วนภายนอก' : 'ม่านม้วน';

        finalW = wM.toFixed(2);
        finalH = hM.toFixed(2);
        displayUnit = 'm';

        const f = appConfig.calcSettings.factors;
        let rawArea = wM * hM * f.fabricMult;
        let finalArea = rawArea < f.minArea ? f.minArea : rawArea;
        let fabricCost = finalArea * price;

        if(calcMode === 'EXT') {
            const topRail = wM * f.railTop;
            const botRail = wM * f.railBot;
            const sling = hM * f.sling * 2;
            totalPerSet = fabricCost + f.eqExt + topRail + botRail + sling;
            details = `ราคาผ้า: ${finalW}x${finalH}x${f.fabricMult} = ${rawArea.toFixed(2)} ${rawArea<f.minArea?`(ปรับเป็น ${f.minArea})`:''} x ${price} = ${fabricCost.toLocaleString()} บ.<br>ค่าอุปกรณ์: ${f.eqExt.toLocaleString()} บ.<br>รางบน: ${finalW}x${f.railTop} = ${topRail.toLocaleString()} บ.<br>รางล่าง: ${finalW}x${f.railBot} = ${botRail.toLocaleString()} บ.<br>สลิง: ${finalH}x${f.sling}x2 = ${sling.toLocaleString()} บ.`;
        } else {
            totalPerSet = fabricCost;
            details = `ราคาผ้า: ${finalW}x${finalH}x${f.fabricMult} = ${rawArea.toFixed(2)} ${rawArea<f.minArea?`(ปรับเป็น ${f.minArea})`:''} x ${price} = ${fabricCost.toLocaleString()} บ.`;
        }
    }
    
    // Finalize Item
    const grandTotal = totalPerSet * qty;
    calcItems.push({ w: finalW, h: finalH, unit: displayUnit, price: price, qty: qty, totalPerSet: totalPerSet, grandTotal: grandTotal, details: details, label: systemLabel });
    renderCalcTable();
    
    document.getElementById('calcW').value = '';
    document.getElementById('calcH').value = '';
    // เคลียร์ราคาเฉพาะโหมดที่ไม่ใช่มู่ลี่ไม้และ Alu (เพราะมู่ลี่ไม้อาจจะใช้ Default เดิมตลอด)
    if(calcMode !== 'ALU25' && calcMode !== 'WOOD_CALC') document.getElementById('calcPrice').value = ''; 
    // ถ้าเป็น Wood Calc ให้เคลียร์เฉพาะถ้าผู้ใช้กรอกเอง (หรือจะเคลียร์ทุกครั้งก็ได้)
    if(calcMode === 'WOOD_CALC') document.getElementById('calcPrice').value = '';
}

function renderCalcTable() {
    const tbody = document.getElementById('calcTableBody');
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
    document.getElementById('totalItems').innerText = calcItems.length;
    document.getElementById('grandTotal').innerText = sum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function removeCalcItem(idx) { calcItems.splice(idx, 1); renderCalcTable(); }

function clearCalc() { 
    calcItems = []; 
    currentEditingId = null;
    currentEditingDocId = null;
    renderCalcTable(); 
}

// --- QUOTATION MODAL ---
function showQuotationModal() {
    if(calcItems.length === 0) { alert('ไม่มีรายการคำนวณ'); return; }
    document.getElementById('quotationModal').classList.remove('hidden');
    document.getElementById('qDate').innerText = new Date().toLocaleDateString('th-TH');
    
    let typeLabel = 'ใบเสนอราคา'; 
    if(calcMode === 'EXT') typeLabel = 'ม่านม้วนภายนอก';
    else if(calcMode === 'PVC_CALC') typeLabel = 'ฉากกั้นห้อง PVC';
    else if(calcMode === 'WOOD_CALC') typeLabel = 'มู่ลี่ไม้';
    else if(calcMode === 'ALU25') typeLabel = 'มู่ลี่อลูมิเนียม';
    else typeLabel = 'ม่านม้วน';
    
    document.getElementById('qType').innerText = typeLabel;
    
    const tbody = document.getElementById('qBody');
    const detailContent = document.getElementById('qDetailContent');
    tbody.innerHTML = '';
    detailContent.innerHTML = '';
    let sum = 0;
    
    calcItems.forEach((item, idx) => {
        sum += item.grandTotal;
        tbody.innerHTML += `<tr><td class="py-2"><span class="font-bold">ชุดที่ ${idx+1}</span> <span class="text-xs text-slate-500 ml-2">(${item.w}x${item.h} ${item.unit})</span><div class="text-xs text-slate-400">${item.label || ''}</div></td><td class="py-2 text-center">${item.qty}</td><td class="py-2 text-right">${item.totalPerSet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td class="py-2 text-right font-bold">${item.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>`;
        detailContent.innerHTML += `<div class="border-b border-slate-200 pb-2 last:border-0"><span class="font-bold text-sunny-red">ชุดที่ ${idx+1} (${item.label||''}):</span><br>${item.details}</div>`;
    });
    document.getElementById('qGrandTotal').innerText = sum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' บาท';
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
            qData.ownerName = user.displayName;
            
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
