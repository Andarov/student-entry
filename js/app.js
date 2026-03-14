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
            if (v.length < 5) {
               if (!v.startsWith('+998')) e.target.value = '+998 ';
               return;
            }
            let num = v.replace(/\D/g, '');
            if(num.startsWith('998')) num = num.substring(3);
            let res = '+998';
            if(num.length > 0) res += ' (' + num.substring(0, 2);
            if(num.length >= 2) res += ') ' + num.substring(2, 5);
            if(num.length >= 5) res += '-' + num.substring(5, 7);
            if(num.length >= 7) res += '-' + num.substring(7, 9);
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
        if(!e.target.value.startsWith('@')) e.target.value = '@' + e.target.value.replace(/@/g, ''); 
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
                card.querySelector('.name').value = r.student.name;
                card.querySelector('.direction').value = r.student.direction;
                card.querySelector('.tel1').value = r.student.tel1;
                card.querySelector('.tel2').value = r.student.tel2;
                card.querySelector('.form').value = r.student.form;
                card.querySelector('.ps').value = r.student.passport;
                card.querySelector('.bDate').value = r.student.birthDate;
                card.querySelector('.jsh').value = r.student.jshshir;
                card.querySelector('.score').value = r.student.score;
                card.querySelector('.tg').value = r.student.tgUser;
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
    const data = cards.map(c => ({
        rowIndex: c.dataset.id,
        student: {
            name: c.querySelector('.name').value,
            direction: c.querySelector('.direction').value,
            tel1: c.querySelector('.tel1').value,
            tel2: c.querySelector('.tel2').value,
            form: c.querySelector('.form').value,
            passport: c.querySelector('.ps').value,
            birthDate: c.querySelector('.bDate').value,
            jshshir: c.querySelector('.jsh').value,
            score: c.querySelector('.score').value,
            tgUser: c.querySelector('.tg').value,
            tuman: isEdit ? c.querySelector('.hidden-tuman').value : document.getElementById('cTuman').value,
            school: isEdit ? c.querySelector('.hidden-school').value : document.getElementById('cSchool').value,
            operator: isEdit ? c.querySelector('.hidden-operator').value : document.getElementById('cOp').value,
            isConfirmed: c.querySelector('.isConf').checked
        }
    }));
    
    // Validatsiya qismi qisqacha
    let hasError = false;
    if(mode === 'save') {
        const cTum = document.getElementById('cTuman').value;
        const cOp = document.getElementById('cOp').value;
        if(!cTum || !cOp) {
            hasError = true;
            alert("Iltimos, avval Asosiy Hudud va Operatorni tanlang!");
            setLoad(false);
            return;
        }
    }

    const payload = {
        action: mode === 'save' ? 'save' : 'update',
        data: mode === 'save' ? data.map(x => x.student) : data
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
        if(res.success) { 
            alert("Ma'lumotlar muvaffaqiyatli saqlandi! ✅"); 
            resetApp(); 
        } else {
            alert("Xatolik: " + res.error);
        }
    })
    .catch(err => {
        setLoad(false);
        alert("Server bilan bo'g'lanishda xatolik yuz berdi: " + err.toString());
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
