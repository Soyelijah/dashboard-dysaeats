/**
 * Utilidades para trabajar con RUT Chilenos
 */
export class RutUtil {
  /**
   * Valida un RUT chileno
   * @param rut RUT a validar (puede contener puntos, guiones y espacios)
   * @returns true si el RUT es válido, false en caso contrario
   */
  static validate(rut: string): boolean {
    if (!rut) return false;
    
    // Eliminar puntos, guiones y espacios
    rut = rut.replace(/[.-]/g, '').replace(/\s/g, '').toUpperCase();
    
    // Verificar formato básico
    if (!/^[0-9]{7,8}[0-9K]$/.test(rut)) {
      return false;
    }
    
    // Separar el cuerpo del dígito verificador
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    // Calcular el dígito verificador esperado
    let suma = 0;
    let multiplo = 2;
    
    // Recorrer el cuerpo de derecha a izquierda
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    // Calcular el dígito verificador esperado
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    // Comparar el dígito verificador calculado con el proporcionado
    return dvCalculado === dv;
  }
  
  /**
   * Formatea un RUT al formato estándar (XX.XXX.XXX-X)
   * @param rut RUT a formatear
   * @returns RUT formateado
   */
  static format(rut: string): string {
    if (!rut) return '';
    
    // Eliminar puntos, guiones y espacios
    rut = rut.replace(/[.-]/g, '').replace(/\s/g, '').toUpperCase();
    
    // Separar cuerpo y dígito verificador
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    // Formatear el cuerpo con puntos
    let rutFormateado = '';
    let j = 0;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      rutFormateado = cuerpo.charAt(i) + rutFormateado;
      j++;
      if (j % 3 === 0 && i !== 0) {
        rutFormateado = '.' + rutFormateado;
      }
    }
    
    // Agregar el guion y el dígito verificador
    return rutFormateado + '-' + dv;
  }
  
  /**
   * Calcula el dígito verificador de un RUT
   * @param rutBody Cuerpo del RUT (sin dígito verificador)
   * @returns Dígito verificador
   */
  static getDigitoVerificador(rutBody: string): string {
    if (!rutBody || !/^\d+$/.test(rutBody)) return '';
    
    let suma = 0;
    let multiplo = 2;
    
    // Recorrer el cuerpo de derecha a izquierda
    for (let i = rutBody.length - 1; i >= 0; i--) {
      suma += parseInt(rutBody.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    // Calcular el dígito verificador
    const dvEsperado = 11 - (suma % 11);
    return dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  }
  
  /**
   * Limpia un RUT eliminando todos los caracteres no numéricos ni K
   * @param rut RUT a limpiar
   * @returns RUT limpio (solo números y K)
   */
  static clean(rut: string): string {
    if (!rut) return '';
    return rut.replace(/[^0-9kK]/g, '').toUpperCase();
  }
  
  /**
   * Obtiene el cuerpo de un RUT (sin dígito verificador)
   * @param rut RUT completo
   * @returns Cuerpo del RUT
   */
  static getBody(rut: string): string {
    if (!rut) return '';
    const rutLimpio = this.clean(rut);
    return rutLimpio.slice(0, -1);
  }
  
  /**
   * Obtiene el dígito verificador de un RUT
   * @param rut RUT completo
   * @returns Dígito verificador
   */
  static getDigito(rut: string): string {
    if (!rut) return '';
    const rutLimpio = this.clean(rut);
    return rutLimpio.slice(-1);
  }
}