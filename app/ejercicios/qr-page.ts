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
