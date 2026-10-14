(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  let navActive = false;
  let togglingRoute = false;
  let explicitRouteStart = false;

  async function toggleRoute(){
    if(togglingRoute) return;
    const rb=$('route-record');
    if(!rb) return;
    togglingRoute=true;
    try{
      const recording=!!(/ATURAR/i.test(rb.textContent));
      explicitRouteStart=!recording;
      rb.click();
      setTimeout(()=>{ updateRouteButton(); togglingRoute=false; },350);
    }catch(e){
      togglingRoute=false;
      console.warn('Ruta:',e);
    }
  }

  function addTabletSizing(){
    if($('txc-nav-tablet-style')) return;
    const s=document.createElement('style'); s.id='txc-nav-tablet-style';
    s.textContent=`
      /* Navegació: mesures compactes i resets sempre en una sola fila */
      #navegacio .nav-trip-stats{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important;}
      #navegacio .nav-trip-stats .nts-btn{grid-column:span 2!important;width:100%!important;min-height:46px!important;}
      #navegacio .nav-odo-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px!important;margin-top:6px!important;width:100%!important;}
      #navegacio .nav-odo-actions .big-odo-btn{grid-column:auto!important;min-width:0!important;width:100%!important;min-height:30px!important;height:30px!important;padding:3px 3px!important;font-size:9px!important;white-space:nowrap!important;}
      #navegacio .nav-odo-actions .nav-route-zero{min-height:30px!important;height:30px!important;font-size:9px!important;padding:3px 2px!important;}
      #navegacio .nav-start-route{background:var(--accent)!important;color:#000!important;border:2px solid var(--accent)!important;}
      #navegacio .nav-start-route.recording{background:#3b1018!important;color:#ff8a80!important;border:2px solid var(--danger)!important;}
      #navegacio .nav-trip-stats .nts-btn:disabled{opacity:1!important;}
      #navegacio .big-card.time{min-height:0!important;overflow:hidden!important;padding-block:8px!important;}
      #navegacio .big-card.time .label{font-size:9px!important;margin:0!important;}
      #navegacio .big-card.time .value{font-size:clamp(40px,5.2vw,60px)!important;line-height:.92!important;}

      /* Instrumentació / odòmetre: quatre ajustos junts i els dos resets junts a sota. */
      #instruments .odo-controls{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:auto auto!important;gap:5px!important;align-items:center!important;justify-items:stretch!important;flex-wrap:nowrap!important;}
      #instruments .odo-controls > .odo-btn:not(.danger){grid-row:1!important;min-width:0!important;min-height:32px!important;padding:4px 3px!important;font-size:11px!important;}
      #instruments .odo-controls > #odo-reset{grid-column:2!important;grid-row:2!important;min-width:0!important;min-height:30px!important;padding:3px 4px!important;font-size:10px!important;margin:0!important;}
      #instruments .odo-controls > #odo-reset-total{grid-column:3!important;grid-row:2!important;min-width:0!important;min-height:30px!important;padding:3px 4px!important;font-size:10px!important;margin:0!important;}

      @media(min-width:700px) and (orientation:portrait){
        #navegacio .nav-trip-stats .nts span{font-size:13px!important;}
        #navegacio .nav-trip-stats .nts strong{font-size:clamp(30px,4.2vw,42px)!important;}
        #navegacio .nav-trip-stats .nts small{font-size:12px!important;}
        #navegacio .nav-trip-stats .nts-btn{min-height:52px!important;font-size:15px!important;}
        #navegacio .nav-odo-actions .big-odo-btn{min-height:34px!important;height:34px!important;font-size:11px!important;padding:4px 4px!important;}
        #navegacio .big-card.time .label{font-size:10px!important;}
        #navegacio .big-card.time .value{font-size:clamp(44px,5vw,64px)!important;}
        #instruments .odo-controls > .odo-btn:not(.danger){min-height:34px!important;font-size:12px!important;}
        #instruments .odo-controls > #odo-reset,#instruments .odo-controls > #odo-reset-total{min-height:32px!important;font-size:11px!important;}
      }
      @media(max-width:520px){
        #navegacio .nav-trip-stats .nts span{font-size:8px!important;}
        #navegacio .nav-trip-stats .nts strong{font-size:18px!important;}
        #navegacio .nav-trip-stats .nts small{font-size:9px!important;}
        #navegacio .nav-trip-stats .nts-btn{min-height:42px!important;font-size:11px!important;}
        #navegacio .nav-odo-actions .big-odo-btn{font-size:9px!important;min-height:28px!important;height:28px!important;padding:2px!important;}
        #navegacio .big-card.time{padding-block:6px!important;}
        #navegacio .big-card.time .value{font-size:clamp(38px,11vw,52px)!important;}
        #instruments .odo-controls{gap:4px!important;}
        #instruments .odo-controls > .odo-btn:not(.danger){font-size:10px!important;min-height:30px!important;padding:3px 2px!important;}
        #instruments .odo-controls > #odo-reset,#instruments .odo-controls > #odo-reset-total{font-size:9px!important;min-height:28px!important;padding:2px!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function updateRouteButton(){
    const start=$('nav-start-route'), rb=$('route-record');
    const recording=!!(rb && /ATURAR/i.test(rb.textContent));
    if(!start) return;
    start.disabled=false;
    start.classList.toggle('recording',recording);
    start.textContent=recording?'■ ATURAR RUTA':'▶ INICIAR RUTA';
    const st=$('route-status');
    if(st && isNavScreen()) st.textContent=recording?'Ruta en curs · prem ATURAR RUTA quan vulguis acabar':'Ruta aturada · prem INICIAR RUTA per començar';
  }

  function findOdoButtons(){
    const buttons=[...document.querySelectorAll('#navegacio button')];
    return {
      total:buttons.find(b=>/TOTAL\s+A\s*0/i.test(b.textContent)),
      partial:buttons.find(b=>/PARCIAL\s+A\s*0/i.test(b.textContent)),
      trip:buttons.find(b=>/SORTIDA\s+A\s*0|RUTA\s+A\s*0/i.test(b.textContent))
    };
  }

  function ensureRouteButtons(){
    const stats=document.querySelector('#navegacio .nav-trip-stats');
    const odo=document.querySelector('#navegacio .nav-odo-actions');
    if(!stats) return;

    const found=findOdoButtons();
    if(odo){
      [found.total,found.trip,found.partial].filter(Boolean).forEach((btn,i)=>{
        btn.classList.add('big-odo-btn');
        btn.style.gridColumn='auto';
        btn.style.width='100%';
        if(i===1){
          btn.textContent='↺ RUTA A 0';
          btn.classList.add('nav-route-zero');
        }
        odo.appendChild(btn);
      });
    }

    let start=$('nav-start-route');
    if(!start){
      start=document.createElement('button');
      start.id='nav-start-route';
      start.type='button';
      start.className='big-odo-btn nts-btn nav-start-route';
      start.addEventListener('click',toggleRoute);
    }
    start.textContent='▶ INICIAR RUTA';
    const range=$('nav-range-set');
    if(range) range.textContent='⛽ AUTONOMIA';
    stats.appendChild(range||document.createElement('span'));
    stats.appendChild(start);

    const oldSave=$('nav-save-route');
    if(oldSave) oldSave.remove();
    updateRouteButton();
  }

  function isNavScreen(){ const el=$('navegacio'); return !!(el && el.classList.contains('active')); }

  function stopUnexpectedAutoRecording(){
    const rb=$('route-record');
    const recording=!!(rb && /ATURAR/i.test(rb.textContent));
    if(!isNavScreen() || !recording || explicitRouteStart) return;
    if(typeof state!=='undefined' && state.trackRecording){
      state.trackRecording=false;
      state.trackSessionStart=null;
      state.trackStartedAt=null;
      try{ if(typeof saveActiveRoute==='function') saveActiveRoute(); }catch(e){}
      updateRouteButton();
      if(typeof showStatus==='function') showStatus('Ruta preparada · prem INICIAR RUTA per començar');
    }
  }

  function openNavigationAsPrimary(){
    const navTab=[...document.querySelectorAll('.tab')].find(t=>/Navegaci[oó]/i.test((t.textContent||'').trim()));
    if(navTab && !isNavScreen()) navTab.click();
  }

  function syncNavState(){
    const now=isNavScreen();
    if(now && !navActive){ navActive=true; ensureRouteButtons(); setTimeout(stopUnexpectedAutoRecording,80); }
    else if(!now && navActive){ navActive=false; explicitRouteStart=false; }
  }

  function rearrangeNav(){
    const n=$('navegacio'), grid=n && n.querySelector('.nav-trip-grid'); if(!grid) return;
    const speed=grid.querySelector('.big-card.speed'), stats=grid.querySelector('.nav-trip-stats'), odo=grid.querySelector('.nav-trip-main'), time=grid.querySelector('.big-card.time'), weather=grid.querySelector('.nav-weather');
    const cap=grid.querySelector('.big-card.cap'), lean=grid.querySelector('.nav-lean');
    if(cap) cap.remove(); if(lean) lean.remove();
    if(speed) grid.appendChild(speed); if(stats) grid.appendChild(stats); if(odo) grid.appendChild(odo); if(time) grid.appendChild(time); if(weather) grid.appendChild(weather);
    ensureRouteButtons();
  }

  function updateTexts(){
    const meta=document.querySelector('meta[name="app-version"]'); if(meta) meta.setAttribute('content','2026-10-15-01');
    const empty=document.querySelector('.routes-empty p');
    if(empty && /Comença un enregistrament/.test(empty.textContent)) empty.innerHTML='Entra a <strong>Navegació</strong> i prem <strong>INICIAR RUTA</strong>. Quan vulguis acabar-la, prem <strong>ATURAR RUTA</strong> i posa-li un nom.';
    document.querySelectorAll('.editor-section p').forEach(p=>{
      if(/Iniciar sortida/.test(p.textContent) && /Aturar sortida/.test(p.textContent)) p.innerHTML='<strong>Navegació</strong> mostra les estadístiques de la sortida. Prem <strong>INICIAR RUTA</strong> quan vulguis començar a enregistrar-la. Quan vulguis acabar, prem <strong>ATURAR RUTA</strong>, posa-li un nom i quedarà guardada a <strong>Rutes</strong> amb les seves estadístiques.';
    });
  }

  function init(){
    addTabletSizing();
    rearrangeNav();
    updateTexts();
    openNavigationAsPrimary();
    document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>setTimeout(()=>{rearrangeNav();syncNavState();updateTexts();updateRouteButton();},20)));
    setTimeout(()=>{addTabletSizing();rearrangeNav();syncNavState();updateTexts();updateRouteButton();stopUnexpectedAutoRecording();},150);
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') setTimeout(()=>{syncNavState();updateRouteButton();stopUnexpectedAutoRecording();},100); });
    setInterval(()=>{stopUnexpectedAutoRecording();updateRouteButton();},1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
