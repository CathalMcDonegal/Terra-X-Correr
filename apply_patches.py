#!/usr/bin/env python3
"""Aplica correccions a index.html de Terra X Correr.
Ús:  python3 apply_patches.py index.html
Fa una còpia index.html.bak i només aplica cada canvi si l'ancoratge
coincideix exactament una vegada."""
import re, sys, shutil

path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(path, encoding="utf-8").read()
shutil.copy(path, path + ".bak")


def rep(name, old, new):
    global s
    n = s.count(old)
    if n != 1:
        print(f"✗ {name}: {n} coincidències, no aplicat")
        return
    s = s.replace(old, new)
    print(f"✓ {name}")


def rex(name, pat, new):
    global s
    s2, n = re.subn(pat, lambda m: m.group(1) + new if m.groups() else new, s, count=1, flags=re.S)
    if n != 1:
        print(f"✗ {name}: no aplicat")
        return
    s = s2
    print(f"✓ {name}")


# --- RUTA: enregistrament ---
rep("Ruta: no bloquejar el track després d'un salt GPS",
    "if(distM>600||implied>180)return;", "if(implied>180)return;")
rep("Ruta: nova gravació sempre neta",
    "if(!state.trackPoints.length){state.trackDistanceKm=0;state.routeMaxSpeed=0;state.trackPoints=[];}",
    "state.trackDistanceKm=0;state.routeMaxSpeed=0;state.trackPoints=[];")
rep("Ruta: netejar després de guardar",
    "state.routeViewPoints=null;updateRoutePanel();renderRouteHistory();",
    "state.routeViewPoints=null;state.trackPoints=[];state.trackDistanceKm=0;state.routeMaxSpeed=0;updateRoutePanel();renderRouteHistory();")
rep("Ruta: no perdre l'inici en rutes llargues",
    "if(state.trackPoints.length>12000)state.trackPoints.shift();",
    "if(state.trackPoints.length>12000)state.trackPoints=state.trackPoints.filter((_,i,a)=>i%2===0||i===a.length-1);")

# --- RUTA: mapa ---
rep("Mapa: no renderitzar amb la pestanya oculta",
    "if(!map||!tiles||!svg)return;const pts=routeMapPoints();",
    'if(!map||!tiles||!svg||!$("ruta").classList.contains("active"))return;const pts=routeMapPoints();')
rep("Mapa: arrossegament correcte (Mercator)",
    "state.routeMap.centerLon=d.lon-(e.clientX-d.x)/scale*360;const latPerPx=170/scale;state.routeMap.centerLat=Math.max(-85,Math.min(85,d.lat+(e.clientY-d.y)*latPerPx));renderRouteMap();",
    "const c0=llToWorld(d.lat,d.lon,z),n=2**z,nx=c0.x-(e.clientX-d.x)/TILE_SIZE,ny=c0.y-(e.clientY-d.y)/TILE_SIZE;state.routeMap.centerLon=nx/n*360-180;state.routeMap.centerLat=Math.max(-85,Math.min(85,Math.atan(Math.sinh(Math.PI*(1-2*ny/n)))*180/Math.PI));renderRouteMap();")

rep("Mapa: tessel·les en mode CORS (permet desar-les offline al sw.js)",
    "img.draggable=false;img.src=", 'img.draggable=false;img.crossOrigin="anonymous";img.src=')

# --- GPS / odòmetre / temps ---
rep("Odòmetre: ignorar soroll GPS quan estàs parat",
    "const minMoveM=moving?2:4;", "const minMoveM=moving?2:Math.max(4,accuracy||0);")
rep("Meteo: no reintentar a cada fix si falla",
    "return; // cada 10 min",
    "return; // cada 10 min\n      lastWeatherFetch = now - 8 * 60 * 1000; // si falla, reintenta en 2 min")

# --- Roadbook ---
rex("Zoom −: recalcular el disseny",
    r"(state\.zoom = Math\.max\(0\.2, \+\(state\.zoom - 0\.25\)\.toFixed\(2\)\);\s*await )renderPage\(state\.currentPage\)",
    "renderAllPages()")
rep("Botó GPX al roadbook (abans no es podia carregar)",
    '<button class="rb-btn primary wide" id="btn-fullscreen">Pantalla</button>',
    '<label class="rb-btn wide file-btn" for="gpx-input">GPX</label>\n          <button class="rb-btn primary wide" id="btn-fullscreen">Pantalla</button>')
rep("Barra roadbook: 3 columnes",
    ".rb-toolbar .rb-row:nth-child(2) { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }",
    ".rb-toolbar .rb-row:nth-child(2) { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }")

# --- Llegibilitat ---
rep("CSS: textos mínims de 11 px",
    "</style>",
    """.route-stat .label,.route-stat .unit,.route-status,.route-map-info,.route-history-date,.route-detail-date,.route-detail-stat span,.route-detail-stat small,.nav-lean-sub,.nav-lean-ticks,.nav-lean-readout span,.nav-lean-readout small,.nav-lean-reset{font-size:11px}
    .route-history-metric span,.route-map-attribution,.route-history-actions button{font-size:10px}
    .route-history-actions button{font-size:12px}
</style>""")

# --- Manual ---
rep("Manual: frase trencada (comandament)",
    "En  també controla les funcions assignades.", "Un gamepad amb joystick també funciona.")
rep("Manual: PRE-RUTA inexistent",
    "Fes servir <strong>PRE-RUTA</strong> per revisar GPS, precisió, roadbook, GPX, comandament, bateria, pantalla i mode .",
    "Comprova que el GPS indiqui bona precisió, que el roadbook estigui carregat i que la bateria sigui suficient.")
rex("Manual: Navegació segons la pantalla real",
    r"(velocitat, direcció, hora, )temps en ruta,.*?posa a zero només el parcial\.",
    "inclinació i meteorologia. <strong>⛽ PARCIAL A 0</strong> posa a zero només el parcial.")
for n in range(5, 12):
    rep(f"Manual: secció {n}→{n-1}", f"<h3>{n}. ", f"<h3>{n-1}. ")

rep("Versió de l'app",
    '<meta name="app-version" content="2026-10-04-21">',
    '<meta name="app-version" content="2026-10-05-01">')

open(path, "w", encoding="utf-8").write(s)
print("Fet. Recorda pujar la versió de la memòria cau a sw.js.")
