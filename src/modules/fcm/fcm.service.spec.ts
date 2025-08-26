import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterTokenDto } from '../../common/dtos/inputs/fcm.input.dto';
import { PrismaService } from '../../common/services/prisma.service';
import { FcmService } from './fcm.service';

describe('FcmService', () => {
  let service: FcmService;
  let prismaService: PrismaService;

  // Mock data para las pruebas
  const mockUser = {
    id: 'user_123',
    userName: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com',
    role: 'user',
    userGroupMembers: [
      {
        userGroup: {
          id: 'group_1',
          name: 'Test Group 1',
        },
      },
      {
        userGroup: {
          id: 'group_2',
          name: 'Test Group 2',
        },
      },
    ],
  };

  const mockUserWithoutGroups = {
    id: 'user_456',
    userName: 'testuser2',
    fullName: 'Test User 2',
    email: 'test2@example.com',
    role: 'user',
    userGroupMembers: [],
  };

  const mockRegisterTokenDto: RegisterTokenDto = {
    fcmToken: 'fcm_token_example_123456789',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            userGroupMember: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FcmService>(FcmService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerToken', () => {
    it('should successfully register a token for a user with groups', async () => {
      // Arrange
      const userId = 'user_123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      const result = await service.registerToken(userId, mockRegisterTokenDto);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Token FCM registrado exitosamente',
        topicsSubscribed: ['topic_user_user_123', 'topic_group_group_1', 'topic_group_group_2'],
        userId: 'user_123',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          userGroupMembers: {
            include: {
              userGroup: true,
            },
          },
        },
      });
    });

    it('should successfully register a token for a user without groups', async () => {
      // Arrange
      const userId = 'user_456';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUserWithoutGroups as any);
      jest.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      const result = await service.registerToken(userId, mockRegisterTokenDto);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Token FCM registrado exitosamente',
        topicsSubscribed: ['topic_user_user_456'],
        userId: 'user_456',
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non_existent_user';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.registerToken(userId, mockRegisterTokenDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          userGroupMembers: {
            include: {
              userGroup: true,
            },
          },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = 'user_123';
      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.registerToken(userId, mockRegisterTokenDto)).rejects.toThrow(
        'Error al registrar el token FCM',
      );
    });

    it('should log subscription attempts for each topic', async () => {
      // Arrange
      const userId = 'user_123';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

      // Act
      await service.registerToken(userId, mockRegisterTokenDto);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Suscribiendo token fcm_token_example_12... al topic: topic_user_user_123',
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Suscribiendo token fcm_token_example_12... al topic: topic_group_group_1',
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Suscribiendo token fcm_token_example_12... al topic: topic_group_group_2',
        ),
      );
    });
  });

  describe('getUserTopics', () => {
    it('should return topics for a user with groups', async () => {
      // Arrange
      const userId = 'user_123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

      // Act
      const result = await service.getUserTopics(userId);

      // Assert
      expect(result).toEqual(['topic_user_user_123', 'topic_group_group_1', 'topic_group_group_2']);
    });

    it('should return only user topic for user without groups', async () => {
      // Arrange
      const userId = 'user_456';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUserWithoutGroups as any);

      // Act
      const result = await service.getUserTopics(userId);

      // Assert
      expect(result).toEqual(['topic_user_user_456']);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non_existent_user';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserTopics(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserGroups', () => {
    it('should return user groups information', async () => {
      // Arrange
      const userId = 'user_123';
      jest.spyOn(prismaService.userGroupMember, 'findMany').mockResolvedValue([
        {
          userGroup: {
            id: 'group_1',
            name: 'Test Group 1',
          },
        },
        {
          userGroup: {
            id: 'group_2',
            name: 'Test Group 2',
          },
        },
      ] as any);

      // Act
      const result = await service.getUserGroups(userId);

      // Assert
      expect(result).toEqual([
        { id: 'group_1', name: 'Test Group 1' },
        { id: 'group_2', name: 'Test Group 2' },
      ]);

      expect(prismaService.userGroupMember.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          userGroup: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should return empty array for user without groups', async () => {
      // Arrange
      const userId = 'user_456';
      jest.spyOn(prismaService.userGroupMember, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.getUserGroups(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('private methods', () => {
    describe('generateUserTopics', () => {
      it('should generate correct topics for user with groups', () => {
        // Arrange
        const userId = 'user_123';
        const userGroupMembers = mockUser.userGroupMembers;

        // Act
        const result = (service as any).generateUserTopics(userId, userGroupMembers);

        // Assert
        expect(result).toEqual([
          'topic_user_user_123',
          'topic_group_group_1',
          'topic_group_group_2',
        ]);
      });

      it('should generate only user topic for user without groups', () => {
        // Arrange
        const userId = 'user_456';
        const userGroupMembers: any[] = [];

        // Act
        const result = (service as any).generateUserTopics(userId, userGroupMembers);

        // Assert
        expect(result).toEqual(['topic_user_user_456']);
      });
    });

    describe('subscribeToTopics', () => {
      it('should log subscription attempts for each topic', async () => {
        // Arrange
        const fcmToken = 'test_token_123';
        const topics = ['topic_user_123', 'topic_group_456'];
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // Act
        await (service as any).subscribeToTopics(fcmToken, topics);

        // Assert
        expect(consoleSpy).toHaveBeenCalledTimes(2);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            '✅ Suscribiendo token test_token_123... al topic: topic_user_123',
          ),
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            '✅ Suscribiendo token test_token_123... al topic: topic_group_456',
          ),
        );
      });

      it('should handle errors gracefully and continue with other topics', async () => {
        // Arrange
        const fcmToken = 'test_token_123';
        const topics = ['topic_user_123', 'topic_group_456'];
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Simular error en el primer topic
        jest.spyOn(console, 'log').mockImplementation((message) => {
          if (message.includes('topic_user_123')) {
            throw new Error('Subscription error');
          }
        });

        // Act
        await (service as any).subscribeToTopics(fcmToken, topics);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Error suscribiendo al topic topic_user_123:',
          expect.any(Error),
        );
        // Debería continuar con el segundo topic
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            '✅ Suscribiendo token test_token_123... al topic: topic_group_456',
          ),
        );
      });
    });
  });
});
