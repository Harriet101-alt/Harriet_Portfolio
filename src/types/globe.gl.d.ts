declare module 'globe.gl' {
  export interface GlobePoint {
    id?: string;
    lat: number;
    lng: number;
    size: number;
    color: string;
    label?: string;
  }

  export interface GlobeArc {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string[];
  }

  export interface GlobePointOfView {
    lat: number;
    lng: number;
    altitude: number;
  }

  export interface GlobeControls {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    addEventListener: (event: string, handler: () => void) => void;
  }

  export interface GlobeInstance {
    globeImageUrl: (url: string) => GlobeInstance;
    bumpImageUrl: (url: string) => GlobeInstance;
    backgroundColor: (color: string) => GlobeInstance;
    showAtmosphere: (show: boolean) => GlobeInstance;
    atmosphereColor: (color: string) => GlobeInstance;
    atmosphereAltitude: (altitude: number) => GlobeInstance;
    width: (width: number) => GlobeInstance;
    height: (height: number) => GlobeInstance;
    pointsData: (points: GlobePoint[]) => GlobeInstance;
    pointAltitude: (altitude: number | ((point: GlobePoint) => number)) => GlobeInstance;
    pointRadius: (radius: number | ((point: GlobePoint) => number)) => GlobeInstance;
    pointColor: (color: string | ((point: GlobePoint) => string)) => GlobeInstance;
    pointLabel: (label: string | ((point: GlobePoint) => string)) => GlobeInstance;
    onPointClick: (handler: (point: GlobePoint) => void) => GlobeInstance;
    pointOfView: {
      (): GlobePointOfView;
      (pointOfView: GlobePointOfView, transitionMs?: number): GlobeInstance;
    };
    controls: () => GlobeControls;
    renderer: () => { setClearColor: (color: number, alpha: number) => void };
    arcsData: (arcs: GlobeArc[]) => GlobeInstance;
    arcStroke: (stroke: number) => GlobeInstance;
    arcDashLength: (length: number) => GlobeInstance;
    arcDashGap: (gap: number) => GlobeInstance;
    arcDashAnimateTime: (time: number) => GlobeInstance;
    arcsTransitionDuration: (duration: number) => GlobeInstance;
    _destructor: () => void;
  }

  const Globe: () => (element: HTMLElement) => GlobeInstance;
  export default Globe;
}
