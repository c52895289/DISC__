
const IMG = document.getElementById('pageImage');
const HOTSPOTS = document.getElementById('hotspots');
const STAGE = document.getElementById('stage');
const LOADING = document.getElementById('loading');
const MENU_FINGERS = document.getElementById('menuFingerOverlays');
const FINGER_ASSETS = ['assets/finger_tiger.webp?v=17','assets/finger_peacock.webp?v=17','assets/finger_koala.webp?v=17','assets/finger_owl.webp?v=17'];
const BGM = document.getElementById('bgm');
const MUSIC = document.getElementById('musicControl');
let audioReady = false;
let musicOn = false;

const PAGES = {
  home:{
    img:'assets/home.webp?v=17',
    alt:'DISC 增員攻心術首頁',
    spots:[
      {label:'進入 D 型老虎攻略',x:2.5,y:46.8,w:47.5,h:22.0,to:'tigerMenu'},
      {label:'進入 I 型孔雀攻略',x:50.0,y:46.8,w:47.5,h:22.0,to:'peacockMenu'},
      {label:'進入 S 型無尾熊攻略',x:2.5,y:70.2,w:47.5,h:22.0,to:'koalaMenu'},
      {label:'進入 C 型貓頭鷹攻略',x:50.0,y:70.2,w:47.5,h:22.0,to:'owlMenu'}
    ]
  },
  tigerMenu:{
    img:'assets/tiger_menu.webp?v=17',alt:'D 型老虎攻略',back:'home',
    spots:[
      {label:'老虎線索辨識',x:2,y:29.0,w:96,h:22.5,to:'tigerClues'},
      {label:'老虎地雷區',x:2,y:51.8,w:96,h:21.5,to:'tigerMines'},
      {label:'老虎任務解鎖',x:2,y:74.0,w:96,h:22.0,to:'tigerMission'}
    ]
  },
  tigerClues:{img:'assets/tiger_clues.webp?v=17',alt:'D 型老虎線索辨識',back:'tigerMenu'},
  tigerMines:{img:'assets/tiger_mines.webp?v=17',alt:'D 型老虎地雷區',back:'tigerMenu'},
  tigerMission:{img:'assets/tiger_mission.webp?v=17',alt:'D 型老虎任務解鎖',back:'tigerMenu'},

  peacockMenu:{
    img:'assets/peacock_menu.webp?v=17',alt:'I 型孔雀攻略',back:'home',
    spots:[
      {label:'孔雀線索辨識',x:2,y:29.0,w:96,h:22.5,to:'peacockClues'},
      {label:'孔雀地雷區',x:2,y:51.8,w:96,h:21.5,to:'peacockMines'},
      {label:'孔雀任務解鎖',x:2,y:74.0,w:96,h:22.0,to:'peacockMission'}
    ]
  },
  peacockClues:{img:'assets/peacock_clues.webp?v=17',alt:'I 型孔雀線索辨識',back:'peacockMenu'},
  peacockMines:{img:'assets/peacock_mines.webp?v=17',alt:'I 型孔雀地雷區',back:'peacockMenu'},
  peacockMission:{img:'assets/peacock_mission.webp?v=17',alt:'I 型孔雀任務解鎖',back:'peacockMenu'},

  koalaMenu:{
    img:'assets/koala_menu.webp?v=17',alt:'S 型無尾熊攻略',back:'home',
    spots:[
      {label:'無尾熊線索辨識',x:2,y:29.0,w:96,h:22.5,to:'koalaClues'},
      {label:'無尾熊地雷區',x:2,y:51.8,w:96,h:21.5,to:'koalaMines'},
      {label:'無尾熊任務解鎖',x:2,y:74.0,w:96,h:22.0,to:'koalaMission'}
    ]
  },
  koalaClues:{img:'assets/koala_clues.webp?v=17',alt:'S 型無尾熊線索辨識',back:'koalaMenu'},
  koalaMines:{img:'assets/koala_mines.webp?v=17',alt:'S 型無尾熊地雷區',back:'koalaMenu'},
  koalaMission:{img:'assets/koala_mission.webp?v=17',alt:'S 型無尾熊任務解鎖',back:'koalaMenu'},

  owlMenu:{
    img:'assets/owl_menu.webp?v=17',alt:'C 型貓頭鷹攻略',back:'home',
    spots:[
      {label:'貓頭鷹線索辨識',x:2,y:29.0,w:96,h:22.5,to:'owlClues'},
      {label:'貓頭鷹地雷區',x:2,y:51.8,w:96,h:21.5,to:'owlMines'},
      {label:'貓頭鷹任務解鎖',x:2,y:74.0,w:96,h:22.0,to:'owlMission'}
    ]
  },
  owlClues:{img:'assets/owl_clues.webp?v=17',alt:'C 型貓頭鷹線索辨識',back:'owlMenu'},
  owlMines:{img:'assets/owl_mines.webp?v=17',alt:'C 型貓頭鷹地雷區',back:'owlMenu'},
  owlMission:{img:'assets/owl_mission.webp?v=17',alt:'C 型貓頭鷹任務解鎖',back:'owlMenu'}
};

let current = null;
let navToken = 0;

function pct(v){return `${v}%`;}

function addSpot(spot, isBack=false){
  const b=document.createElement('button');
  b.type='button';
  b.className='hotspot'+(isBack?' back':'');
  b.setAttribute('aria-label',spot.label);
  b.style.left=pct(spot.x);
  b.style.top=pct(spot.y);
  b.style.width=pct(spot.w);
  b.style.height=pct(spot.h);
  b.addEventListener('click',()=>go(spot.to));
  HOTSPOTS.appendChild(b);
}

function renderSpots(page){
  HOTSPOTS.innerHTML='';
  if(page.back){
    addSpot({label:'返回上一層',x:1.5,y:.8,w:20,h:6.8,to:page.back},true);
  }
  (page.spots||[]).forEach(s=>addSpot(s));
}

function setLoading(show){
  LOADING.classList.toggle('show',show);
}

function loadImage(src, token){
  return new Promise((resolve,reject)=>{
    const im=new Image();
    im.decoding='async';
    im.onload=()=>{ if(token===navToken) resolve(); else reject(new Error('stale')); };
    im.onerror=reject;
    im.src=src;
  });
}


const MUSIC_SRC = 'audio/bgm.mp3?v=17';

function showMusicControl(){
  MUSIC.hidden=false;
}

async function ensureMusic(autoplay=true){
  showMusicControl();
  if(!BGM.src){
    BGM.volume = 0.45;
    BGM.preload = 'auto';
    BGM.autoplay = true;
    BGM.src = MUSIC_SRC;
    BGM.load();
  }
  if(autoplay){
    try{
      await BGM.play();
      audioReady=true;
      musicOn=true;
      MUSIC.classList.remove('off');
      MUSIC.setAttribute('aria-label','關閉背景音樂');
    }catch(e){
      // Chrome 等瀏覽器可能禁止「有聲自動播放」；控制鈕仍會立即顯示，
      // 使用者第一次點擊音符即可啟動音樂。
      audioReady = BGM.readyState >= 2;
    }
  }
}

MUSIC.addEventListener('click',async(e)=>{
  e.stopPropagation();
  showMusicControl();
  if(BGM.paused){
    await ensureMusic(true);
  }else{
    BGM.pause();
    musicOn=false;
    MUSIC.classList.add('off');
    MUSIC.setAttribute('aria-label','開啟背景音樂');
  }
});

// 首頁載入立即顯示音符並嘗試自動播放。
// 注意：Chrome/手機瀏覽器若禁止「有聲自動播放」，瀏覽器本身會擋住 play()；
// 此時第一次點擊頁面或音符即可立即補播。
showMusicControl();
BGM.autoplay = true;
ensureMusic(true);

document.addEventListener('pointerdown',()=>{
  if(BGM.paused) ensureMusic(true);
},{once:true,passive:true});

async function go(id, push=true){
  if(!PAGES[id] || id===current) return;
  const token=++navToken;
  const page=PAGES[id];
  setLoading(true);
  try{
    // 先切換實際圖片來源，再等待預載完成；避免預載失敗時整頁只剩背景色。
    IMG.src=page.img;
    IMG.alt=page.alt;
    await loadImage(page.img,token);
    if(token!==navToken)return;
    renderSpots(page);

    // 首頁四個角色手指：進入首頁時同時啟動縮放提示；離開首頁立即隱藏。
    // 首頁四隻手指完全同步縮放；用移除/重加 class + reflow 重啟 CSS 動畫，
    // 不呼叫 cancelAnimations，避免瀏覽器留下被取消的動畫狀態。
    STAGE.classList.remove('home-motion');
    if(id === 'home'){
      void STAGE.offsetWidth;
      STAGE.classList.add('home-motion');
    }

    const menuMatch = id.match(/^(tiger|peacock|koala|owl)Menu$/);
    MENU_FINGERS.classList.toggle('show', !!menuMatch);
    if(menuMatch){
      const animal = menuMatch[1];
      const fingers = MENU_FINGERS.querySelectorAll('.menu-finger');
      fingers.forEach((el, i) => {
        el.src = `assets/menu_hand_clean_${i+1}.png?v=17`;
      });
      // 強制重新啟動同一時間點的動畫，讓每次進入攻略頁都三個一起縮放。
      MENU_FINGERS.classList.remove('show');
      void MENU_FINGERS.offsetWidth;
      MENU_FINGERS.classList.add('show');
    }
    STAGE.classList.toggle('sparkle-on',true);
    [...STAGE.classList].filter(c=>c.startsWith('page-')).forEach(c=>STAGE.classList.remove(c));
    STAGE.classList.add(`page-${id}`);
    if(id === 'home'){
      void STAGE.offsetWidth;
      STAGE.classList.add('home-motion');
    }
    STAGE.classList.remove('page-enter');
    void STAGE.offsetWidth;
    STAGE.classList.add('page-enter');
    current=id;
    if(push) history.pushState({page:id},'',`#${id}`);
    setLoading(false);
    // 預留未來背景音樂：目前沒有 mp3 也完全不影響網站。
    // 音樂會在未來使用者互動後再啟用，避免阻塞初始載入。
  }catch(e){
    if(token===navToken) setLoading(false);
    console.error(e);
  }
}

window.addEventListener('popstate',()=>{
  const id=location.hash.slice(1)||'home';
  go(PAGES[id]?id:'home',false);
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && current && PAGES[current]?.back) go(PAGES[current].back);
});

const first=location.hash.slice(1);
// 非阻塞預載四個首頁手指素材；不影響首頁顯示。
FINGER_ASSETS.forEach(src=>{ const im=new Image(); im.decoding='async'; im.src=src; });
go(PAGES[first]?first:'home',false);
