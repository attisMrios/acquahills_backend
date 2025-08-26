import { Test, TestingModule } from '@nestjs/testing';
import { RegisterTokenDto } from '../../common/dtos/inputs/fcm.input.dto';
import { FcmController } from './fcm.controller';
import { FcmService } from './fcm.service';

describe('FcmController', () => {
  let controller: FcmController;
  let service: FcmService;

  // Mock data para las pruebas
  const mockUser = {
    uid: 'user_123',
    email: 'test@example.com',
  };

  const mockRegisterTokenDto: RegisterTokenDto = {
    fcmToken: 'fcm_token_example_123456789',
  };

  const mockRegisterTokenResponse = {
    success: true,
    message: 'Token FCM registrado exitosamente',
    topicsSubscribed: ['topic_user_user_123', 'topic_group_group_1'],
    userId: 'user_123',
  };

  const mockUserTopicsResponse = {
    success: true,
    topics: ['topic_user_user_123', 'topic_group_group_1'],
    userId: 'user_123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FcmController],
      providers: [
        {
          provide: FcmService,
          useValue: {
            registerToken: jest.fn(),
            getUserTopics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FcmController>(FcmController);
    service = module.get<FcmService>(FcmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerToken', () => {
    it('should successfully register a token for authenticated user', async () => {
      // Arrange
      const req = { user: mockUser };
      jest.spyOn(service, 'registerToken').mockResolvedValue(mockRegisterTokenResponse);

      // Act
      const result = await controller.registerToken(req, mockRegisterTokenDto);

      // Assert
      expect(result).toEqual(mockRegisterTokenResponse);
      expect(service.registerToken).toHaveBeenCalledWith(mockUser.uid, mockRegisterTokenDto);
      expect(service.registerToken).toHaveBeenCalledTimes(1);
    });

    it('should extract userId from request.user.uid', async () => {
      // Arrange
      const req = { user: { uid: 'custom_user_id' } };
      jest.spyOn(service, 'registerToken').mockResolvedValue(mockRegisterTokenResponse);

      // Act
      await controller.registerToken(req, mockRegisterTokenDto);

      // Assert
      expect(service.registerToken).toHaveBeenCalledWith('custom_user_id', mockRegisterTokenDto);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const req = { user: mockUser };
      const serviceError = new Error('Service error');
      jest.spyOn(service, 'registerToken').mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.registerToken(req, mockRegisterTokenDto)).rejects.toThrow(
        'Service error',
      );
    });

    it('should pass the correct DTO to the service', async () => {
      // Arrange
      const req = { user: mockUser };
      const customDto: RegisterTokenDto = {
        fcmToken: 'custom_fcm_token_987654321',
      };
      jest.spyOn(service, 'registerToken').mockResolvedValue(mockRegisterTokenResponse);

      // Act
      await controller.registerToken(req, customDto);

      // Assert
      expect(service.registerToken).toHaveBeenCalledWith(mockUser.uid, customDto);
    });
  });

  describe('getUserTopics', () => {
    it('should return user topics for authenticated user', async () => {
      // Arrange
      const req = { user: mockUser };
      const mockTopics = ['topic_user_user_123', 'topic_group_group_1'];
      jest.spyOn(service, 'getUserTopics').mockResolvedValue(mockTopics);

      // Act
      const result = await controller.getUserTopics(req);

      // Assert
      expect(result).toEqual(mockUserTopicsResponse);
      expect(service.getUserTopics).toHaveBeenCalledWith(mockUser.uid);
      expect(service.getUserTopics).toHaveBeenCalledTimes(1);
    });

    it('should extract userId from request.user.uid', async () => {
      // Arrange
      const req = { user: { uid: 'custom_user_id' } };
      const mockTopics = ['topic_user_custom_user_id'];
      jest.spyOn(service, 'getUserTopics').mockResolvedValue(mockTopics);

      // Act
      const result = await controller.getUserTopics(req);

      // Assert
      expect(service.getUserTopics).toHaveBeenCalledWith('custom_user_id');
      expect(result.userId).toBe('custom_user_id');
    });

    it('should handle empty topics array', async () => {
      // Arrange
      const req = { user: mockUser };
      const mockTopics: string[] = [];
      jest.spyOn(service, 'getUserTopics').mockResolvedValue(mockTopics);

      // Act
      const result = await controller.getUserTopics(req);

      // Assert
      expect(result).toEqual({
        success: true,
        topics: [],
        userId: mockUser.uid,
      });
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const req = { user: mockUser };
      const serviceError = new Error('Service error');
      jest.spyOn(service, 'getUserTopics').mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.getUserTopics(req)).rejects.toThrow('Service error');
    });

    it('should return correct response structure', async () => {
      // Arrange
      const req = { user: mockUser };
      const mockTopics = ['topic_user_user_123', 'topic_group_group_1', 'topic_group_group_2'];
      jest.spyOn(service, 'getUserTopics').mockResolvedValue(mockTopics);

      // Act
      const result = await controller.getUserTopics(req);

      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('topics');
      expect(result).toHaveProperty('userId');
      expect(Array.isArray(result.topics)).toBe(true);
      expect(result.topics).toHaveLength(3);
      expect(result.userId).toBe(mockUser.uid);
    });
  });

  describe('controller configuration', () => {
    it('should have correct API tags', () => {
      // Assert
      expect(Reflect.getMetadata('swagger/apiTags', FcmController)).toEqual(['fcm']);
    });

    it('should have correct controller path', () => {
      // Assert
      expect(Reflect.getMetadata('path', FcmController)).toBe('fcm');
    });

    it('should use ClassSerializerInterceptor', () => {
      // Assert
      const interceptors = Reflect.getMetadata('__interceptors__', FcmController);
      expect(interceptors).toBeDefined();
    });
  });

  describe('endpoint decorators', () => {
    it('should have registerToken endpoint with correct HTTP method and path', () => {
      // Assert
      const registerTokenMetadata = Reflect.getMetadata('__route__', controller.registerToken);
      expect(registerTokenMetadata).toBeDefined();
    });

    it('should have getUserTopics endpoint with correct HTTP method and path', () => {
      // Assert
      const getUserTopicsMetadata = Reflect.getMetadata('__route__', controller.getUserTopics);
      expect(getUserTopicsMetadata).toBeDefined();
    });

    it('should use FirebaseAuthGuard for both endpoints', () => {
      // Assert
      const registerTokenGuards = Reflect.getMetadata('__guards__', controller.registerToken);
      const getUserTopicsGuards = Reflect.getMetadata('__guards__', controller.getUserTopics);

      expect(registerTokenGuards).toBeDefined();
      expect(getUserTopicsGuards).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle undefined user in request', async () => {
      // Arrange
      const req = { user: undefined };
      jest.spyOn(service, 'registerToken').mockResolvedValue(mockRegisterTokenResponse);

      // Act & Assert
      await expect(controller.registerToken(req, mockRegisterTokenDto)).rejects.toThrow();
    });

    it('should handle missing uid in user object', async () => {
      // Arrange
      const req = { user: { email: 'test@example.com' } };
      jest.spyOn(service, 'registerToken').mockResolvedValue(mockRegisterTokenResponse);

      // Act & Assert
      await expect(controller.registerToken(req, mockRegisterTokenDto)).rejects.toThrow();
    });
  });
});
