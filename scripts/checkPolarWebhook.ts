/**
 * Vérifie la validation des signatures du webhook Polar.
 *
 * Ce code décide si une requête qui prétend venir de Polar est crue : c'est la
 * porte d'entrée du chemin de l'argent, et le dépôt n'a pas de suite de tests.
 * Les signatures sont fabriquées ici comme Polar les fabrique, plutôt que
 * recopiées : une signature figée ne prouverait rien sur l'algorithme.
 *
 *   npx tsx scripts/checkPolarWebhook.ts
 */
import crypto from 'crypto';
import { verifyPolarSignature, toMajorUnits, DEFAULT_TOLERANCE_SEC } from '../src/lib/polarWebhook';

const SECRET = 'whsec_secret_de_test';
const NOW = Date.UTC(2026, 8, 14, 1, 0, 0);
const NOW_SEC = Math.floor(NOW / 1000);
const BODY = JSON.stringify({ type: 'order.paid', data: { id: 'ord_1', amount: 5900 } });

const sign = (body: string, id: string, tsSec: number, secret = SECRET) =>
    'v1,' + crypto.createHmac('sha256', secret).update(`${id}.${tsSec}.${body}`).digest('base64');

const hdr = (offsetSec: number, opts: Partial<{ id: string; sig: string }> = {}) => {
    const id = opts.id ?? 'msg_1';
    const ts = NOW_SEC + offsetSec;
    return { id, timestamp: String(ts), signature: opts.sig ?? sign(BODY, id, ts) };
};

let ok = 0;
const failures: string[] = [];
const check = (name: string, cond: boolean) => {
    if (cond) { ok++; console.log('  \x1b[32m✓\x1b[0m', name); }
    else { failures.push(name); console.log('  \x1b[31m✗\x1b[0m', name); }
};

console.log('\nSignature');
check('accepte une requête Polar authentique et fraîche',
    verifyPolarSignature(BODY, hdr(0), SECRET, NOW).ok);
check('refuse une charge utile modifiée après signature',
    !verifyPolarSignature(BODY + ' ', hdr(0), SECRET, NOW).ok);
check('refuse une signature forgée avec un autre secret',
    !verifyPolarSignature(BODY, { id: 'msg_1', timestamp: String(NOW_SEC), signature: sign(BODY, 'msg_1', NOW_SEC, 'mauvais') }, SECRET, NOW).ok);
check('refuse une version de signature inconnue',
    !verifyPolarSignature(BODY, hdr(0, { sig: 'v2,' + sign(BODY, 'msg_1', NOW_SEC).slice(3) }), SECRET, NOW).ok);
check('accepte pendant une rotation de secret (plusieurs signatures)',
    verifyPolarSignature(BODY, hdr(0, { sig: 'v1,mauvaise ' + sign(BODY, 'msg_1', NOW_SEC) }), SECRET, NOW).ok);

console.log('\nRejeu');
check('refuse une requête authentique rejouée une heure plus tard',
    !verifyPolarSignature(BODY, hdr(-3600), SECRET, NOW).ok);
check('refuse un horodatage daté du futur',
    !verifyPolarSignature(BODY, hdr(3600), SECRET, NOW).ok);
check('tolère une horloge légèrement décalée',
    verifyPolarSignature(BODY, hdr(-DEFAULT_TOLERANCE_SEC + 10), SECRET, NOW).ok);
check('refuse juste après la fenêtre',
    !verifyPolarSignature(BODY, hdr(-DEFAULT_TOLERANCE_SEC - 10), SECRET, NOW).ok);
check('refuse un horodatage illisible',
    !verifyPolarSignature(BODY, { id: 'msg_1', timestamp: 'hier', signature: 'v1,x' }, SECRET, NOW).ok);

console.log('\nÉchoue fermé');
check('refuse quand le secret n’est pas configuré',
    !verifyPolarSignature(BODY, hdr(0), '', NOW).ok);
check('refuse des en-têtes incomplets',
    !verifyPolarSignature(BODY, { id: null, timestamp: String(NOW_SEC), signature: 'v1,x' }, SECRET, NOW).ok);
check('le motif reste technique, pour les logs seulement',
    typeof verifyPolarSignature(BODY, hdr(-3600), SECRET, NOW).reason === 'string');

console.log('\nMontant transmis aux plateformes d’affiliation');
check('convertit les centimes', toMajorUnits(5900) === 59);
check('rend null plutôt que NaN quand le montant manque', toMajorUnits(undefined) === null);
check('rend null sur une valeur non numérique', toMajorUnits('abc') === null);

console.log(`\n${ok} vérifications passées, ${failures.length} échouées`);
if (failures.length) { failures.forEach((f) => console.log('  -', f)); process.exit(1); }
process.exit(0);
