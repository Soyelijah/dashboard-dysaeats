import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class RutValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Verificar si el valor es un RUT
    if (metadata.data === 'rut' || metadata.data?.includes('rut')) {
      if (!this.isValidRut(value)) {
        throw new BadRequestException('RUT no válido');
      }
      
      // Formatear el RUT de manera estándar (XX.XXX.XXX-X)
      return this.formatRut(value);
    }
    
    return value;
  }
  
  /**
   * Valida un RUT chileno
   * @param rut RUT a validar (puede contener puntos, guiones y espacios)
   * @returns true si el RUT es válido, false en caso contrario
   */
  private isValidRut(rut: string): boolean {
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
  private formatRut(rut: string): string {
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
}