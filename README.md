# Ejercicio 2: lector de código QR con NativeScript (Android + iOS)

Ejercicio de contexto de la práctica M3. Mini-práctica resuelta (Aplicaciones Móviles y Laboratorio).

Al terminar tendrás una app que abre la cámara, detecta un código QR y muestra en pantalla el texto que contiene. La app se escribe una sola vez en TypeScript y corre en Android y en iPhone.

## Cómo usar esta guía

- La guía va desde cero: preparar la computadora, crear el proyecto, escribir el código y ejecutarlo.
- Cada comando aparece dos veces: una para macOS (app Terminal o la terminal de VS Code, que usa zsh) y otra para Windows (PowerShell). En los salones de la universidad usa siempre la versión de macOS.
- Para abrir una terminal dentro de VS Code: menú Terminal > New Terminal (atajo `` Ctrl + ` ``).
- Escribe los comandos uno por uno y espera a que cada uno termine antes de pasar al siguiente.
- Las líneas que empiezan con `#` son comentarios. No hace falta escribirlas.
- iOS solo se puede compilar en una Mac con Xcode. Desde Windows puedes hacer todo lo de Android.

Pasos:

0. [Preparar la computadora](#paso-0-preparar-la-computadora-solo-la-primera-vez)
1. [Crear el proyecto](#paso-1-crear-el-proyecto)
2. [Abrir el proyecto en VS Code](#paso-2-abrir-el-proyecto-en-vs-code)
3. [Instalar los plugins del lector QR](#paso-3-instalar-los-plugins-del-lector-qr)
4. [Crear la pantalla del lector](#paso-4-crear-la-pantalla-del-lector-qr-pagexml)
5. [Escribir la lógica de la pantalla](#paso-5-escribir-la-lógica-de-la-pantalla-qr-pagets)
6. [Hacer que la app abra el lector al iniciar](#paso-6-hacer-que-la-app-abra-el-lector-al-iniciar)
7. [Agregar los permisos de cámara](#paso-7-agregar-los-permisos-de-cámara)
8. [Ejecutar en Android](#paso-8-ejecutar-en-android)
9. [Ejecutar en iOS](#paso-9-ejecutar-en-ios-solo-mac)
10. [Probar el lector](#paso-10-probar-el-lector)

Al final hay una sección de problemas comunes y otra con lo que debes hacer si no lograste llegar a algún paso.

---

## Paso 0. Preparar la computadora (solo la primera vez)

Si en la Mac del salón ya se hizo este paso antes, puedes saltar al paso 0.4.

### 0.1 Android Studio: SDK y emulador

1. Abre Android Studio. La primera vez descarga el SDK de Android; deja que termine.
2. En la pantalla de bienvenida entra a More Actions > Virtual Device Manager (o Device Manager).
3. Presiona Create Device, elige un teléfono (por ejemplo Pixel 8), elige la imagen de sistema más reciente que tenga el botón de descarga, descárgala y termina el asistente.
4. Presiona el botón de play del emulador para comprobar que arranca. Puedes cerrarlo después.

### 0.2 Xcode (solo Mac)

1. Abre Xcode una vez y acepta la licencia.
2. Si pide instalar componentes adicionales, acepta.
3. En Xcode > Settings > Components (en versiones viejas se llama Platforms) descarga el simulador de iOS si no aparece instalado.

### 0.3 Revisar Node.js y Git

Estos comandos solo muestran la versión instalada. Si alguno responde `command not found` (Mac) o "no se reconoce como nombre de un cmdlet" (Windows), instálalo como se indica abajo.

macOS:

```bash
node -v        # debe mostrar v20 o mayor (recomendado v22)
npm -v
git --version
```

Windows (PowerShell):

```powershell
node -v
npm -v
git --version
```

Si falta algo:

macOS: no hace falta Homebrew. Si falta Node.js, descarga el instalador LTS (`.pkg`) de [nodejs.org](https://nodejs.org) y ábrelo. Si falta Git, el comando `git --version` ofrece instalar las herramientas de línea de comandos de Xcode; acepta (es lo mismo que `xcode-select --install` del paso 0.4).

Windows (PowerShell):

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Google.AndroidStudio
```

Después de instalar algo en Windows cierra PowerShell y ábrelo de nuevo para que reconozca los programas nuevos.

### 0.4 Instalar NativeScript y revisar con ns doctor

1. Instala la CLI de NativeScript de forma global:

macOS:

```bash
npm install -g nativescript
# si responde EACCES o "permission denied", usa:
sudo npm install -g nativescript
```

Windows (PowerShell):

```powershell
npm install -g nativescript
```

2. Comprueba que quedó instalada y revisa la computadora:

macOS y Windows:

```bash
ns --version
ns doctor
```

3. Solo Mac, para iOS: instala las herramientas de línea de comandos de Xcode y CocoaPods. `sudo` pide la contraseña de administrador de la Mac.

```bash
xcode-select --install
sudo gem install cocoapods
```

Si `xcode-select --install` responde que ya están instaladas, sigue con la siguiente línea.

4. Vuelve a ejecutar `ns doctor`. No debe marcar errores. Si aparece un aviso sobre `ANDROID_HOME` o `JAVA_HOME`, sigue con el paso 0.5.

### 0.5 Variables de entorno de Android

NativeScript necesita saber dónde está el SDK de Android (`ANDROID_HOME`) y qué Java usar (`JAVA_HOME`).

macOS:

1. Revisa qué Java tienes:

```bash
java -version
/usr/libexec/java_home -v 21   # debe mostrar una ruta; si da error, mira la nota de abajo
```

2. Abre el archivo de configuración de la terminal con el editor nano:

```bash
nano ~/.zshrc
```

3. Pega estas líneas al final del archivo:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

`$HOME` es tu carpeta de usuario (en las Mac del salón es `/Users/Alumnos`). Si en Finder la carpeta del SDK tiene otro nombre, revísalo en Android Studio > Settings > Languages & Frameworks > Android SDK (campo Android SDK Location) y usa esa ruta.

4. Guarda y sal de nano: `Ctrl + O`, `Enter` y luego `Ctrl + X`.

5. Recarga la configuración y vuelve a revisar:

```bash
source ~/.zshrc
ns doctor android
```

Nota: si `/usr/libexec/java_home -v 21` da error, la Mac no tiene el JDK 21. Puedes usar el Java que trae Android Studio cambiando la primera línea del paso 3 por:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

Windows (PowerShell):

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"

# Comprobación
java -version
adb version
```

Estos comandos de Windows valen solo para la ventana de PowerShell abierta. Para que queden guardados:

```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
# Cierra y vuelve a abrir PowerShell
ns doctor android
```

La guía oficial de NativeScript para Windows configura estas variables desde la ventana Editar las variables de entorno del sistema y usa cmd con la sintaxis `%LOCALAPPDATA%`. En PowerShell esa sintaxis no funciona; por eso aquí se escribe `$env:LOCALAPPDATA`. El resultado es el mismo.

`ns doctor` (en Mac) y `ns doctor android` (en Windows) deben terminar sin errores rojos antes de pasar al paso 1.

### Resumen rápido para crear cualquier app

Con todo lo anterior listo, una app nueva se crea y se ejecuta así (cambia `nombre-app` por el nombre que quieras, sin espacios ni acentos):

```bash
ns create nombre-app
cd nombre-app
ns run android
```

Para este ejercicio sigue el paso 1, que usa la plantilla de TypeScript.

---

## Paso 1. Crear el proyecto

Primero ve a una carpeta de trabajo. La ruta no debe tener espacios ni acentos: con rutas como `.../Apps Móviles/...` Gradle falla con el error *Non-ASCII characters in path*.

macOS:

```bash
mkdir -p ~/proyectos
cd ~/proyectos
npx --yes nativescript@9 create Ejercicio2QR --template @nativescript/template-blank-ts
cd Ejercicio2QR
```

Windows (PowerShell):

```powershell
New-Item -ItemType Directory -Force C:\proyectos
cd C:\proyectos
npx --yes nativescript@9 create Ejercicio2QR --template @nativescript/template-blank-ts
cd Ejercicio2QR
```

Qué hace cada línea:

- `mkdir -p` / `New-Item -ItemType Directory` crea la carpeta `proyectos` (si ya existe no pasa nada).
- `nativescript create` crea un proyecto nuevo a partir de la plantilla en blanco con TypeScript y ejecuta `npm install` por ti.
- El identificador de la app queda como `org.nativescript.Ejercicio2QR` (está en `nativescript.config.ts`).

Ahora instala la CLI de NativeScript dentro del proyecto. Así cualquiera que descargue el proyecto usa la misma versión, sin instalaciones globales:

macOS y Windows (es el mismo comando):

```bash
npm install --save-dev nativescript@9
```

A partir de aquí los comandos de NativeScript se escriben como `npx ns ...` y usan esa versión.

---

## Paso 2. Abrir el proyecto en VS Code

Opción con el menú: abre VS Code, File > Open Folder... y elige la carpeta `Ejercicio2QR`.

Opción con la terminal (estando dentro de la carpeta del proyecto):

macOS:

```bash
code .
```

Windows (PowerShell):

```powershell
code .
```

En Mac, si `code` no se reconoce, abre VS Code, presiona `Cmd + Shift + P`, busca *Shell Command: Install 'code' command in PATH* y ejecútalo. Luego abre otra terminal.

La estructura que importa es esta:

```text
Ejercicio2QR/
├── app/                      # el código de la app (lo que vamos a escribir)
│   ├── app.ts                # punto de entrada, arranca la app
│   ├── app-root.xml          # define cuál es la primera pantalla
│   └── app.css               # estilos
├── App_Resources/
│   ├── Android/              # configuración propia de Android (permisos, íconos)
│   └── iOS/                  # configuración propia de iOS (Info.plist, íconos)
├── nativescript.config.ts    # id de la app y rutas
└── package.json              # dependencias y scripts
```

---

## Paso 3. Instalar los plugins del lector QR

Usamos Google ML Kit a través de dos plugins oficiales de NativeScript:

- `@nativescript/mlkit-core`: muestra la vista de cámara (`MLKitView`) y pide el permiso.
- `@nativescript/mlkit-barcode-scanning`: agrega la detección de códigos de barras y QR.

macOS y Windows:

```bash
npm install @nativescript/mlkit-core @nativescript/mlkit-barcode-scanning
```

Cuando termine, `package.json` debe tener los dos en `dependencies`.

---

## Paso 4. Crear la pantalla del lector (qr-page.xml)

Crea la carpeta `app/ejercicios` con dos archivos vacíos. Puedes hacerlo con clic derecho > New Folder / New File en el explorador de VS Code, o con la terminal:

macOS:

```bash
mkdir -p app/ejercicios
touch app/ejercicios/qr-page.xml app/ejercicios/qr-page.ts
```

Windows (PowerShell):

```powershell
New-Item -ItemType Directory -Force app\ejercicios
New-Item app\ejercicios\qr-page.xml, app\ejercicios\qr-page.ts
```

Abre `app/ejercicios/qr-page.xml` en VS Code y pega esto:

```xml
<Page xmlns="http://schemas.nativescript.org/tns.xsd"
      xmlns:ui="@nativescript/mlkit-core"
      navigatingTo="navigatingTo">
  <ActionBar title="Ejercicio 2: Lector QR" />
  <StackLayout class="p-20">
    <ui:MLKitView id="camara" detectionType="barcode"
                  detection="{{ onDetection }}" height="300" />
    <Label text="Texto leído:" class="m-t-10" />
    <Label text="{{ textoQR }}" textWrap="true" class="h2" />
    <Button text="Activar cámara" tap="{{ activar }}" />
  </StackLayout>
</Page>
```

Qué hace cada parte:

- `xmlns:ui="@nativescript/mlkit-core"` registra el plugin con el prefijo `ui`, para poder escribir `<ui:MLKitView>`.
- `navigatingTo="navigatingTo"` llama a la función `navigatingTo` del archivo `.ts` antes de mostrar la pantalla. Ahí conectamos la pantalla con su lógica.
- `ActionBar` es la barra de título de arriba.
- `StackLayout` acomoda los elementos uno debajo de otro; `p-20` le da margen interior.
- `MLKitView` es el cuadro donde se ve la cámara:
  - `id="camara"` sirve para buscarla desde el código.
  - `detectionType="barcode"` le dice que busque códigos de barras y QR.
  - `detection="{{ onDetection }}"` llama a `onDetection` cada vez que detecta un código.
- El primer `Label` es un texto fijo. El segundo muestra el valor de `textoQR`; las llaves `{{ }}` significan que el texto cambia solo cuando cambia la variable (data binding).
- El `Button` llama a `activar` al tocarlo.

---

## Paso 5. Escribir la lógica de la pantalla (qr-page.ts)

Abre `app/ejercicios/qr-page.ts` y pega esto:

```ts
import { Observable, NavigatedData, Page } from '@nativescript/core';
import { DetectionEvent, DetectionType, MLKitView } from '@nativescript/mlkit-core';
import { BarcodeResult } from '@nativescript/mlkit-barcode-scanning';
import '@nativescript/mlkit-barcode-scanning';

// Este código funciona igual en Android y en iOS: el plugin MLKit
// se encarga de abrir la cámara y pedir el permiso en cada plataforma.
class QrVM extends Observable {
  camara: MLKitView | null = null;

  constructor() {
    super();
    this.onDetection = this.onDetection.bind(this);
    this.set('textoQR', '(aún no se lee nada)');
  }

  async activar() {
    try {
      if (this.camara) await this.camara.requestCameraPermission();
    } catch (e) {
      this.set('textoQR', 'Falta permiso de cámara');
    }
  }

  onDetection(event: DetectionEvent) {
    if (event.type !== DetectionType.Barcode) return;
    const datos = event.data as BarcodeResult[];
    if (datos && datos[0] && datos[0].rawValue) {
      this.set('textoQR', datos[0].rawValue);
    }
  }
}

export function navigatingTo(args: NavigatedData) {
  const page = <Page>args.object;
  const vm = new QrVM();
  page.bindingContext = vm;
  page.on('loaded', () => {
    vm.camara = page.getViewById<MLKitView>('camara');
  });
}
```

Qué hace cada parte:

- Los `import` traen las clases que usamos. La línea `import '@nativescript/mlkit-barcode-scanning';` sin nombres carga el módulo de detección de QR; sin ella la cámara abre pero no detecta nada.
- `QrVM` es el modelo de vista (view model): guarda los datos que muestra la pantalla. Hereda de `Observable`, y por eso cuando llamamos `this.set('textoQR', ...)` la etiqueta del XML se actualiza sola.
- En el `constructor`:
  - `bind(this)` hace que `onDetection` siga teniendo acceso a `this` cuando el plugin la llama desde fuera.
  - Se pone el texto inicial `(aún no se lee nada)`.
- `activar()` corre al tocar el botón. Pide el permiso de cámara con `requestCameraPermission()`. Si el usuario lo niega, se muestra `Falta permiso de cámara`.
- `onDetection(event)` corre cada vez que la cámara ve un código:
  - Si el evento no es de tipo código de barras, lo ignora.
  - `event.data` es una lista de códigos encontrados; tomamos el primero.
  - `rawValue` es el texto que trae el QR, y lo ponemos en `textoQR`.
- `navigatingTo` se ejecuta al abrir la pantalla (es la función que nombramos en el XML):
  - Crea el modelo de vista y lo asigna como `bindingContext`, que es de donde el XML lee `textoQR`, `activar` y `onDetection`.
  - Cuando la pantalla termina de cargar (`loaded`), busca la cámara por su `id` y la guarda en `vm.camara` para poder pedir el permiso.

---

## Paso 6. Hacer que la app abra el lector al iniciar

Abre `app/app-root.xml` y reemplaza todo su contenido por:

```xml
<Frame defaultPage="ejercicios/qr-page" />
```

`Frame` es el contenedor que maneja la navegación entre pantallas, y `defaultPage` indica la primera que se muestra. La ruta es relativa a la carpeta `app` y va sin extensión.

No hace falta tocar `app/app.ts`. Ya trae `Application.run({ moduleName: 'app-root' })`, que arranca la app usando `app-root.xml`.

---

## Paso 7. Agregar los permisos de cámara

Cada sistema operativo exige declarar que la app usa la cámara.

### Android

Abre `App_Resources/Android/src/main/AndroidManifest.xml`. Busca las líneas que empiezan con `<uses-permission` y agrega esta debajo de ellas:

```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

### iOS

Abre `App_Resources/iOS/Info.plist` y pega estas dos líneas justo antes de la última línea `</dict>` del archivo:

```xml
<key>NSCameraUsageDescription</key>
<string>La app usa la cámara para leer códigos QR.</string>
```

El texto es el mensaje que iOS le muestra al usuario al pedir el permiso. Sin esta clave iOS cierra la app en cuanto intenta abrir la cámara.

---

## Paso 8. Ejecutar en Android

1. Abre el emulador desde Android Studio > Device Manager (botón de play). Si prefieres usar tu celular Android, actívale Opciones de desarrollador > Depuración USB y conéctalo por cable.
2. En la terminal de VS Code, dentro de la carpeta del proyecto, revisa que el dispositivo aparezca y ejecuta la app. Si en Windows abriste una terminal nueva y no guardaste las variables, repite el paso 0.5.

macOS:

```bash
adb devices                    # debe aparecer emulator-5554 o tu celular
npx ns run android --emulator  # quita --emulator si usas un celular real
```

Windows (PowerShell):

```powershell
adb devices
npx ns run android --emulator
```

La primera compilación tarda varios minutos porque descarga Gradle y las dependencias. Al final la app se instala y se abre sola. Mientras el comando siga corriendo, cada vez que guardes un archivo la app se recarga. Para detenerla, haz clic en la terminal y presiona `Ctrl + C` (también en Mac es `Ctrl`, no `Cmd`).

Para generar un APK e instalarlo a mano:

macOS:

```bash
npx ns build android
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

Windows (PowerShell):

```powershell
npx ns build android
adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## Paso 9. Ejecutar en iOS (solo Mac)

### En el simulador de iPhone

Google ML Kit no trae versión para el simulador de iOS. Por eso se compila con la variable `NSSkipMLKitFromIOSSimulator=1`: la app abre y se ve la pantalla, pero el simulador no lee códigos.

macOS:

```bash
NSSkipMLKitFromIOSSimulator=1 npx ns run ios --emulator
```

Esto abre el Simulador de Xcode y ahí instala la app. La primera vez tarda porque CocoaPods descarga las dependencias de iOS.

En Windows no hay comando equivalente: Windows no puede compilar para iOS. Mira la sección [Sin Mac](#compilar-ios-sin-mac-github-actions) más abajo.

### En un iPhone real (para leer QR de verdad)

1. Conecta el iPhone por cable a la Mac y acepta el mensaje "Confiar en esta computadora". En iOS 16 o mayor activa también Configuración > Privacidad y seguridad > Modo de desarrollador.
2. Borra la compilación del simulador y ejecuta en el teléfono:

macOS:

```bash
npx ns clean
npm install
npx ns devices ios             # copia el Device Identifier de tu iPhone
npx ns run ios --device <id>   # pega el identificador en lugar de <id>
```

3. Si aparece un error de firma (*signing*), abre `platforms/ios/Ejercicio2QR.xcworkspace` en Xcode, selecciona el proyecto Ejercicio2QR, entra a la pestaña Signing & Capabilities, elige tu Team (inicia sesión con tu Apple ID si no aparece ninguno) y vuelve a ejecutar el último comando.

---

## Paso 10. Probar el lector

1. Genera un QR con el texto `hola mundo` en [QR Code Monkey](https://www.qrcode-monkey.com/es/#text) y déjalo abierto en la pantalla de la computadora.
2. Abre la app en un celular real (Android o iPhone), presiona Activar cámara y acepta el permiso.
3. Apunta la cámara al código. Debe aparecer `hola mundo` debajo de "Texto leído:".

Los emuladores no tienen cámara física. En el emulador de Android puedes usar la cámara web de la Mac: en Device Manager edita el emulador (ícono de lápiz) > Show Advanced Settings > Camera > Back: Webcam0, y reinicia el emulador. El simulador de iOS no puede leer QR (ver paso 9).

Si quieres conceder el permiso de cámara en Android sin tocar el emulador:

macOS y Windows:

```bash
adb shell pm grant org.nativescript.Ejercicio2QR android.permission.CAMERA
```

---

## Atajos que trae este repositorio

Si descargaste este repositorio en vez de crear el proyecto desde cero, tiene atajos que configuran las variables del paso 0.5 automáticamente (el script `scripts/ejecutar.js` busca el SDK y el Java de Android Studio).

| Comando (macOS y Windows) | Qué hace |
|---|---|
| `npm run android` | Ejecuta en el emulador de Android Studio |
| `npm run ios` | Ejecuta en el simulador de iPhone (solo Mac) |
| `npm run ios:iphone` | Ejecuta en un iPhone conectado (solo Mac) |
| `npm run doctor` | Revisa que la computadora tenga todo instalado |
| `npm run limpiar` | Borra la compilación; úsalo si algo se atora o al cambiar entre simulador e iPhone real |

También hay tareas de VS Code: presiona `Cmd + Shift + B` (Mac) o `Ctrl + Shift + B` (Windows) y elige Android, iOS o iPhone real. Desde Terminal > Run Task... está la tarea 1. Instalar dependencias (npm install), que debes correr una vez después de descargar el proyecto.

### Compilar iOS sin Mac (GitHub Actions)

El repositorio trae el workflow `.github/workflows/compilar.yml`, que compila Android e iOS en servidores de GitHub cada vez que haces `git push`. En la pestaña Actions del repositorio ves si compiló bien y puedes descargar el APK de Android y el `.zip` del simulador de iOS. Ese `.zip` se puede subir a [Appetize.io](https://appetize.io) para ver la app como iPhone desde el navegador.

---

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `ANDROID_HOME` o `JAVA_HOME` no encontrado | Repite el paso 0.5 y ejecuta `source ~/.zshrc` (Mac) o abre otra ventana de PowerShell (Windows). |
| *Non-ASCII characters in path* | Mueve el proyecto a una ruta sin espacios ni acentos, como `~/proyectos` o `C:\proyectos`. |
| `adb devices` no muestra nada | Arranca el emulador desde Device Manager y espera a que cargue la pantalla de inicio. |
| No arranca ningún emulador | Ábrelo tú desde Android Studio > Device Manager y vuelve a ejecutar el comando. |
| `pod: command not found` | `sudo gem install cocoapods` y abre otra terminal. |
| La app de iOS falla al cambiar entre simulador e iPhone | `npx ns clean` (o `npm run limpiar`) y vuelve a ejecutar. |
| La cámara se ve negra | Presiona Activar cámara y acepta el permiso. En el emulador revisa la opción de Webcam0 del paso 10. |
| Error de Gradle con Java 25 | Usa el Java de Android Studio (nota del paso 0.5) o instala el JDK 21: descarga el `.pkg` de Temurin 21 en [adoptium.net](https://adoptium.net) en Mac, `winget install EclipseAdoptium.Temurin.21.JDK` en Windows. |

---

## Si no lograste llegar a algún paso

Puedes descargar el proyecto terminado desde GitHub y seguir desde ahí: https://github.com/Lastcreator999/Ejercicio2QR

Con Git:

macOS:

```bash
cd ~/proyectos
git clone https://github.com/Lastcreator999/Ejercicio2QR.git
cd Ejercicio2QR
npm install
npm run android   # o: npm run ios
```

Windows (PowerShell):

```powershell
cd C:\proyectos
git clone https://github.com/Lastcreator999/Ejercicio2QR.git
cd Ejercicio2QR
npm install
npm run android
```

Sin Git: en la página del repositorio presiona el botón verde Code > Download ZIP, descomprime el archivo en una ruta sin espacios ni acentos, abre la carpeta en VS Code y ejecuta `npm install` y luego `npm run android` (o `npm run ios` en Mac).

Si solo te falló un paso, compara tus archivos con los del repositorio. Los que escribiste en esta guía son:

| Archivo | Paso |
|---|---|
| `app/ejercicios/qr-page.xml` | 4 |
| `app/ejercicios/qr-page.ts` | 5 |
| `app/app-root.xml` | 6 |
| `App_Resources/Android/src/main/AndroidManifest.xml` | 7 |
| `App_Resources/iOS/Info.plist` | 7 |
