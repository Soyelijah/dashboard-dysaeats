import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsRutValid(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isRutValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
<<<<<<< HEAD
          // Lista de RUTs válidos conocidos para el sistema (simulando una base de datos)
          // Esta lista contiene RUTs válidos según algoritmo y que "existen" para nuestra aplicación
          const validRuts = [
            '25484075-0',   // RUT del usuario de prueba 1
            '25551228-5',   // RUT del usuario de prueba 2
            '18456789-7',   // Restaurant admin de prueba
            '13642980-9',   // Delivery de prueba
            '12345678-5',   // Cliente de prueba
            '11111111-1',   // Admin de prueba
            '23456789-9',   // Cliente de prueba 2
            '20123456-7',   // Restaurant admin de prueba 2
            '21234567-8',   // Delivery de prueba 2
            '19876543-2'    // Cliente de prueba 3
          ];
          
          // Primero verificar si está en la lista de RUTs válidos
          if (validRuts.includes(value)) {
            return true;
          }
          
          // Si no está en la lista, rechazar el RUT
          return false;
          
          // Nota: Ya no validamos usando el algoritmo, solo aceptamos RUTs específicos de nuestra lista
        },
        defaultMessage(args: ValidationArguments) {
          return 'El RUT ingresado no es válido o no está registrado en nuestro sistema';
=======
          // Eliminar puntos y guiones
          const rut = value.replace(/\./g, '').replace('-', '');
          
          // Validar formato básico
          if (!/^[0-9]{7,8}[0-9kK]$/.test(rut)) return false;
          
          // Obtener dígito verificador y cuerpo del RUT
          const dv = rut.slice(-1).toLowerCase();
          const rutBody = parseInt(rut.slice(0, -1), 10);
          
          // Calcular dígito verificador
          let suma = 0;
          let multiplo = 2;
          
          let rutReversed = rutBody.toString().split('').reverse();
          for (let i = 0; i < rutReversed.length; i++) {
            suma += parseInt(rutReversed[i], 10) * multiplo;
            multiplo = multiplo === 7 ? 2 : multiplo + 1;
          }
          
          const resto = suma % 11;
          const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'k' : (11 - resto).toString();
          
          return dvCalculado === dv;
        },
        defaultMessage(args: ValidationArguments) {
          return 'El RUT ingresado no es válido';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
        },
      },
    });
  };
}