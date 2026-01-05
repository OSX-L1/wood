// --- QUOTATION MODAL ---
function showQuotationModal() {
    console.log("Attempting to show quotation modal..."); // 1. เช็คว่าฟังก์ชันถูกเรียกหรือไม่
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!calcItems || calcItems.length === 0) { 
        alert('กรุณาเพิ่มรายการคำนวณก่อนสร้างใบเสนอราคา'); 
        return; 
    }

    const modal = document.getElementById('quotationModal');
    if (!modal) {
        console.error("Error: Modal element 'quotationModal' not found!"); // 2. เช็คว่าหา Modal เจอไหม
        alert("ไม่พบกล่องใบเสนอราคาในหน้าเว็บ");
        return;
    }

    // แสดง Modal
    modal.classList.remove('hidden');
    
    // อัปเดตวันที่และประเภท
    const dateEl = document.getElementById('qDate');
    if(dateEl) dateEl.innerText = new Date().toLocaleDateString('th-TH');
    
    let typeLabel = 'ใบเสนอราคา'; 
    if(calcMode === 'EXT') typeLabel = 'ม่านม้วนภายนอก';
    else if(calcMode === 'PVC_CALC') typeLabel = 'ฉากกั้นห้อง PVC';
    else if(calcMode === 'WOOD_CALC') typeLabel = 'มู่ลี่ไม้';
    else if(calcMode === 'ALU25') typeLabel = 'มู่ลี่อลูมิเนียม';
    else typeLabel = 'ม่านม้วน';
    
    const typeEl = document.getElementById('qType');
    if(typeEl) typeEl.innerText = typeLabel;
    
    // สร้างตารางรายการ
    const tbody = document.getElementById('qBody');
    const detailContent = document.getElementById('qDetailContent');
    
    if (tbody) tbody.innerHTML = '';
    if (detailContent) detailContent.innerHTML = '';
    
    let sum = 0;
    
    calcItems.forEach((item, idx) => {
        sum += item.grandTotal;
        if (tbody) {
            tbody.innerHTML += `
                <tr>
                    <td class="py-2"><span class="font-bold">ชุดที่ ${idx+1}</span> <span class="text-xs text-slate-500 ml-2">(${item.w}x${item.h} ${item.unit})</span><div class="text-xs text-slate-400">${item.label || ''}</div></td>
                    <td class="py-2 text-center">${item.qty}</td>
                    <td class="py-2 text-right">${item.totalPerSet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td class="py-2 text-right font-bold">${item.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>`;
        }
        if (detailContent) {
            detailContent.innerHTML += `<div class="border-b border-slate-200 pb-2 last:border-0"><span class="font-bold text-sunny-red">ชุดที่ ${idx+1} (${item.label||''}):</span><br>${item.details}</div>`;
        }
    });
    
    const grandTotalEl = document.getElementById('qGrandTotal');
    if (grandTotalEl) grandTotalEl.innerText = sum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' บาท';
}
