/**
 * Valida un RUT chileno
 * @param rut RUT a validar (puede estar con o sin formato)
 * @returns boolean que indica si el RUT es válido
 */
export default function validateRUT(rut: string): boolean {
  // Si está vacío o es undefined, no es válido
  if (!rut || rut.trim() === '') return false;
  
  // Eliminar puntos, guiones y espacios
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '');
  
  // Si tiene menos de 2 caracteres, no es válido
  if (rutLimpio.length < 2) return false;
  
  const dv = rutLimpio.slice(-1).toUpperCase();
  const cuerpo = rutLimpio.slice(0, -1);
  
  // Validar que el cuerpo tenga solo dígitos y el dv sea un dígito o una K
  if (!/^\d+$/.test(cuerpo) || !/^[\dK]$/.test(dv)) return false;
  
  // Calcular el dígito verificador esperado
  const dvEsperado = calcularDV(cuerpo);
  
  // Comparar con el dígito verificador proporcionado
  return dv === dvEsperado;
}

/**
 * Calcula el dígito verificador para un RUT chileno
 * @param cuerpo Cuerpo del RUT (sin dígito verificador)
 * @returns Dígito verificador calculado
 */
function calcularDV(cuerpo: string): string {
  let suma = 0;
  let multiplo = 2;
  
  // Recorrer el cuerpo de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  
  const resto = suma % 11;
  const dvNumerico = 11 - resto;
  
  if (dvNumerico === 11) return '0';
  if (dvNumerico === 10) return 'K';
  return dvNumerico.toString();
}