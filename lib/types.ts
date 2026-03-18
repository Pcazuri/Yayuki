export interface Seccion {
  id: string;
  nombre: string;
  subtitulo?: string;
  orden: number;
}

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio2?: number; // usado en Nigiri/Sashimi
  seccionId: string;
  disponible: boolean;
}
