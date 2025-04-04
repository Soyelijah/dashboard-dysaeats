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
        },
      },
    });
  };
}