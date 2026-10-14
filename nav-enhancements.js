(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  let navActive = false;
  let saving = false;

  function startRoute(){
    try{
      const b=$('route-record');
      if(!b) return;
      if(/INICIAR/i.test(b.textContent)) b.click();
      setTimeout(updateRouteButtons,180);
    }catch(e){ console.warn('Iniciar ruta:',e); }
  }
  function saveRoute(){
    if(saving) return;
    try{
      const b=$('route-record');
      if(!b) return;
      if(!/ATURAR/i.test(b.textContent)){ showSaveStatus('Primer inicia la ruta.'); return; }
      saving=true; b.click();
      setTimeout(()=>{saving=false; updateRouteButtons();},300);
    }catch(e){ saving=false; console.warn('Desar ruta:',e); }
  }
  function showSaveStatus(text){ const st=$('route-status'); if(st) st.textContent=text; }
  function addTabletSizing(){
    if($('txc-nav-tablet-style')) return;
    const s=document.createElement('style'); s.id='txc-nav-tablet-style';
    s.textContent='@media (min-width:700px) and (orientation:portrait){#navegacio .nav-trip-grid .big-card.speed .value{font-size:clamp(82px,11vw,118px)!important}#navegacio .nav-trip-grid .big-card.speed .label{font-size:16px!important}#navegacio .nav-trip-grid .nav-trip-stats .nts strong{font-size:clamp(28px,4vw,38px)!important}#navegacio .nav-trip-grid .nav-trip-stats .nts span{font-size:12px!important}#navegacio .nav-trip-grid .nav-trip-main .value{font-size:clamp(54px,8vw,82px)!important}#navegacio .nav-trip-grid .nav-trip-main .big-partial{font-size:24px!important}#navegacio .nav-trip-grid .big-card.time .value{font-size:clamp(32px,4.5vw,44px)!important}#navegacio .nav-trip-grid .nav-weather .value{font-size:clamp(38px,5vw,52px)!important}.nav-start-route,.nav-save-route{grid-column:span 2!important;width:100%!important;display:block!important;min-height:50px!important;font-size:14px!important}}';
    document.head.appendChild(s);
  }
  function updateRouteButtons(){
    const start=$('nav-start-route'), save=$('nav-save-route'), rb=$('route-record');
    const recording=!!(rb && /ATURAR/i.test(rb.textContent));
    if(start){ start.disabled=recording; start.textContent=recording?'🟢 RUTA EN CURS':'▶ INICIAR RUTA'; }
    if(save){ save.disabled=!recording; save.textContent=recording?'💾 DESAR RUTA':'💾 RUTA DESADA'; }
  }
  function ensureRouteButtons(){
    const stats=document.querySelector('#navegacio .nav-trip-stats');
    if(!stats) return;
    if(!$('nav-start-route')){
      const b=document.createElement('button');
      b.id='nav-start-route'; b.type='button'; b.className='big-odo-btn nts-btn nav-start-route';
      b.textContent='▶ INICIAR RUTA'; b.style.gridColumn='span 2'; b.style.width='100%';
      b.addEventListener('click',startRoute); stats.insertBefore(b,stats.firstChild);
    }
    if(!$('nav-save-route')){
      const b=document.createElement('button');
      b.id='nav-save-route'; b.type='button'; b.className='big-odo-btn nts-btn nav-save-route';
      b.textContent='💾 DESAR RUTA'; b.style.gridColumn='1 / -1'; b.style.width='100%';
      b.addEventListener('click',saveRoute); stats.appendChild(b);
    }
    updateRouteButtons();
  }
  function isNavScreen(){ const el=$('navegacio'); return !!(el && el.classList.contains('active')); }
  function syncNavState(){
    const now=isNavScreen();
    if(now && !navActive){ navActive=true; ensureRouteButtons(); }
    else if(!now && navActive){ navActive=false; }
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
    const meta=document.querySelector('meta[name="app-version"]'); if(meta) meta.setAttribute('content','2026-10-14-05');
    const empty=document.querySelector('.routes-empty p');
    if(empty && /Comença un enregistrament/.test(empty.textContent)) empty.innerHTML='Entra a <strong>Navegació</strong> i prem <strong>INICIAR RUTA</strong>. Quan vulguis acabar-la, prem <strong>DESAR RUTA</strong> i posa-li un nom.';
    document.querySelectorAll('.editor-section p').forEach(p=>{ if(/Iniciar sortida/.test(p.textContent) && /Aturar sortida/.test(p.textContent)) p.innerHTML='<strong>Navegació</strong> mostra les estadístiques de la sortida. Prem <strong>INICIAR RUTA</strong> quan vulguis començar a enregistrar-la. Pots canviar de pantalla o fins i tot apagar la pantalla sense finalitzar-la. Quan vulguis acabar, prem <strong>DESAR RUTA</strong>, posa-li un nom i quedarà guardada a <strong>Rutes</strong> amb les seves estadístiques.'; });
    const st=$('route-status'); if(st && isNavScreen()){ const rb=$('route-record'); st.textContent=rb && /ATURAR/i.test(rb.textContent)?'Ruta en enregistrament · prem DESAR RUTA quan vulguis acabar':'Ruta aturada · prem INICIAR RUTA per començar'; }
  }
  function init(){
    addTabletSizing(); rearrangeNav(); updateTexts();
    document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>setTimeout(()=>{rearrangeNav();syncNavState();updateTexts();updateRouteButtons();},20)));
    setTimeout(()=>{addTabletSizing();rearrangeNav();syncNavState();updateTexts();updateRouteButtons();},150);
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') setTimeout(()=>{syncNavState();updateRouteButtons();},100); });
    setInterval(updateRouteButtons,1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
