(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  let navActive = false;
  let saving = false;

  function ensureTripStarted(){
    try{
      const b=$('route-record');
      if(!b) return;
      if(/INICIAR/i.test(b.textContent)) b.click();
    }catch(e){ console.warn('Inici ruta:',e); }
  }

  function saveRoute(){
    if(saving) return;
    try{
      const b=$('route-record');
      if(!b) return;
      if(!/ATURAR/i.test(b.textContent)){
        showSaveStatus('No hi ha cap ruta en curs.');
        return;
      }
      saving=true;
      b.click();
      setTimeout(()=>{saving=false; updateSaveButton();},300);
    }catch(e){
      saving=false;
      console.warn('Desar ruta:',e);
    }
  }

  function showSaveStatus(text){
    const st=$('route-status');
    if(st) st.textContent=text;
  }

  function updateSaveButton(){
    const b=$('nav-save-route');
    const rb=$('route-record');
    if(!b) return;
    const recording=!!(rb && /ATURAR/i.test(rb.textContent));
    b.disabled=!recording;
    b.textContent=recording?'💾 DESAR RUTA':'💾 RUTA DESADA';
  }

  function ensureSaveButton(){
    const stats=document.querySelector('#navegacio .nav-trip-stats');
    if(!stats || $('nav-save-route')) return;
    const b=document.createElement('button');
    b.id='nav-save-route';
    b.type='button';
    b.className='big-odo-btn nts-btn nav-save-route';
    b.textContent='💾 DESAR RUTA';
    b.addEventListener('click',saveRoute);
    stats.appendChild(b);
    updateSaveButton();
  }

  function isNavScreen(){
    const el=$('navegacio');
    return !!(el && el.classList.contains('active'));
  }

  function syncNavState(){
    const now=isNavScreen();
    if(now && !navActive){
      navActive=true;
      ensureTripStarted();
      setTimeout(updateSaveButton,120);
    }else if(!now && navActive){
      /* Sortir de Navegació NO finalitza la ruta. Continua enregistrant-se. */
      navActive=false;
    }
  }

  function rearrangeNav(){
    const n=$('navegacio'), grid=n && n.querySelector('.nav-trip-grid');
    if(!grid) return;
    const speed=grid.querySelector('.big-card.speed');
    const stats=grid.querySelector('.nav-trip-stats');
    const odo=grid.querySelector('.nav-trip-main');
    const time=grid.querySelector('.big-card.time');
    const weather=grid.querySelector('.nav-weather');
    const cap=grid.querySelector('.big-card.cap');
    const lean=grid.querySelector('.nav-lean');
    if(cap) cap.remove();
    if(lean) lean.remove();
    if(speed) grid.appendChild(speed);
    if(stats) grid.appendChild(stats);
    if(odo) grid.appendChild(odo);
    if(time) grid.appendChild(time);
    if(weather) grid.appendChild(weather);
    ensureSaveButton();
  }

  function updateTexts(){
    const meta=document.querySelector('meta[name="app-version"]');
    if(meta) meta.setAttribute('content','2026-10-14-02');
    const empty=document.querySelector('.routes-empty p');
    if(empty && /Comença un enregistrament/.test(empty.textContent)) empty.innerHTML='Entra a <strong>Navegació</strong> i la ruta començarà a enregistrar-se. Quan vulguis acabar-la, prem <strong>DESAR RUTA</strong> i posa-li un nom.';
    document.querySelectorAll('.editor-section p').forEach(p=>{
      if(/Iniciar sortida/.test(p.textContent) && /Aturar sortida/.test(p.textContent)){
        p.innerHTML='<strong>Navegació</strong> inicia l’enregistrament de la ruta. Pots canviar de pantalla o fins i tot apagar la pantalla sense finalitzar-la. Quan vulguis acabar, prem <strong>DESAR RUTA</strong>, posa-li un nom i quedarà guardada a <strong>Rutes</strong> amb les seves estadístiques.';
      }
    });
    const st=$('route-status');
    if(st && isNavScreen()) st.textContent='Ruta en enregistrament · prem DESAR RUTA quan vulguis acabar';
  }

  function init(){
    rearrangeNav();
    updateTexts();
    document.querySelectorAll('.tab').forEach(t=>{
      t.addEventListener('click',()=>setTimeout(()=>{
        rearrangeNav();
        syncNavState();
        updateTexts();
        updateSaveButton();
      },20));
    });
    setTimeout(()=>{
      rearrangeNav();
      syncNavState();
      updateTexts();
      updateSaveButton();
    },150);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible') setTimeout(()=>{
        syncNavState();
        updateSaveButton();
      },100);
    });
    setInterval(updateSaveButton,1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
