let mData = AppSettings;
let isEdit = false;
let activeRegion = null;
let activeSettings = null; // Tumanlar, maktablar, boshqalar saqlanadi

window.onload = () => {
    document.body.classList.add('login-body'); // Login
    const viloyatSelect = document.getElementById('loginViloyat');
    mData.viloyatlar.forEach((v, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.innerText = v.name;
        viloyatSelect.appendChild(opt);
    });
    setLoad(false);
};

function login() {
    const regionIndex = document.getElementById('loginViloyat').value;
    const pwd = document.getElementById('loginPassword').value;
    const err = document.getElementById('loginError');

    if(regionIndex === "" || pwd === "") {
        err.innerText = "Viloyat va parolni kiriting!";
        err.style.display = "block";
        return;
    }

    const region = mData.viloyatlar[regionIndex];
    // 1. Tizimga kirishdan oldin API'dan Settings'larni tortamiz, va u yerdan parolni ham tekshiramiz
    setLoad(true);
    fetchSettingsFromAPI(region, pwd);
}

function fetchSettingsFromAPI(region, pwd) {
    fetch(region.scriptUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'getSettings', password: pwd })
    })
    .then(res => res.json())
    .then(res => {
        setLoad(false);
        if(res.success) {
            // Ma'lumotlar keldi
            activeRegion = region;
            activeSettings = res.data; // { tumans, schools, directions, forms, operators }
            
            document.body.classList.remove('login-body');
            document.getElementById('loginSection').style.display = "none";
            document.getElementById('appSection').style.display = "block";
            document.getElementById('activeViloyatName').innerText = region.name;
            
            initializeApp();
        } else {
            // Parol noto"g"ri bo"lsa yoki boshqa xatolik
            document.getElementById('loginError').innerText = res.error || "Xatolik yuz berdi!";
            document.getElementById('loginError').style.display = "block";
        }
    })
    .catch(err => {
        setLoad(false);
        alert("Server bilan bo'g'lanishda xatolik: " + err.toString());
    });
}

function logout() {
    activeRegion = null;
    activeSettings = null;
    document.getElementById('loginPassword').value = '';
    
    document.body.classList.add('login-body');
    document.getElementById('loginSection').style.display = "block";
    document.getElementById('appSection').style.display = "none";
    
    resetApp();
    document.getElementById('stCont').innerHTML = '';
}

function initializeApp() {
    initFilter();
    initDrop(document.getElementById('cTuman'), activeSettings.tumans);
    initDrop(document.getElementById('cSchool'), activeSettings.schools);
    document.getElementById('cOp').value = ""; // Eskisini tozalash
    initDrop(document.getElementById('cOp'), activeSettings.operators);
    addForm();
}

function initFilter() {
    document.getElementById('fTuman').value = "";
    document.getElementById('fSchool').value = "";
    initDrop(document.getElementById('fTuman'), activeSettings.tumans, (v) => {
        document.getElementById('fSchool').disabled = false;
        initDrop(document.getElementById('fSchool'), activeSettings.schools);
    });
}

function applyMasks(card) {
    const tels = [card.querySelector('.tel1'), card.querySelector('.tel2')];
    const tg = card.querySelector('.tg');
    
    const setCursor = (el) => { 
        if(el.value.length > 0) {
            setTimeout(() => el.setSelectionRange(el.value.length, el.value.length), 10);
        }
    };

    tels.forEach(t => {
        t.onfocus = (e) => {
            if(!e.target.value) e.target.value = '+998 ';
            setCursor(e.target);
        };
        t.oninput = (e) => {
            let v = e.target.value;
            // Minimal qiymat: +998 dan qisqa bo'lsa tiklash
            if (v.length < 5 || !v.startsWith('+998')) {
               e.target.value = '+998 ';
               setCursor(e.target);
               return;
            }
            let num = v.replace(/\D/g, '');
            if(num.startsWith('998')) num = num.substring(3);
            let res = '+998';
            if(num.length > 0) res += ' (' + num.substring(0, 2);
            if(num.length >= 2) res += ') ' + num.substring(2, 5);
            const p1 = num.substring(5, 7);
            if(p1) res += '-' + p1;
            const p2 = num.substring(7, 9);
            if(p2) res += '-' + p2;
            e.target.value = res;
        };
    });

    const ps = card.querySelector('.ps');
    ps.oninput = (e) => {
        let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let letPart = v.slice(0, 2).replace(/[^A-Z]/g, '');
        let numPart = v.slice(2, 9).replace(/[^0-9]/g, '');
        e.target.value = letPart + (numPart.length > 0 ? ' ' + numPart : '');
    };

    card.querySelector('.jsh').oninput = (e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 14);
    
    tg.onfocus = (e) => {
        if(!e.target.value) e.target.value = '@';
        setCursor(e.target);
    };
    tg.oninput = (e) => {
        const v = e.target.value;
        // Minimal qiymat: @ belgisidan kam bo'lmasin
        if (!v || v.length === 0) {
            e.target.value = '@';
            setCursor(e.target);
            return;
        }
        if (!v.startsWith('@')) e.target.value = '@' + v.replace(/@/g, '');
    };
}

function initDrop(inp, list, onSel) {
    const box = inp.nextElementSibling;
    inp.onfocus = () => {
        box.innerHTML = list.map(x => `<div class="drop-opt">${x}</div>`).join('');
        box.style.display = 'block';
    };
    box.onmousedown = (e) => {
        if(e.target.classList.contains('drop-opt')) {
            inp.value = e.target.innerText;
            box.style.display = 'none';
            if(onSel) onSel(inp.value);
        }
    };
    inp.onblur = () => setTimeout(() => box.style.display = 'none', 200);
    inp.oninput = () => {
        const v = inp.value.toLowerCase();
        box.innerHTML = list.filter(x => x.toLowerCase().includes(v)).map(x => `<div class="drop-opt">${x}</div>`).join('');
    };
}

function addForm() {
    const cont = document.getElementById('stCont');
    cont.appendChild(document.getElementById('stTemp').content.cloneNode(true));
    const last = cont.lastElementChild;
    initDrop(last.querySelector('.direction'), activeSettings.directions);
    initDrop(last.querySelector('.form'), activeSettings.forms);
    applyMasks(last);
}

// Google Apps Script bilan bog'lanish qismi (API POST Request)
function search() {
    setLoad(true);
    const n = document.getElementById('nSearch').value;
    const t = document.getElementById('fTuman').value;
    const s = document.getElementById('fSchool').value;
    
    const payload = {
        action: 'search',
        nameQuery: n,
        tuman: t,
        school: s
    };

    fetch(activeRegion.scriptUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        setLoad(false);
        if(res.success && res.results && res.results.length > 0) {
            isEdit = true;
            document.getElementById('resCount').innerText = res.results.length + " ta o'quvchi topildi ✓";
            document.getElementById('stCont').innerHTML = '';
            document.getElementById('updBtn').style.display = 'block';
            document.getElementById('saveBtn').style.display = 'none';
            document.getElementById('comBox').style.display = 'none';
            res.results.forEach(r => {
                addForm();
                const card = document.getElementById('stCont').lastElementChild;
                card.dataset.id = r.rowIndex;
                card.querySelector('.hidden-tuman').value = r.student.tuman;
                card.querySelector('.hidden-school').value = r.student.school;
                card.querySelector('.hidden-operator').value = r.student.operator;
                // Qiymatlarni yuklash + prev holatini saqlash
                const setVal = (sel, val) => {
                    const el = card.querySelector(sel);
                    el.value = val || '';
                    el.dataset.original = val || ''; // prev holat
                };
                setVal('.name',      r.student.name);
                setVal('.direction', r.student.direction);
                setVal('.tel1',      r.student.tel1);
                setVal('.tel2',      r.student.tel2);
                setVal('.form',      r.student.form);
                setVal('.ps',        r.student.passport);
                setVal('.bDate',     r.student.birthDate);
                setVal('.jsh',       r.student.jshshir);
                setVal('.score',     r.student.score);
                setVal('.tg',        r.student.tgUser);
                card.querySelector('.isConf').checked = r.student.status === "Tasdiqlandi";
            });
        } else {
            alert(res.error ? "Xatolik: " + res.error : "Hech qanday o'quvchi topilmadi!");
        }
    })
    .catch(err => {
        setLoad(false);
        alert("Server bilan bo'g'lanishda xatolik: " + err.toString());
    });
}

function submit(mode) {
    setLoad(true);

    const cards = Array.from(document.querySelectorAll('.student-card'));
    const telLocalDigits = v => v.replace(/\D/g, '').replace(/^998/, '');

    // ── Update rejimida: prev qiymat bor edi → min 3 talab ─────
    if (mode === 'update') {
        const MIN = 3;
        const FIELDS = [
            { sel: '.name',      label: "Ism Familiyasi",  isTel: false },
            { sel: '.direction', label: "Yo'nalish",        isTel: false },
            { sel: '.tel1',      label: "Telefon 1",        isTel: true  },
            { sel: '.tel2',      label: "Telefon 2",        isTel: true  },
            { sel: '.form',      label: "Ta'lim shakli",    isTel: false },
            { sel: '.ps',        label: "Pasport",          isTel: false },
            { sel: '.bDate',     label: "Tug'ilgan sana",   isTel: false },
            { sel: '.jsh',       label: "JSHSHIR",          isTel: false },
            { sel: '.tg',        label: "Telegram",         isTel: false },
        ];

        for (const c of cards) {
            for (const f of FIELDS) {
                const inp = c.querySelector(f.sel);
                const original = inp.dataset.original || '';
                // Prev holatda qiymat YO'Q edi → validatsiya shart emas
                if (!original.trim()) continue;

                // Prev holatda qiymat BOR edi → min 3 ta belgi talab
                const cur = inp.value;
                const len = f.isTel ? telLocalDigits(cur).length : cur.trim().length;
                if (len < MIN) {
                    alert(`⚠️ "${f.label}" maydonini to'liq kiriting!`);
                    setLoad(false);
                    inp.focus();
                    return;
                }
            }
        }
    }
    // ── Save rejimida: hech qanday validatsiya yo'q ─────────────


    // Ixtiyoriy maydonlarni tozalash (faqat prefix/@ bo'lsa bo'sh)
    const cleanTel = v => telLocalDigits(v).length > 0 ? v : '';
    const cleanTg  = v => (v && v !== '@' && v.length > 1) ? v : '';

    const data = cards.map(c => ({
        rowIndex: c.dataset.id,
        student: {
            name:      c.querySelector('.name').value,
            direction: c.querySelector('.direction').value,
            tel1:      c.querySelector('.tel1').value,
            tel2:      c.querySelector('.tel2').value,
            form:      c.querySelector('.form').value,
            passport:  c.querySelector('.ps').value,
            birthDate: c.querySelector('.bDate').value,
            jshshir:   c.querySelector('.jsh').value,
            score:     c.querySelector('.score').value,
            tgUser:    c.querySelector('.tg').value,
            tuman:    isEdit ? c.querySelector('.hidden-tuman').value : document.getElementById('cTuman').value,
            school:   isEdit ? c.querySelector('.hidden-school').value : document.getElementById('cSchool').value,
            operator: isEdit ? c.querySelector('.hidden-operator').value : document.getElementById('cOp').value,
            isConfirmed: c.querySelector('.isConf').checked
        }
    }));

    // Hudud/Operator validatsiyasi (faqat yangi qo'shishda)
    if (mode === 'save') {
        const cTum = document.getElementById('cTuman').value;
        const cOp  = document.getElementById('cOp').value;
        if (!cTum || !cOp) {
            alert("Iltimos, avval Asosiy Hudud va Operatorni tanlang!");
            setLoad(false);
            return;
        }
    }

    const payload = {
        action: mode === 'save' ? 'save' : 'update',
        data:   mode === 'save' ? data.map(x => x.student) : data
    };

    fetch(activeRegion.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        setLoad(false);
        if (res.success) {
            alert("Ma'lumotlar muvaffaqiyatli saqlandi! ✅");
            resetApp();
        } else {
            alert("Xatolik: " + res.error);
        }
    })
    .catch(err => {
        setLoad(false);
        alert("Server bilan bog'lanishda xatolik yuz berdi: " + err.toString());
    });
}

function resetApp() {
    isEdit = false;
    document.getElementById('stCont').innerHTML = '';
    ['cTuman','cSchool','cOp','fTuman','fSchool','nSearch'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = '';
    });
    document.getElementById('fSchool').disabled = true;
    document.getElementById('resCount').innerText = '';
    document.getElementById('updBtn').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'block';
    document.getElementById('comBox').style.display = 'block';
    addForm();
}

function setLoad(s) { 
    document.getElementById('loader').style.display = s ? 'flex' : 'none'; 
}
