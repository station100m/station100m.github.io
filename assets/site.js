/* 車站100米民宿 — shared site script
   Design & code: 九號科技工作室 NINTH LAB（示範版本） */
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id)};
  var WD=['日','一','二','三','四','五','六'];
  var ROOMS=[
    {no:'01',name:'雙人房 01',cap:'2 人'},
    {no:'02',name:'雙人房 02',cap:'2 人'},
    {no:'03',name:'雙人房 03',cap:'2 人'},
    {no:'04',name:'雙人房 04',cap:'2 人'},
    {no:'05',name:'雙人房 05',cap:'2 人'},
    {no:'06',name:'四人房',cap:'4 人'}
  ];
  function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function today(){var t=new Date();t.setHours(0,0,0,0);return t}

  /* ---------- header / menu ---------- */
  var hd=$('hd'),hero=document.querySelector('.hero,.pbanner');
  function onScroll(){
    if(!hd)return;
    var lim=hero?hero.offsetHeight*0.72:10;
    hd.classList.toggle('solid',!hero||window.scrollY>lim);
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var mb=$('menuBtn');
  if(mb)mb.onclick=function(){document.body.classList.toggle('menu-open')};
  [].forEach.call(document.querySelectorAll('#drawer a'),function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open')})});

  /* ---------- reveal ---------- */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    [].forEach.call(document.querySelectorAll('.rv,.walk'),function(el){io.observe(el)});
  }else{[].forEach.call(document.querySelectorAll('.rv,.walk'),function(el){el.classList.add('in')})}

  /* ---------- drag-to-scroll ---------- */
  [].forEach.call(document.querySelectorAll('.gal'),function(g){
    var down=false,sx=0,sl=0;
    g.addEventListener('mousedown',function(e){down=true;sx=e.pageX;sl=g.scrollLeft;g.classList.add('drag')});
    window.addEventListener('mouseup',function(){down=false;g.classList.remove('drag')});
    g.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();g.scrollLeft=sl-(e.pageX-sx)});
  });

  /* ---------- room gallery (room pages) ---------- */
  var rImg=$('rImg'),rThumbs=$('rThumbs');
  if(rImg&&rThumbs){
    [].forEach.call(rThumbs.querySelectorAll('button'),function(b){
      b.onclick=function(){
        [].forEach.call(rThumbs.querySelectorAll('button'),function(x){x.setAttribute('aria-current','false')});
        b.setAttribute('aria-current','true');
        rImg.classList.add('out');
        setTimeout(function(){rImg.src=b.dataset.src;rImg.onload=function(){rImg.classList.remove('out')};if(rImg.complete)rImg.classList.remove('out')},250);
      };
    });
  }

  /* ---------- data: 空房 / 公告（後台管理） ---------- */
  var DATA=null;
  function loadData(){
    try{var loc=localStorage.getItem('sioom_site_preview');if(loc)return Promise.resolve(JSON.parse(loc))}catch(_){}
    return fetch('data/site.json?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()})
      .catch(function(){return window.__SEED||{notices:[],availability:{}}});
  }
  function stAt(date,id){var a=DATA.availability&&DATA.availability[date];return a&&a[id]?a[id]:'ask'}
  function sortedNotices(){return (DATA.notices||[]).slice().sort(function(a,b){return (b.pinned?1:0)-(a.pinned?1:0)||(b.date>a.date?1:-1)})}

  function renderNews(){
    var el=$('newsList');if(!el)return;
    var lim=parseInt(el.dataset.limit||'0',10);
    var ns=sortedNotices();if(lim)ns=ns.slice(0,lim);
    if(!ns.length){el.innerHTML='<p class="news-empty">目前沒有新的公告。</p>';return}
    var openFirst=el.dataset.open!=='none';
    el.innerHTML=ns.map(function(n,i){return '<details class="news-item"'+((openFirst&&i===0)||el.dataset.open==='all'?' open':'')+'><summary><time>'+esc(n.date).replace(/-/g,'.')+'</time><span class="tt">'+(n.pinned?'<span class="pin">置頂</span>':'')+esc(n.title)+'</span></summary><div class="bd">'+esc(n.body)+'</div></details>'}).join('');
  }

  var off=0,SPAN=window.innerWidth<760?7:14;
  function renderVac(){
    var tb=$('vTable');if(!tb)return;
    var t0=today(),days=[];
    for(var i=0;i<SPAN;i++){var d=new Date(t0);d.setDate(t0.getDate()+off+i);days.push(d)}
    var td=ymd(t0);
    var h='<colgroup><col class="c-rm">'+days.map(function(){return '<col>'}).join('')+'</colgroup><thead><tr><th class="rm"></th>'+days.map(function(d,i){var we=d.getDay()===5||d.getDay()===6;return '<th class="'+(we?'we ':'')+(ymd(d)===td?'today':'')+'"><span class="w">'+(ymd(d)===td?'今天':'週'+WD[d.getDay()])+'</span><span class="d">'+d.getDate()+(d.getDate()===1||i===0?'<span class="m">'+(d.getMonth()+1)+'月</span>':'')+'</span></th>'}).join('')+'</tr></thead><tbody>';
    ROOMS.forEach(function(r){
      h+='<tr><th class="rm" scope="row"><a href="room-'+r.no+'.html"><b>'+r.name+'</b><small>'+r.cap+'</small></a></th>'+days.map(function(d){var s=stAt(ymd(d),r.no),we=d.getDay()===5||d.getDay()===6;return '<td class="'+(we?'we':'')+'" title="'+({open:'可預訂',full:'已滿',ask:'請洽詢'}[s])+'"><i class="st '+s+'"></i></td>'}).join('')+'</tr>';
    });
    h+='</tbody><tfoot><tr><th class="rm"><small style="display:inline">剩餘房間</small></th>'+days.map(function(d){var n=ROOMS.filter(function(r){return stAt(ymd(d),r.no)==='open'}).length;return '<td class="'+(n?'':'zero')+'"><b>'+n+'</b></td>'}).join('')+'</tr></tfoot>';
    tb.innerHTML=h;
    var a=days[0],b=days[days.length-1];
    $('vRange').textContent=(a.getMonth()+1)+'.'+a.getDate()+' — '+(b.getMonth()+1)+'.'+b.getDate();
    $('vPrev').disabled=off<=0;
    $('vNext').disabled=off+SPAN>=56;
    updatedLabel();
  }
  function updatedLabel(){
    var el=$('vUpdated');if(!el||!DATA.updated)return;
    var u=new Date(DATA.updated);
    el.textContent='最後更新　'+(u.getMonth()+1)+'月'+u.getDate()+'日 '+String(u.getHours()).padStart(2,'0')+':'+String(u.getMinutes()).padStart(2,'0')+'　・　實際空房以電話確認為準';
  }
  if($('vPrev')){
    $('vPrev').onclick=function(){off=Math.max(0,off-SPAN);renderVac()};
    $('vNext').onclick=function(){off+=SPAN;renderVac()};
  }

  /* 首頁：今晚剩幾間 + 七日摘要 */
  function renderTonight(){
    var el=$('tonight');if(!el)return;
    var t0=today(),html='';
    for(var i=0;i<7;i++){var d=new Date(t0);d.setDate(t0.getDate()+i);var n=ROOMS.filter(function(r){return stAt(ymd(d),r.no)==='open'}).length;
      html+='<li class="'+(n?'':'zero')+'"><span class="w">'+(i===0?'今晚':'週'+WD[d.getDay()])+'</span><span class="d">'+(d.getMonth()+1)+'/'+d.getDate()+'</span><b>'+n+'</b><small>間</small></li>'}
    el.innerHTML=html;
  }

  /* 房間頁：近期可訂 */
  function renderRoomAvail(){
    var el=$('rAvail');if(!el)return;
    var no=el.dataset.room,t0=today(),html='';
    for(var i=0;i<14;i++){var d=new Date(t0);d.setDate(t0.getDate()+i);var s=stAt(ymd(d),no),we=d.getDay()===5||d.getDay()===6;
      html+='<li class="'+s+(we?' we':'')+'" title="'+({open:'可預訂',full:'已滿',ask:'請洽詢'}[s])+'"><span class="w">'+WD[d.getDay()]+'</span><span class="d">'+d.getDate()+'</span><i class="st '+s+'"></i></li>'}
    el.innerHTML=html;
  }

  if($('newsList')||$('vTable')||$('tonight')||$('rAvail')){
    loadData().then(function(d){DATA=d;renderNews();renderVac();renderTonight();renderRoomAvail();updatedLabel()});
  }

  /* ---------- demo protection (NINTH LAB) ---------- */
  document.addEventListener('contextmenu',function(e){e.preventDefault()});
  document.addEventListener('dragstart',function(e){if(e.target.tagName==='IMG')e.preventDefault()});
  document.addEventListener('copy',function(e){e.preventDefault()});
  document.addEventListener('keydown',function(e){
    var k=(e.key||'').toLowerCase(),m=e.ctrlKey||e.metaKey;
    if(k==='f12'||(m&&['s','u','p'].indexOf(k)>-1)||(m&&e.shiftKey&&['i','j','c'].indexOf(k)>-1)||(e.metaKey&&e.altKey&&['i','j','c','u'].indexOf(k)>-1)){e.preventDefault();e.stopPropagation()}
  },true);
  try{console.log('%c示範版本 · 九號科技工作室 NINTH LAB','font:600 14px sans-serif;color:#b8582f');console.log('本網站設計與程式碼為九號科技工作室所有，未經授權請勿複製或使用。')}catch(_){}
})();
