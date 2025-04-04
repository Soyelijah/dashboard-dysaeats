# Pruebas y Control de Calidad en DysaEats

Este documento explica las estrategias y técnicas de pruebas implementadas en DysaEats para garantizar la calidad del código.

## Pruebas Unitarias en el Backend (NestJS)

El proyecto DysaEats utiliza Jest como framework principal de pruebas. Veamos un análisis del archivo de prueba para el servicio de autenticación:

### Archivo: `backend/src/modules/auth/auth.service.spec.ts`

#### Configuración de Mocks

```typescript
// Mock del UserRepository
const mockUserRepository = () => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

// Mock del JwtService
const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn(),
});

// Mock del ConfigService
const mockConfigService = () => ({
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'JWT_SECRET') return 'test-secret';
    if (key === 'JWT_EXPIRATION') return '1d';
    return null;
  }),
});
```

Estas funciones crean mocks para las dependencias de `AuthService`. Los mocks son esenciales para aislar la unidad que se está probando (en este caso, `AuthService`) de sus dependencias.

#### Configuración del Módulo de Prueba

```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: UserRepository, useFactory: mockUserRepository },
      { provide: JwtService, useFactory: mockJwtService },
      { provide: ConfigService, useFactory: mockConfigService },
    ],
  }).compile();

  service = module.get<AuthService>(AuthService);
  userRepository = module.get<UserRepository>(UserRepository);
  jwtService = module.get<JwtService>(JwtService);
});
```

Antes de cada prueba, se crea un módulo de prueba que:
1. Registra `AuthService` como un proveedor real
2. Reemplaza sus dependencias con los mocks definidos anteriormente
3. Obtiene referencias a los servicios y repositorios para usarlos en las pruebas

#### Pruebas para el Método `register`

```typescript
describe('register', () => {
  it('should register a new user successfully', async () => {
    // Arrange
    const registerDto: RegisterDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      rut: '12345678-9',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-id',
      ...registerDto,
      password: 'hashed-password',
    };

    userRepository.findOneBy.mockResolvedValue(null); // Usuario no existe
    userRepository.create.mockReturnValue(mockUser);
    userRepository.save.mockResolvedValue(mockUser);

    jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

    // Act
    const result = await service.register(registerDto);

    // Assert
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: registerDto.email });
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ rut: registerDto.rut });
    expect(userRepository.create).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 'salt');
    expect(result).toEqual(mockUser);
  });
```

Esta prueba verifica el flujo exitoso del registro de usuarios:

1. **Arrange**: Configura los datos de prueba y define el comportamiento esperado de los mocks
2. **Act**: Ejecuta el método que se está probando
3. **Assert**: Verifica que:
   - Se busque al usuario por email y RUT
   - Se cree y guarde un nuevo usuario
   - Se cifre la contraseña con bcrypt
   - El resultado sea el usuario creado

#### Pruebas para Escenarios de Error

```typescript
it('should throw ConflictException if email already exists', async () => {
  // Arrange
  const registerDto: RegisterDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'existing@example.com',
    rut: '12345678-9',
    password: 'Password123!',
  };

  userRepository.findOneBy.mockResolvedValueOnce({
    id: 'existing-user-id',
    email: registerDto.email,
  });

  // Act & Assert
  await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
  expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: registerDto.email });
});
```

Esta prueba verifica que se lance una excepción cuando se intenta registrar un usuario con un email que ya existe. Similar a esto, hay otra prueba para verificar la unicidad del RUT.

#### Pruebas para `validateUser` y `login`

Las pruebas para `validateUser` verifican:
- La autenticación exitosa con credenciales válidas
- El manejo de usuarios inexistentes
- El rechazo de contraseñas incorrectas

Las pruebas para `login` verifican:
- La generación de un token JWT
- Los datos devueltos al usuario

## Beneficios del Enfoque de Pruebas Unitarias

1. **Aislamiento**: Cada unidad se prueba de forma aislada para identificar problemas específicos.
2. **Dependencias simuladas**: Los mocks permiten controlar el comportamiento de las dependencias.
3. **Cobertura completa**: Se prueban tanto los casos exitosos como los escenarios de error.
4. **Patrón AAA (Arrange-Act-Assert)**: Estructura clara que facilita entender y mantener las pruebas.
5. **Verificación precisa**: Las pruebas verifican tanto la funcionalidad como las interacciones entre componentes.

## Estrategias de Prueba en DysaEats

1. **Pruebas unitarias** para servicios, controladores y repositorios individuales
2. **Pruebas de integración** para verificar la interacción entre módulos
3. **Pruebas end-to-end** para validar flujos completos desde el frontend hasta la base de datos
4. **Pruebas de API** para garantizar que los endpoints funcionan correctamente

Para ejecutar las pruebas, se pueden usar los siguientes comandos:

```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar pruebas con cobertura
npm run test:cov

# Ejecutar pruebas en modo watch (útil durante el desarrollo)
npm run test:watch

# Ejecutar pruebas e2e
npm run test:e2e
```

## Implementación de CI/CD

El proyecto también puede configurarse con flujos de CI/CD para ejecutar estas pruebas automáticamente:

1. Ejecutar pruebas en cada Pull Request
2. Verificar la cobertura del código
3. Bloquear la fusión de código que no pase las pruebas
4. Implementar análisis de código estático con ESLint
5. Ejecutar pruebas end-to-end antes de los despliegues

Esta estrategia integral de pruebas ayuda a mantener la calidad del código y a identificar problemas temprano en el ciclo de desarrollo.