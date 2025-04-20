/**
 * Función para formatear un RUT chileno
 * Ejemplo: 12345678-9 -> 12.345.678-9
 * @param rut RUT sin formato o parcialmente formateado
 * @returns RUT formateado correctamente
 */
export function formatRUT(rut: string): string {
  // Eliminar puntos y guiones
  let rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Si está vacío, devolver string vacío
  if (rutLimpio.length === 0) return '';
  
  // Extraer dígito verificador y cuerpo
  const dv = rutLimpio.slice(-1);
  let cuerpo = rutLimpio.slice(0, -1);
  
  // Formatear cuerpo con puntos
  let rutFormateado = '';
  while (cuerpo.length > 3) {
    rutFormateado = '.' + cuerpo.slice(-3) + rutFormateado;
    cuerpo = cuerpo.slice(0, -3);
  }
  rutFormateado = cuerpo + rutFormateado;
  
  // Añadir guión y dígito verificador
  rutFormateado = rutFormateado + '-' + dv;
  
  return rutFormateado;
}

export default formatRUT;