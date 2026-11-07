#!/usr/bin/env node
/*
 * Ejecuta la app en el emulador de Android o en el simulador de iOS sin tener
 * que configurar variables de entorno a mano.
 *
 *   npm run android        -> emulador de Android Studio
 *   npm run ios            -> simulador de iPhone (Xcode, solo en Mac)
 *   npm run ios:iphone     -> iPhone real conectado por cable (solo en Mac)
 *   npm run doctor         -> revisa que la computadora tenga todo instalado
 *   npm run limpiar        -> borra la compilación (útil si algo se "atora")
 *
 * El script busca solo el SDK de Android y el Java que trae Android Studio,
 * así que en las Macs de la escuela no hace falta instalar el JDK aparte.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const raiz = path.join(__dirname, '..');
const accion = process.argv[2] || 'android';
const esMac = process.platform === 'darwin';
const esWindows = process.platform === 'win32';
const env = { ...process.env };

function existe(p) {
  try {
    return !!p && fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

function primero(lista) {
  return lista.find(existe);
}

// ---------- SDK de Android ----------
if (!existe(env.ANDROID_HOME)) {
  const sdk = primero([
    env.ANDROID_SDK_ROOT,
    esMac && path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    esWindows && env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Android', 'Sdk'),
    path.join(os.homedir(), 'Android', 'Sdk'),
  ]);
  if (sdk) env.ANDROID_HOME = sdk;
}

// ---------- Java (el que viene dentro de Android Studio) ----------
if (!existe(env.JAVA_HOME)) {
  const jdk = primero([
    esMac && '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
    esMac && path.join(os.homedir(), 'Applications', 'Android Studio.app', 'Contents', 'jbr', 'Contents', 'Home'),
    esWindows && 'C:\\Program Files\\Android\\Android Studio\\jbr',
    '/opt/android-studio/jbr',
  ]);
  if (jdk) env.JAVA_HOME = jdk;
}

// Agrega adb, el emulador y java al PATH de este proceso
const extra = [];
if (env.ANDROID_HOME) {
  extra.push(path.join(env.ANDROID_HOME, 'platform-tools'), path.join(env.ANDROID_HOME, 'emulator'));
}
if (env.JAVA_HOME) extra.push(path.join(env.JAVA_HOME, 'bin'));
const clavePath = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
env[clavePath] = extra.concat(env[clavePath] || '').join(path.delimiter);

// ---------- MLKit (lector de QR) no tiene versión para el simulador de iOS ----------
const pkg = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8'));
const usaMLKit = !!(pkg.dependencies && pkg.dependencies['@nativescript/mlkit-core']);

// ---------- Comando a ejecutar ----------
let args;
switch (accion) {
  case 'android':
    args = ['run', 'android', '--emulator'];
    break;
  case 'ios':
  case 'ios:iphone':
    if (!esMac) {
      console.error('\n✖ iOS solo se puede compilar en una Mac con Xcode.\n');
      process.exit(1);
    }
    if (accion === 'ios') {
      args = ['run', 'ios', '--emulator'];
      if (usaMLKit) {
        env.NSSkipMLKitFromIOSSimulator = '1';
        console.log('ℹ Simulador de iOS: el lector de QR (MLKit) se omite; el resto de la app funciona.');
        console.log('  Si antes compilaste para un iPhone real, ejecuta primero: npm run limpiar\n');
      }
    } else {
      args = ['run', 'ios'];
      delete env.NSSkipMLKitFromIOSSimulator;
      console.log('ℹ iPhone real: si antes usaste el simulador, ejecuta primero: npm run limpiar\n');
    }
    break;
  case 'doctor':
    // En Mac revisa Android e iOS; en Windows/Linux solo Android
    args = esMac ? ['doctor'] : ['doctor', 'android'];
    break;
  case 'limpiar':
    args = ['clean'];
    break;
  default:
    console.error('Uso: node scripts/ejecutar.js [android | ios | ios:iphone | doctor | limpiar]');
    process.exit(1);
}

console.log('ANDROID_HOME = ' + (env.ANDROID_HOME || '(no encontrado: abre Android Studio una vez para instalar el SDK)'));
console.log('JAVA_HOME    = ' + (env.JAVA_HOME || '(no encontrado: instala Android Studio o el JDK 21)'));
console.log('> ns ' + args.join(' ') + '\n');

// Usa la CLI de NativeScript instalada dentro del proyecto (no requiere "npm install -g")
const cli = require.resolve('nativescript/bin/nativescript.js', { paths: [raiz] });
const r = spawnSync(process.execPath, [cli].concat(args), { cwd: raiz, env, stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
