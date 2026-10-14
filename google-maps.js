(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY_STORE = 'txc_google_maps_api_key';
  const MODE_STORE = 'txc_map_provider';
  let mode = localStorage.getItem(MODE_STORE) || 'google';
  let mapType = 'roadmap';
  let zoom = 15;
  let frame, map, tiles, svg, info, attribution, controls;

  function coords() {
    const lat = Number.isFinite(window.__txcGoogleLat) ? window.__txcGoogleLat : 41.65;
    const lon = Number.isFinite(window.__txcGoogleLon) ? window.__txcGoogleLon : 1.75;
    return { lat, lon };
  }
  function key() { return (localStorage.getItem(KEY_STORE) || '').trim(); }
  function googleUrl() {
    const p = coords();
    return 'https://www.google.com/maps/embed/v1/view?key=' + encodeURIComponent(key()) +
      '&center=' + p.lat + ',' + p.lon + '&zoom=' + zoom + '&maptype=' + mapType;
  }
  function openGoogleMaps() {
    const p = coords();
    const url = 'https://www.google.com/maps/@?api=1&map_action=map&center=' +
      encodeURIComponent(p.lat + ',' + p.lon) + '&zoom=' + zoom;
    window.open(url, '_blank', 'noopener');
  }
  function setMode(next) {
    if (next === 'google' && !key()) {
      const entered = window.prompt('Per mostrar Google Maps dins de Terra X Correr, enganxa la teva clau API de Google Maps Embed. La clau ha d’estar restringida al domini cathalmcdonegal.github.io.\n\nSi encara no en tens, prem Cancel·lar per continuar amb OpenStreetMap.');
      if (entered && entered.trim()) localStorage.setItem(KEY_STORE, entered.trim());
      if (!key()) {
        mode = 'osm';
        localStorage.setItem(MODE_STORE, mode);
        update();
        openGoogleMaps();
        return;
      }
    }
    mode = next;
    localStorage.setItem(MODE_STORE, mode);
    update();
  }
  function refreshGoogle() {
    if (!frame || !key()) return;
    frame.src = googleUrl();
  }
  function update() {
    if (!map || !tiles || !svg) return;
    const google = mode === 'google' && !!key();
    frame.style.display = google ? 'block' : 'none';
    tiles.style.display = google ? 'none' : 'block';
    svg.style.display = google ? 'none' : 'block';
    if (info) {
      const strong = info.querySelector('strong');
      if (strong) strong.textContent = google ? (mapType === 'satellite' ? 'GOOGLE SATÈL·LIT' : 'GOOGLE MAPS') : 'OPENSTREETMAP';
      const br = info.querySelector('br');
      if (br && br.nextSibling) br.nextSibling.textContent = google ? 'Mapa integrat' : 'OpenStreetMap';
    }
    if (attribution) attribution.textContent = google ? 'Google Maps' : '© OpenStreetMap contributors';
    const providerBtn = $('txc-map-provider');
    if (providerBtn) providerBtn.textContent = google ? 'OSM' : 'GOOGLE';
    const satBtn = $('txc-map-satellite');
    if (satBtn) {
      satBtn.style.display = google ? 'block' : 'none';
      satBtn.textContent = mapType === 'satellite' ? 'MAPA' : 'SAT';
    }
    if (google) refreshGoogle();
  }
  function addButton(id, label, title, handler) {
    if ($(id)) return $(id);
    const b = document.createElement('button');
    b.id = id; b.type = 'button'; b.textContent = label; b.title = title;
    b.setAttribute('aria-label', title);
    b.addEventListener('click', handler);
    controls.appendChild(b);
    return b;
  }
  function init() {
    map = $('ruta-map'); tiles = $('route-map-tiles'); svg = $('route-map-svg');
    info = map && map.querySelector('.route-map-info');
    attribution = map && map.querySelector('.route-map-attribution');
    controls = map && map.querySelector('.route-map-controls');
    if (!map || !tiles || !svg || !controls || $('txc-google-map-frame')) return;
    frame = document.createElement('iframe');
    frame.id = 'txc-google-map-frame';
    frame.title = 'Google Maps';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;z-index:5;display:none;background:#202020';
    map.insertBefore(frame, controls);
    controls.style.zIndex = '30';
    addButton('txc-map-provider', mode === 'google' ? 'OSM' : 'GOOGLE', 'Canvia entre Google Maps i OpenStreetMap', () => setMode(mode === 'google' ? 'osm' : 'google'));
    addButton('txc-map-satellite', 'SAT', 'Canvia mapa o satèl·lit', () => { mapType = mapType === 'satellite' ? 'roadmap' : 'satellite'; update(); });
    const nav = addButton('txc-map-navigate', '↗', 'Obre la ubicació a Google Maps', openGoogleMaps);
    nav.style.background = '#00e676'; nav.style.color = '#000';
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(pos => {
        window.__txcGoogleLat = pos.coords.latitude;
        window.__txcGoogleLon = pos.coords.longitude;
        if (mode === 'google' && key()) refreshGoogle();
      }, () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
    }
    const oldLocate = $('route-locate');
    if (oldLocate) oldLocate.addEventListener('click', () => {
      if (mode === 'google' && key()) refreshGoogle();
    });
    const oldZoomIn = $('route-zoom-in'), oldZoomOut = $('route-zoom-out');
    if (oldZoomIn) oldZoomIn.addEventListener('click', () => { zoom = Math.min(21, zoom + 1); if (mode === 'google') refreshGoogle(); });
    if (oldZoomOut) oldZoomOut.addEventListener('click', () => { zoom = Math.max(3, zoom - 1); if (mode === 'google') refreshGoogle(); });
    if (mode === 'google' && !key()) mode = 'osm';
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();