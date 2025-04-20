import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';

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

describe('AuthService', () => {
  let service: AuthService;
  let userRepository;
  let jwtService;

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

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        rut: '12345678-9',
        password: 'Password123!',
<<<<<<< HEAD
        role: UserRole.CUSTOMER,
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
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

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        rut: '12345678-9',
        password: 'Password123!',
<<<<<<< HEAD
        role: UserRole.CUSTOMER,
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      };

      userRepository.findOneBy.mockResolvedValueOnce({
        id: 'existing-user-id',
        email: registerDto.email,
      });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: registerDto.email });
    });

    it('should throw ConflictException if RUT already exists', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        rut: 'existing-rut',
        password: 'Password123!',
<<<<<<< HEAD
        role: UserRole.CUSTOMER,
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      };

      userRepository.findOneBy.mockResolvedValueOnce(null);
      userRepository.findOneBy.mockResolvedValueOnce({
        id: 'existing-user-id',
        rut: registerDto.rut,
      });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: registerDto.email });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ rut: registerDto.rut });
    });
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      userRepository.findOneBy.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act
      const result = await service.validateUser('test@example.com', 'password');

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      // Arrange
      userRepository.findOneBy.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('nonexistent@example.com', 'password');

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      userRepository.findOneBy.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act
      const result = await service.validateUser('test@example.com', 'wrong-password');

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.RESTAURANT_OWNER,
      };

      jwtService.sign.mockReturnValue('test-token');

      // Act
      const result = await service.login(mockUser as User);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        accessToken: 'test-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
    });
  });

  describe('validateToken', () => {
    it('should return user data if token is valid', async () => {
      // Arrange
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      jwtService.verify.mockReturnValue(mockPayload);
      userRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateToken('valid-token');

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: mockPayload.sub });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith('invalid-token', {
        secret: 'test-secret',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const mockPayload = {
        sub: 'nonexistent-user-id',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      jwtService.verify.mockReturnValue(mockPayload);
      userRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateToken('valid-token')).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: mockPayload.sub });
    });
  });
});