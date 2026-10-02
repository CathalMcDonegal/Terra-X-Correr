# Terra X Correr

Lector i instrumentació de roadbooks per a moto i rally, pensat per funcionar com a PWA al mòbil.

## Funcions

- Roadbook PDF amb renderitzat lazy i persistència local.
- Mode **RALLY** amb ODO, CAP, velocitat, pàgina i alertes.
- Importació de **GPX** i persistència local.
- Detecció automàtica de punts importants: girs dreta/esquerra, canvis de sentit i waypoints amb nom.
- Seguiment GPX per segments amb continuïtat per evitar salts entre trams paral·lels.
- Odòmetre total i parcial; el parcial serveix per controlar els km des de l’últim repostatge.
- Mode **Navegació** per fer una sortida sense roadbook.
- Mode **Instrumentació** per tenir el roadbook en un altre dispositiu.
- GPS, CAP, brúixola activable i suport de comandaments HID/Gamepad.
- Wake Lock amb recuperació en tornar a primer pla.
- Avís de bateria baixa quan el navegador ofereix Battery API.
- Comprovació **PRE-RUTA** abans de sortir.
- Funcionament PWA/offline de les dades locals.

## Ús

1. Instal·la la PWA a la pantalla d’inici.
2. Abans de sortir, dona permís de localització i espera una fix GPS estable.
3. Si el roadbook és en un altre aparell, usa **Instrumentació** com a quadre d’instruments.
4. En rally, carrega el PDF i, si escau, el GPX; entra a **RALLY** i passa la comprovació **PRE-RUTA**.

## Dades i privacitat

Les dades de configuració, odòmetres, roadbook i GPX es desen localment al dispositiu. No hi ha un compte ni un núvol propi de Terra X Correr.

## Desenvolupament

La comprovació automàtica de `tests/smoke.mjs` valida la sintaxi JavaScript i contractes bàsics. GPS real, brúixola, Bluetooth i rendiment s’han de validar en un mòbil físic.

## Marca

TIP 18675