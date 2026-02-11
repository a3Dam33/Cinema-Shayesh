const API_KEY = 'a8459bff1a3fd65b460b27b6357978f6';
let page = 1;
let contentType = 'movie'; // النوع الافتراضي (أفلام)
let currentRegion = '';
let loading = false;

// 1. الدالة الأساسية لجلب البيانات
async function fetchSmooth() {
    if (loading) return;
    loading = true;
    
    // إظهار علامة التحميل
    const loader = document.getElementById('scrollLoader');
    if (loader) loader.style.opacity = '1';

    // بناء الرابط مع فلاتر حماية صارمة
    // include_adult=false : أهم فلتر لمنع المقاطع الإباحية
    // certification_country=US & certification.lte=PG-13 : لضمان محتوى عائلي/شبابي
    let url = `https://api.themoviedb.org/3/discover/${contentType}?api_key=${API_KEY}&language=ar-SA&sort_by=popularity.desc&page=${page}&include_adult=false&certification_country=US&certification.lte=PG-13`;

    // إذا تم اختيار كوري (KR) أو تركي (TR)
    if (currentRegion) {
        url += `&with_origin_country=${currentRegion}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        // إذا كانت الصفحة الأولى، نحدث فيلم الواجهة (Hero)
        if (page === 1 && data.results.length > 0) {
            updateHero(data.results[0]);
        }

        // عرض الكروت في الشبكة (Grid)
        data.results.forEach((item, index) => {
            // شرط إضافي للأمان: التأكد أن الفيلم لديه بوستر وليس "Adult"
            if (item.poster_path && !item.adult) {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.transitionDelay = `${index * 50}ms`;
                card.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
                    <div class="card-info">
                        <span class="rating"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</span>
                    </div>
                `;
                card.onclick = () => openPlayer(item.id);
                document.getElementById('mainGrid').appendChild(card);
            }
        });

        page++;
    } catch (e) {
        console.error("حدث خطأ في جلب البيانات");
    }

    loading = false;
    if (loader) loader.style.opacity = '0';
}

// 2. تحديث قسم الواجهة الكبير (Hero)
function updateHero(m) {
    const hero = document.getElementById('heroSection');
    const title = m.title || m.name;
    const desc = m.overview ? m.overview.substring(0, 150) + "..." : "مشاهدة ممتعة لأحدث الأعمال السينمائية.";

    hero.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2), #0f0f0f), url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('heroTitle').innerText = title;
    document.getElementById('heroDesc').innerText = desc;
    document.getElementById('heroPlayBtn').onclick = () => openPlayer(item.id);
}

// 3. دالة تشغيل الفيديو (المشغل)
function openPlayer(id) {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';

function openPlayer(id) {
    const modal = document.getElementById('playerModal');
    
    // إظهار المودال
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('open'), 10);
    document.body.style.overflow = 'hidden'; // منع سكرول الصفحة الخلفية

    // روابط السيرفرات
    const s1 = `https://vidsrc.me/embed/${contentType}?tmdb=${id}`;
    const s2 = `https://vidsrc.to/embed/${contentType}/${id}`;

    // وضع الفيديو في المشغل
    document.getElementById('videoContainer').innerHTML = `<iframe id="vFrame" src="${s1}" allowfullscreen></iframe>`;
    
    // بناء أزرار السيرفرات
    document.getElementById('srvBar').innerHTML = `
        <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
        <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
    `;

    // جلب بيانات الفيلم (الوصف، التقييم، الخ)
    fetch(`https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}&language=ar-SA`)
        .then(r => r.json())
        .then(m => {
            document.getElementById('mTitle').innerText = m.title || m.name;
            document.getElementById('mDesc').innerText = m.overview || "لا يوجد وصف متوفر حالياً.";
            document.getElementById('mGenres').innerHTML = m.genres.map(g => `<span class="tag">${g.name}</span>`).join('');
            document.getElementById('mRating').innerText = m.vote_average.toFixed(1);
            document.getElementById('mDate').innerText = (m.release_date || m.first_air_date || "").substring(0, 4);
        })
        .catch(err => console.error("خطأ في جلب تفاصيل الفيلم"));
}
    // روابط السيرفرات (Vidsrc معروفة بسرعتها)
    const s1 = `https://vidsrc.me/embed/${contentType}?tmdb=${id}`;
    const s2 = `https://vidsrc.to/embed/${contentType}/${id}`;

    document.getElementById('videoContainer').innerHTML = `<iframe id="vFrame" src="${s1}" allowfullscreen></iframe>`;
    
    // بناء أزرار السيرفرات
    document.getElementById('srvBar').innerHTML = `
        <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
        <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
    `;

    // جلب تفاصيل إضافية للفيلم داخل المودال
    fetch(`https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}&language=ar-SA`)
        .then(r => r.json())
        .then(m => {
            document.getElementById('mTitle').innerText = m.title || m.name;
            document.getElementById('mDesc').innerText = m.overview || "لا يوجد وصف متوفر.";
            document.getElementById('mGenres').innerHTML = m.genres.map(g => `<span class="tag">${g.name}</span>`).join('');
            document.getElementById('mRating').innerText = m.vote_average.toFixed(1);
            document.getElementById('mDate').innerText = (m.release_date || m.first_air_date || "").substring(0, 4);
        });
}

// 4. وظائف إضافية (تغيير السيرفر، الإغلاق، الفلترة)
function changeSrv(url, btn) {
    document.getElementById('vFrame').src = url;
    document.querySelectorAll('.srv-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    modal.classList.remove('open');
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('videoContainer').innerHTML = '';
    }, 500);
    document.body.style.overflow = 'auto';
}

function changeType(type, btn) {
    contentType = type;
    currentRegion = '';
    resetGrid(btn);
}

function loadRegion(reg, btn) {
    currentRegion = reg;
    // نصيحة: عند اختيار كوري أو تركي، المسلسلات (tv) دائماً أنظف وأكثر تنوعاً
    contentType = (reg === 'KR' || reg === 'TR') ? 'tv' : 'movie'; 
    resetGrid(btn);
}

function resetGrid(btn) {
    page = 1;
    document.getElementById('mainGrid').innerHTML = '';
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if(btn) btn.classList.add('active');
    fetchSmooth();
}

// السكرول اللانهائي
window.onscroll = () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
        fetchSmooth();
    }
};

// تشغيل الجلب لأول مرة
fetchSmooth();



// بيانات الدخول (يمكنك تغييرها هنا)
const CORRECT_USER = "admin";
const CORRECT_PASS = "1234";

// دالة التحقق من الدخول
function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    if (user === CORRECT_USER && pass === CORRECT_PASS) {
        // تخزين حالة الدخول
        localStorage.setItem('cinemaAuth', 'true');
        document.getElementById('loginPage').style.display = 'none';
        // بدء جلب الأفلام بعد الدخول
        fetchSmooth(); 
    } else {
        errorMsg.style.display = 'block';
    }
}

// التحقق عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cinemaAuth') === 'true') {
        document.getElementById('loginPage').style.display = 'none';
        fetchSmooth();
    }
});

// استبدل localStorage بـ sessionStorage
if (user === "admin" && pass === "12345") {
    sessionStorage.setItem("isLoggedIn", "true"); // تغيير هنا
    window.location.href = "index.html";
}

// التحقق من الجلسة الحالية فقط
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

// --- نظام إدارة المستخدمين (LocalStorage) ---

// 1. التبديل بين واجهة الدخول والتسجيل
function toggleAuth(showSignup) {
    document.getElementById('loginForm').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signupForm').style.display = showSignup ? 'block' : 'none';
    document.getElementById('authTitle').innerText = showSignup ? 'حساب جديد' : 'تسجيل الدخول';
    document.getElementById('authError').style.display = 'none';
}

// 2. دالة إنشاء حساب جديد
function handleSignup() {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    const errorMsg = document.getElementById('authError');

    if (!user || !pass) {
        errorMsg.innerText = "يرجى ملء جميع الحقول";
        errorMsg.style.display = 'block';
        return;
    }

    let users = JSON.parse(localStorage.getItem('cinemaUsers')) || [];
    
    // التأكد من عدم تكرار المستخدم
    if (users.find(u => u.username === user)) {
        errorMsg.innerText = "اسم المستخدم موجود مسبقاً";
        errorMsg.style.display = 'block';
        return;
    }

    users.push({ username: user, password: pass });
    localStorage.setItem('cinemaUsers', JSON.stringify(users));
    
    alert("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن.");
    toggleAuth(false);
}

// 3. دالة تسجيل الدخول
function handleLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const errorMsg = document.getElementById('authError');

    let users = JSON.parse(localStorage.getItem('cinemaUsers')) || [];
    const foundUser = users.find(u => u.username === user && u.password === pass);

    if (foundUser || (user === "admin" && pass === "1234")) { // سماحية دخول الأدمن
        sessionStorage.setItem('isLoggedIn', 'true');
        document.getElementById('authPage').style.display = 'none';
        fetchSmooth(); // تشغيل جلب الأفلام بعد الدخول
    } else {
        errorMsg.innerText = "خطأ في اسم المستخدم أو كلمة المرور";
        errorMsg.style.display = 'block';
    }
}

// 4. التحقق من الجلسة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('authPage').style.display = 'none';
        fetchSmooth();
    } else {
        document.getElementById('authPage').style.display = 'flex';
    }
});

function openPlayer(id) {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';

    const s1 = `https://vidsrc.xyz/embed/${contentType}?tmdb=${id}`;
    const s2 = `https://vidsrc.to/embed/${contentType}/${id}`;

    // إضافة الفيديو
    document.getElementById('videoContainer').innerHTML = `<iframe id="vFrame" src="${s1}" allowfullscreen></iframe>`;
    
    // إضافة السيرفرات + نص التنبيه الجديد
    document.getElementById('srvBar').innerHTML = `
        <div class="server-list">
            <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
            <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
        </div>
        
        <div class="ad-notice">
            <i class="fas fa-shield-halved"></i>
            <p>نصيحة: إذا ظهر إعلان منبثق، أغلقه وعد للمشغل فوراً. لتجربة أفضل بدون إعلانات نهائياً، نوصي باستخدام <strong>متصفح Brave</strong>.</p>
        </div>
    `;

    // جلب بقية التفاصيل...
    fetch(`https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}&language=ar-SA`)
        .then(r => r.json())
        .then(m => {
            document.getElementById('mTitle').innerText = m.title || m.name;
            document.getElementById('mDesc').innerText = m.overview || "لا يوجد وصف متوفر.";
            document.getElementById('mGenres').innerHTML = m.genres.map(g => `<span class="tag">${g.name}</span>`).join('');
            document.getElementById('mRating').innerText = m.vote_average.toFixed(1);
            document.getElementById('mDate').innerText = (m.release_date || m.first_air_date || "").substring(0, 4);
        });
}

document.getElementById('srvBar').innerHTML = `
        <div class="server-list">
            <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
            <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
        </div>
        
        <div class="ad-notice">
            <div class="notice-text">
                <i class="fas fa-shield-check"></i>
                <p>إذا ظهر إعلان، أغلقه وعد للمشغل. لتجربة <strong>بدون إعلانات</strong>، نوصي بمتصفح Brave.</p>
            </div>
            <div class="download-links">
                <a href="https://play.google.com/store/apps/details?id=com.brave.browser" target="_blank" class="dl-btn">
                    <i class="fab fa-google-play"></i> أندرويد
                </a>
                <a href="https://apps.apple.com/app/brave-private-web-browser/id1052879175" target="_blank" class="dl-btn">
                    <i class="fab fa-apple"></i> آيفون
                </a>
            </div>
        </div>
    `;

    // ابحث عن هذا الجزء داخل دالة openPlayer في ملف script.js وقم بتعديله
document.getElementById('srvBar').innerHTML = `
    <div class="server-list">
        <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
        <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
    </div>
    
    <div class="ad-notice">
        <div class="notice-text">
            <i class="fas fa-shield-halved"></i>
            <p>نصيحة: إذا ظهر إعلان منبثق، أغلقه وعد للمشغل فوراً. لتجربة أفضل بدون إعلانات نهائياً، نوصي باستخدام 
               <a href="https://brave.com/download/" target="_blank" class="brave-link">متصفح Brave</a>.
            </p>
        </div>
    </div>
`;

// داخل دالة openPlayer ابحث عن سطر srvBar.innerHTML واستبدله بهذا:
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const braveLink = isIOS 
    ? "https://apps.apple.com/tn/app/brave-%D8%A7%D9%84%D9%85%D8%AA%D8%B5%D9%81%D8%AD-%D9%88%D9%85%D8%AD%D8%B1%D9%83-%D8%A8%D8%AD%D8%AB/id1052879175?l=ar" 
    : "https://play.google.com/store/apps/details?id=com.brave.browser&hl=ar&pli=1";

document.getElementById('srvBar').innerHTML = `
    <div class="server-list">
        <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
        <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
    </div>
    
    <div class="ad-notice">
        <div class="notice-text">
            <i class="fas fa-shield-halved"></i>
            <p>نصيحة: إذا ظهر إعلان، أغلقه وعد للمشغل. لتجربة بدون إعلانات نهائياً، نوصي بـ 
               <a href="${braveLink}" target="_blank" class="brave-link">متصفح Brave الأصلي</a>.
            </p>
        </div>
    </div>
`;

function openPlayer(id) {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';

    // تحديد الرابط المناسب حسب نوع الجهاز
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const braveLink = isIOS 
        ? "https://apps.apple.com/tn/app/brave-%D8%A7%D9%84%D9%85%D8%AA%D8%B5%D9%81%D8%AD-%D9%88%D9%85%D8%AD%D8%B1%D9%83-%D8%A8%D8%AD%D8%AB/id1052879175?l=ar" 
        : "https://play.google.com/store/apps/details?id=com.brave.browser&hl=ar&pli=1";

    const s1 = `https://vidsrc.xyz/embed/${contentType}?tmdb=${id}`;
    const s2 = `https://vidsrc.to/embed/${contentType}/${id}`;

    document.getElementById('videoContainer').innerHTML = `<iframe id="vFrame" src="${s1}" allowfullscreen></iframe>`;
    
    // بناء الأزرار مع إضافة الرابط للكلمة الصفراء
    document.getElementById('srvBar').innerHTML = `
        <div class="server-list">
            <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
            <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
        </div>
        
        <div class="ad-notice">
            <div class="notice-text">
                <i class="fas fa-shield-halved"></i>
                <p>نصيحة: إذا ظهر إعلان، أغلقه وعد للمشغل. لتجربة بدون إعلانات نهائياً، نوصي بـ 
                   <a href="${braveLink}" target="_blank" class="brave-link">متصفح Brave</a>.
                </p>
            </div>
        </div>
    `;

    // جلب بيانات الفيلم
    fetch(`https://api.themoviedb.org/3/${contentType}/${id}?api_key=${API_KEY}&language=ar-SA`)
        .then(r => r.json())
        .then(m => {
            document.getElementById('mTitle').innerText = m.title || m.name;
            document.getElementById('mDesc').innerText = m.overview || "لا يوجد وصف متوفر.";
            document.getElementById('mGenres').innerHTML = m.genres.map(g => `<span class="tag">${g.name}</span>`).join('');
            document.getElementById('mRating').innerText = m.vote_average.toFixed(1);
            document.getElementById('mDate').innerText = (m.release_date || m.first_air_date || "").substring(0, 4);
        });
}