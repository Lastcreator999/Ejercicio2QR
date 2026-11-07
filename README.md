# Ejercicio 2 · Lector simple de código QR (NativeScript, Android + iOS)

Ejercicio de contexto de la práctica **M3. Mini-práctica resuelta** (Aplicaciones Móviles y Laboratorio).
Abre la cámara dentro de la app, detecta un código QR y muestra el texto que contiene.

## Archivos importantes

| Archivo | Qué hace |
|---|---|
| `app/ejercicios/qr-page.xml` | Pantalla con `MLKitView` (`detectionType="barcode"`), etiqueta del texto leído y botón para activar la cámara. |
| `app/ejercicios/qr-page.ts` | Modelo de vista `QrVM`: pide el permiso con `requestCameraPermission` y muestra `rawValue` del código detectado. |
| `app/app-root.xml` | Abre `ejercicios/qr-page` al iniciar. |
| `App_Resources/Android/src/main/AndroidManifest.xml` | Permiso `CAMERA`. |
| `App_Resources/iOS/Info.plist` | `NSCameraUsageDescription` (sin esta clave iOS cierra la app al abrir la cámara). |

Plugins: `@nativescript/mlkit-core` y `@nativescript/mlkit-barcode-scanning`.

## ⚡ Inicio rápido en VS Code (Macs de la escuela)

No hace falta instalar nada global ni configurar variables: el proyecto trae su propia CLI de NativeScript y el script `scripts/ejecutar.js` encuentra solo el SDK de Android y el Java que vienen con Android Studio.

**Solo la primera vez en cada Mac** (si ya está hecho, sáltalo):

1. Abre **Android Studio** una vez para que instale el SDK, y en *Device Manager* crea un emulador (por ejemplo *Pixel*).
2. Abre **Xcode** una vez, acepta la licencia y en *Settings > Components* descarga el simulador de iOS.
3. Verifica que esté **CocoaPods** (lo necesita iOS): `pod --version`. Si no está: `brew install cocoapods`.

**Cada vez:**

1. VS Code → *File > Open Folder…* → elige la carpeta del proyecto.
2. *Terminal > Run Task…* → **1. Instalar dependencias (npm install)** (solo después de clonar).
3. Presiona **⌘ ⇧ B** (Cmd + Shift + B) y elige:
   - **Android – emulador de Android Studio**
   - **iOS – simulador de iPhone (Xcode)**
   - **iPhone real conectado por cable**

El emulador o simulador se abre solo y la app se instala. Al guardar un archivo, la app se recarga. Para detenerla: clic en la terminal y **Ctrl + C**.

También funciona desde la terminal de VS Code:

| Comando | Qué hace |
|---|---|
| `npm run android` | Ejecuta en el emulador de Android Studio |
| `npm run ios` | Ejecuta en el simulador de iPhone (solo Mac) |
| `npm run ios:iphone` | Ejecuta en un iPhone conectado (solo Mac) |
| `npm run doctor` | Revisa que la computadora tenga todo instalado |
| `npm run limpiar` | Borra la compilación; úsalo si algo se "atora" o al cambiar entre simulador e iPhone real |

> Si no arranca ningún emulador de Android, ábrelo tú desde *Android Studio > Device Manager* (▶) y vuelve a ejecutar la tarea.

## 1. Preparar la computadora en Windows (opcional, en casa)

Necesitas: **Node.js 22 LTS**, **JDK 21**, **Android Studio** (solo para el SDK y el emulador) y **Git**.

```powershell
# Node y la CLI de NativeScript
node -v
npm install -g nativescript

# JDK 21 (Gradle no funciona con Java 25)
winget install EclipseAdoptium.Temurin.21.JDK

# Variable del SDK de Android (cierra y abre la terminal después)
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

# Revisa que todo esté bien; debe salir sin errores rojos
ns doctor android
```

> ⚠️ Clona el proyecto en una ruta **sin espacios ni acentos**, por ejemplo `C:\proyectos`. Con rutas como `...\Apps Móviles\...` Gradle falla con *Non-ASCII characters in path*.

## 2. Descargar y ejecutar en Android

```powershell
cd C:\proyectos
git clone https://github.com/TU_USUARIO/Ejercicio2QR.git
cd Ejercicio2QR
npm install
```

1. Abre **Android Studio > More Actions > Virtual Device Manager** y arranca un emulador (o conecta tu celular con *Depuración USB* activada).
2. Verifica que aparezca el dispositivo: `adb devices`
3. Ejecuta: `npm run android` (o `ns run android` si instalaste la CLI global)

La primera compilación tarda varios minutos (descarga Gradle y dependencias). Después, cada vez que guardas un archivo la app se recarga sola.

Para generar el APK e instalarlo en un celular:

```powershell
ns build android
adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

## 3. iOS (iPhone)

El código ya está adaptado para iOS (permisos en `App_Resources/iOS/Info.plist`), pero **compilar para iOS requiere una Mac con Xcode**; Windows no puede hacerlo. Opciones:

- **Con una Mac** (laboratorio de la escuela, prestada o rentada en la nube): instala Xcode desde la App Store, abre Xcode una vez para aceptar la licencia, y luego:
  ```bash
  npm install -g nativescript
  ns doctor ios
  npm install
  NSSkipMLKitFromIOSSimulator=1 ns run ios
  ```
  Esto abre el **Simulador de iPhone** que viene con Xcode (no necesitas un iPhone).
- **Sin Mac:** este repositorio trae un workflow de **GitHub Actions** (`.github/workflows/compilar.yml`) que compila la versión de iOS en una Mac de GitHub cada vez que haces `git push`. En la pestaña **Actions** verás si compiló bien y podrás descargar el APK de Android y el `.zip` del simulador de iOS. Ese `.zip` se puede subir a un servicio de simulador en el navegador como [Appetize.io](https://appetize.io) para ver la app corriendo como iPhone.

## 4. Probar el ejercicio

> 📷 Los emuladores/simuladores **no tienen cámara real**, así que el QR se prueba en un **celular real**.

1. Genera un QR con el texto `hola mundo` en [QR Code Monkey](https://www.qrcode-monkey.com/es/#text) y déjalo en la pantalla de tu computadora.
2. Instala la app en tu celular Android (`ns run android` con el celular conectado, o el APK).
3. Presiona **Activar cámara**, acepta el permiso y apunta al código: debe aparecer `hola mundo`.

Si concedes el permiso por adb: `adb shell pm grant org.nativescript.Ejercicio2QR android.permission.CAMERA`

**iOS:** Google MLKit no incluye binarios para el simulador, por eso en la Mac se compila para simulador con `NSSkipMLKitFromIOSSimulator=1` (la pantalla abre, pero no lee códigos). Para leer QR en iOS se necesita un iPhone real conectado a la Mac (`ns clean` y luego `ns run ios --device <id>`).
