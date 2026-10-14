(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  let navActive = false;
  let finishing = false;

  function ensureTripStarted(){
    try {
      const b=$('route-record');
      if(!b) return;
      if(/INICIAR/i.test(b.textContent)) b.click();
    } catch(e){ console.warn('Auto ruta:',e); }
  }

  function finishTripIfNeeded(){
    if(finishing) return;
    try{
      const b=$('route-record');
      if(!b || !/ATURAR/i.test(b.textContent)) return;
      finishing=true;
      b.click();
    }catch(e){ console.warn('Final ruta:',e); }
    finally{ setTimeout(()=>{finishing=false;},200); }
  }

  function isNavScreen(){
    const el=$('navegacio');
    return !!(el && el.classList.contains('active'));
  }

  function syncNavState(){
    const now=isNavScreen();
    if(now && !navActive){ navActive=true; ensureTripStarted(); }
    else if(!now && navActive){ navActive=false; finishTripIfNeeded(); }
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
  }

  function init(){
    rearrangeNav();
    const st=$('route-status');
    if(st) st.textContent='La Navegació enregistra la ruta automàticament';
    document.querySelectorAll('.tab').forEach(t=>{
      t.addEventListener('click',()=>setTimeout(()=>{rearrangeNav();syncNavState();},20));
    });
    setTimeout(()=>{rearrangeNav();syncNavState();},150);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible') setTimeout(syncNavState,100);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
