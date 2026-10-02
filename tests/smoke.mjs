import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
assert.doesNotThrow(()=>new vm.Script(js));
for(const token of ['2026-10-02-20','gpxLastMatchIndex','function bearingBetween','function signedAngleDelta','function parseGpxText','function updateGpxPosition','function preflight','function initBattery','requestWakeLock','pageshow','txc_routeStartTime']) assert.ok(js.includes(token),'Falta el contracte: '+token);
const angle=(a,b)=>((b-a+540)%360)-180;
assert.equal(angle(350,10),20);
assert.equal(angle(10,350),-20);
console.log('Terra X Correr smoke tests: OK');