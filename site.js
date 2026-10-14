/* 공통: 아이콘 · 모바일 메뉴 · 가로 한 줄 · 공사 전후 · 떠오름 */
(function(){
var S='<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
var ICON=window.ICON={menu:S+'<path d="M4 7h16M4 12h16M4 17h16"/></svg>',close:S+'<path d="M6 6l12 12M18 6 6 18"/></svg>',
  prev:S+'<path d="m15 6-6 6 6 6"/></svg>',next:S+'<path d="m9 6 6 6-6 6"/></svg>'};
window.XI=ICON.close;

/* 가로 한 줄 */
window.rail=function(inner,cls){return '<div class="rail '+(cls||'')+'"><div class="rail-track">'+inner+'</div><div class="rail-ctl"><div class="rail-bar"><i></i></div><button type="button" class="rail-btn prev" aria-label="이전">'+ICON.prev+'</button><button type="button" class="rail-btn next" aria-label="다음">'+ICON.next+'</button></div></div>'};
window.initRails=function(scope){(scope||document).querySelectorAll('.rail:not([data-on])').forEach(function(r){r.dataset.on=1;
  var t=r.querySelector('.rail-track'),bar=r.querySelector('.rail-bar i'),pv=r.querySelector('.prev'),nx=r.querySelector('.next');
  function upd(){var max=t.scrollWidth-t.clientWidth;var vis=t.clientWidth/t.scrollWidth;bar.style.width=(Math.min(1,vis)*100)+'%';
    var p=max>0?t.scrollLeft/max:0;bar.style.transform='translateX('+(p*(1/Math.max(vis,.0001)-1)*100)+'%)';
    pv.disabled=t.scrollLeft<4;nx.disabled=t.scrollLeft>max-4;r.querySelector('.rail-ctl').style.display=max>4?'':'none'}
  function step(d){var it=t.firstElementChild;var w=it?it.getBoundingClientRect().width+16:t.clientWidth*.8;t.scrollBy({left:d*Math.max(w,t.clientWidth*.6),behavior:'smooth'})}
  pv.onclick=function(){step(-1)};nx.onclick=function(){step(1)};
  t.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
  t.querySelectorAll('img').forEach(function(i){i.addEventListener('load',upd)});setTimeout(upd,60);upd();
  /* 마우스로 끌기 */
  var down=false,moved=false,sx=0,sl=0;
  t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('.ba'))return;down=true;moved=false;sx=e.clientX;sl=t.scrollLeft;e.preventDefault()});
  t.addEventListener('dragstart',function(e){e.preventDefault()});
  window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(!moved&&Math.abs(dx)>6){moved=true;t.classList.add('drag')}if(moved){t.scrollLeft=sl-dx;e.preventDefault()}});
  function end(){if(!down)return;down=false;if(moved){var cur=t.scrollLeft;t.classList.remove('drag');t.scrollLeft=cur;setTimeout(function(){moved=false},0)}}
  window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
  t.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation()}},true);
})};

/* 공사 전·후: 마우스는 사진 어디든, 손가락은 가운데 손잡이만 (나머지는 넘기기) */
window.initBA=function(scope){(scope||document).querySelectorAll('.ba:not([data-on])').forEach(function(el){el.dataset.on=1;
  var bf=el.querySelector('.before'),h=el.querySelector('.handle'),d=false;
  function set(x){var r=el.getBoundingClientRect();var p=Math.min(100,Math.max(0,(x-r.left)/r.width*100));bf.style.clipPath='inset(0 '+(100-p)+'% 0 0)';h.style.left=p+'%'}
  el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'&&!e.target.closest('.handle'))return;d=true;el.setPointerCapture(e.pointerId);set(e.clientX);e.stopPropagation()});
  el.addEventListener('pointermove',function(e){if(d)set(e.clientX)});
  el.addEventListener('pointerup',function(){d=false});el.addEventListener('pointercancel',function(){d=false});
})};


/* 첫 페이지: 휠 한 번에 한 구역씩 (PC) */
function fullpage(){
  var pages=[].slice.call(document.querySelectorAll('.hero,section.screen,section.contact'));
  if(pages.length<3)return;
  var mq=matchMedia('(min-width:901px) and (min-height:640px) and (pointer:fine)');
  var busy=false,last=0,HDR=72;
  function topOf(el){return Math.max(0,el.getBoundingClientRect().top+scrollY-HDR)}
  function cur(){var y=scrollY,b=0,d=1e9;pages.forEach(function(p,i){var t=Math.abs(topOf(p)-y);if(t<d){d=t;b=i}});return b}
  function go(y){busy=true;animate(scrollY,Math.min(y,document.documentElement.scrollHeight-innerHeight))}
  function animate(from,to){var t0=performance.now(),D=650;
    function f(t){var k=Math.min(1,(t-t0)/D),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;scrollTo(0,from+(to-from)*e);if(k<1)requestAnimationFrame(f);else setTimeout(function(){busy=false},80)}
    requestAnimationFrame(f)}
  window.addEventListener('wheel',function(e){
    if(!mq.matches||e.ctrlKey)return;
    if(document.querySelector('.ov.open,.cm.open,.lbx.open,.nav.open'))return;
    if(e.target.closest&&e.target.closest('.rail-track')&&Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    e.preventDefault();
    var now=performance.now(),gap=now-last;last=now;
    if(busy||Math.abs(e.deltaY)<2)return;
    if(gap<140&&now-endT<500)return;
    var dir=e.deltaY>0?1:-1,i=cur(),p=pages[i],r=p.getBoundingClientRect(),vh=innerHeight;
    /* 화면보다 긴 구역은 안에서 먼저 내려감 */
    if(dir>0&&r.bottom>vh+60){go(scrollY+Math.min(r.bottom-vh,vh-HDR));endT=now+700;return}
    if(dir<0&&r.top<HDR-60){go(scrollY-Math.min(HDR-r.top,vh-HDR));endT=now+700;return}
    var n=Math.max(0,Math.min(pages.length-1,i+dir));if(n===i)return;
    go(topOf(pages[n]));endT=now+700;
  },{passive:false});
  var endT=0;
  document.documentElement.classList.add('fp');
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a||!mq.matches)return;var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();go(t.classList.contains('hero')?0:topOf(t))});
}

/* 들어올 때 떠오름 */
function reveal(){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var sel='section .eyebrow,section h2,section .sub,.pg-head h1,main h1,.cards>.card,.rail,.ba-grid,.two>*,.flow,.cg,.malls,.faq,.csearch,.more-cases,.facts';
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll(sel).forEach(function(el){if(el.closest('.ov,.cm'))return;
    el.classList.add('rv');var sib=el.parentElement&&el.parentElement.classList.contains('cards')?[].indexOf.call(el.parentElement.children,el):0;
    if(sib)el.style.transitionDelay=(sib%4)*90+'ms';io.observe(el)});
}

document.addEventListener('DOMContentLoaded',function(){
  initBA();initRails();reveal();fullpage();
  var bar=document.querySelector('.bar');if(bar){var sc=function(){bar.classList.toggle('sc',scrollY>4)};addEventListener('scroll',sc,{passive:true});sc()}
  var b=document.querySelector('.mbtn'),n=document.querySelector('.bar .nav');if(!b||!n)return;
  function sh(o){n.classList.toggle('open',o);b.innerHTML=o?ICON.close:ICON.menu;b.setAttribute('aria-expanded',o)}
  b.addEventListener('click',function(){sh(!n.classList.contains('open'))});
  n.addEventListener('click',function(e){var a=e.target.closest('a');if(!a||!n.classList.contains('open'))return;if(a.parentElement.classList.contains('dd')){e.preventDefault();return}sh(false)});
  window.addEventListener('resize',function(){if(innerWidth>900)sh(false)});
});
})();
