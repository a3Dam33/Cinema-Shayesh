const API_KEY = 'a8459bff1a3fd65b460b27b6357978f6';
let page = 1;
let contentType = 'movie'; 
let currentRegion = '';
let loading = false;

// 1. جلب البيانات من API
async function fetchSmooth() {
    if (loading) return;
    loading = true;
    
    const loader = document.getElementById('scrollLoader');
    if (loader) loader.style.opacity = '1';

    let url = `https://api.themoviedb.org/3/discover/${contentType}?api_key=${API_KEY}&language=ar-SA&sort_by=popularity.desc&page=${page}&include_adult=false&certification_country=US&certification.lte=PG-13`;

    if (currentRegion) {
        url += `&with_origin_country=${currentRegion}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (page === 1 && data.results.length > 0) {
            updateHero(data.results[0]);
        }

        data.results.forEach((item, index) => {
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

// 2. تحديث واجهة الـ Hero
function updateHero(m) {
    const hero = document.getElementById('heroSection');
    const title = m.title || m.name;
    const desc = m.overview ? m.overview.substring(0, 150) + "..." : "مشاهدة ممتعة لأحدث الأعمال السينمائية.";

    hero.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2), #0f0f0f), url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('heroTitle').innerText = title;
    document.getElementById('heroDesc').innerText = desc;
    document.getElementById('heroPlayBtn').onclick = () => openPlayer(m.id);
}

// 3. دالة تشغيل الفيديو وتفاصيل المودال
function openPlayer(id) {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';

    // تحديد رابط Brave حسب نوع الجهاز
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const braveLink = isIOS 
        ? "https://apps.apple.com/tn/app/brave-%D8%A7%D9%84%D9%85%D8%AA%D8%B5%D9%81%D8%AD-%D9%88%D9%85%D8%AD%D8%B1%D9%83-%D8%A8%D8%AD%D8%AB/id1052879175?l=ar" 
        : "https://play.google.com/store/apps/details?id=com.brave.browser&hl=ar&pli=1";

    const s1 = `https://vidsrc.xyz/embed/${contentType}?tmdb=${id}`;
    const s2 = `https://vidsrc.to/embed/${contentType}/${id}`;

    document.getElementById('videoContainer').innerHTML = `<iframe id="vFrame" src="${s1}" allowfullscreen></iframe>`;
    
    // التعديل المطلوب لترتيب الخطوات من 1 إلى 6
    document.getElementById('srvBar').innerHTML = `
        <div class="server-list">
            <button class="srv-btn active" onclick="changeSrv('${s1}', this)">السيرفر الأساسي</button>
            <button class="srv-btn" onclick="changeSrv('${s2}', this)">سيرفر بديل</button>
        </div>
        <div class="ad-notice" style="margin-top:10px; padding:15px; background:rgba(30,30,30,0.9); border:1px solid #ff9800; border-radius:12px; text-align:right; direction:rtl;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <i class="fas fa-shield-halved" style="color:#ff9800; font-size:1.2rem;"></i>
                <strong style="color:#fff; font-size:1rem;">خطوات إيقاف الإعلانات في Brave (آيفون):</strong>
            </div>
            <ol style="color:#eee; font-size:0.85rem; padding-right:20px; line-height:1.8; margin:0;">
                <li>افتح متصفح <b>Brave</b>.</li>
                <li>اضغط على الثلاث نقاط <b>(...)</b> في الأسفل، ثم اختر <b>الإعدادات (Settings)</b>.</li>
                <li>اختر <b>دروع Brave وحماية الخصوصية (Brave Shields & Privacy)</b>.</li>
                <li>اذهب إلى قسم <b>حظر أدوات التتبع والإعلانات (Block Trackers & Ads)</b> وغيره من "قياسي" إلى <b>عنيف (Aggressive)</b>.</li>
                <li>تأكد أن خيار <b>حظر النوافذ المنبثقة (Block Pop-ups)</b> مفعل.</li>
                <li>(اختياري) فعل <b>حظر السكربتات (Block Scripts)</b>، لكن انتبه قد يوقف هذا المشغل، فجرب "عنيف" أولاً.</li>
            </ol>
            <div style="margin-top:12px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <a href="${braveLink}" target="_blank" style="display:inline-block; background:#ff9800; color:#000; padding:5px 15px; border-radius:20px; text-decoration:none; font-weight:bold; font-size:0.8rem;">تحميل متصفح Brave</a>
            </div>
        </div>
    `;

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

// 4. وظائف التحكم (سيرفرات، إغلاق، تبديل أقسام)
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

// 5. التمرير اللانهائي
window.onscroll = () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
        fetchSmooth();
    }
};

// 6. نظام الدخول المبسط (Session-based)
function handleLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const errorMsg = document.getElementById('authError');

    let users = JSON.parse(localStorage.getItem('cinemaUsers')) || [];
    const foundUser = users.find(u => u.username === user && u.password === pass);

    if (foundUser || (user === "admin" && pass === "1234")) {
        sessionStorage.setItem('isLoggedIn', 'true');
        document.getElementById('authPage').style.display = 'none';
        fetchSmooth();
    } else {
        errorMsg.innerText = "خطأ في اسم المستخدم أو كلمة المرور";
        errorMsg.style.display = 'block';
    }
}

// بدء التشغيل
window.addEventListener('DOMContentLoaded', () => {
    const authPage = document.getElementById('authPage');
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        if(authPage) authPage.style.display = 'none';
        fetchSmooth();
    } else {
        if(authPage) authPage.style.display = 'flex';
        else fetchSmooth(); 
    }
});
