import { RegisterTokenResponse, UserGroupInfo } from './fcm.types';

describe('FcmTypes', () => {
  describe('RegisterTokenResponse', () => {
    it('should have correct structure', () => {
      // Arrange
      const mockResponse: RegisterTokenResponse = {
        success: true,
        message: 'Token FCM registrado exitosamente',
        topicsSubscribed: ['topic_user_123', 'topic_group_456'],
        userId: 'user_123',
      };

      // Assert
      expect(mockResponse).toHaveProperty('success');
      expect(mockResponse).toHaveProperty('message');
      expect(mockResponse).toHaveProperty('topicsSubscribed');
      expect(mockResponse).toHaveProperty('userId');

      expect(typeof mockResponse.success).toBe('boolean');
      expect(typeof mockResponse.message).toBe('string');
      expect(Array.isArray(mockResponse.topicsSubscribed)).toBe(true);
      expect(typeof mockResponse.userId).toBe('string');
    });

    it('should allow false success value', () => {
      // Arrange
      const mockResponse: RegisterTokenResponse = {
        success: false,
        message: 'Error al registrar token',
        topicsSubscribed: [],
        userId: 'user_123',
      };

      // Assert
      expect(mockResponse.success).toBe(false);
    });

    it('should allow empty topics array', () => {
      // Arrange
      const mockResponse: RegisterTokenResponse = {
        success: true,
        message: 'Token registrado sin topics',
        topicsSubscribed: [],
        userId: 'user_123',
      };

      // Assert
      expect(mockResponse.topicsSubscribed).toEqual([]);
      expect(mockResponse.topicsSubscribed).toHaveLength(0);
    });

    it('should allow multiple topics', () => {
      // Arrange
      const mockResponse: RegisterTokenResponse = {
        success: true,
        message: 'Token registrado con múltiples topics',
        topicsSubscribed: [
          'topic_user_123',
          'topic_group_456',
          'topic_group_789',
          'topic_admin_all',
        ],
        userId: 'user_123',
      };

      // Assert
      expect(mockResponse.topicsSubscribed).toHaveLength(4);
      expect(mockResponse.topicsSubscribed).toContain('topic_user_123');
      expect(mockResponse.topicsSubscribed).toContain('topic_group_456');
    });

    it('should allow long message strings', () => {
      // Arrange
      const longMessage =
        'Este es un mensaje muy largo que describe en detalle lo que sucedió durante el proceso de registro del token FCM. Incluye información sobre los topics suscritos y el estado del usuario.';

      const mockResponse: RegisterTokenResponse = {
        success: true,
        message: longMessage,
        topicsSubscribed: ['topic_user_123'],
        userId: 'user_123',
      };

      // Assert
      expect(mockResponse.message).toBe(longMessage);
      expect(mockResponse.message.length).toBeGreaterThan(100);
    });

    it('should allow special characters in userId', () => {
      // Arrange
      const mockResponse: RegisterTokenResponse = {
        success: true,
        message: 'Token registrado exitosamente',
        topicsSubscribed: ['topic_user_123'],
        userId: 'user_123_!@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      // Assert
      expect(mockResponse.userId).toContain('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });
  });

  describe('UserGroupInfo', () => {
    it('should have correct structure', () => {
      // Arrange
      const mockUserGroup: UserGroupInfo = {
        id: 'group_123',
        name: 'Test Group',
      };

      // Assert
      expect(mockUserGroup).toHaveProperty('id');
      expect(mockUserGroup).toHaveProperty('name');

      expect(typeof mockUserGroup.id).toBe('string');
      expect(typeof mockUserGroup.name).toBe('string');
    });

    it('should allow empty name', () => {
      // Arrange
      const mockUserGroup: UserGroupInfo = {
        id: 'group_123',
        name: '',
      };

      // Assert
      expect(mockUserGroup.name).toBe('');
    });

    it('should allow long names', () => {
      // Arrange
      const longName =
        'Este es un nombre de grupo muy largo que describe en detalle el propósito y la función del grupo dentro del sistema. Incluye información sobre los miembros, permisos y responsabilidades.';

      const mockUserGroup: UserGroupInfo = {
        id: 'group_123',
        name: longName,
      };

      // Assert
      expect(mockUserGroup.name).toBe(longName);
      expect(mockUserGroup.name.length).toBeGreaterThan(100);
    });

    it('should allow special characters in id', () => {
      // Arrange
      const mockUserGroup: UserGroupInfo = {
        id: 'group_123_!@#$%^&*()_+-=[]{}|;:,.<>?',
        name: 'Test Group',
      };

      // Assert
      expect(mockUserGroup.id).toContain('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should allow numeric characters in id', () => {
      // Arrange
      const mockUserGroup: UserGroupInfo = {
        id: 'group_123456789',
        name: 'Test Group',
      };

      // Assert
      expect(mockUserGroup.id).toContain('123456789');
    });
  });

  describe('Type compatibility', () => {
    it('should be compatible with actual service responses', () => {
      // This test ensures the types are compatible with actual service implementations
      const createMockResponse = (): RegisterTokenResponse => ({
        success: true,
        message: 'Test message',
        topicsSubscribed: ['topic_1', 'topic_2'],
        userId: 'user_123',
      });

      const createMockUserGroup = (): UserGroupInfo => ({
        id: 'group_123',
        name: 'Test Group',
      });

      // Should not throw TypeScript errors
      const response = createMockResponse();
      const userGroup = createMockUserGroup();

      expect(response).toBeDefined();
      expect(userGroup).toBeDefined();
    });

    it('should allow array operations on topicsSubscribed', () => {
      // Arrange
      const mockResponse: RegisterTokenResponse = {
        success: true,
        message: 'Token registrado exitosamente',
        topicsSubscribed: ['topic_user_123', 'topic_group_456'],
        userId: 'user_123',
      };

      // Act
      const filteredTopics = mockResponse.topicsSubscribed.filter((topic) =>
        topic.includes('user'),
      );
      const mappedTopics = mockResponse.topicsSubscribed.map((topic) => topic.toUpperCase());
      const sortedTopics = [...mockResponse.topicsSubscribed].sort();

      // Assert
      expect(filteredTopics).toEqual(['topic_user_123']);
      expect(mappedTopics).toEqual(['TOPIC_USER_123', 'TOPIC_GROUP_456']);
      expect(sortedTopics).toEqual(['topic_group_456', 'topic_user_123']);
    });

    it('should allow array operations on UserGroupInfo arrays', () => {
      // Arrange
      const mockUserGroups: UserGroupInfo[] = [
        { id: 'group_2', name: 'Group B' },
        { id: 'group_1', name: 'Group A' },
        { id: 'group_3', name: 'Group C' },
      ];

      // Act
      const sortedById = [...mockUserGroups].sort((a, b) => a.id.localeCompare(b.id));
      const sortedByName = [...mockUserGroups].sort((a, b) => a.name.localeCompare(b.name));
      const filteredByPrefix = mockUserGroups.filter((group) => group.id.startsWith('group_'));

      // Assert
      expect(sortedById).toEqual([
        { id: 'group_1', name: 'Group A' },
        { id: 'group_2', name: 'Group B' },
        { id: 'group_3', name: 'Group C' },
      ]);

      expect(sortedByName).toEqual([
        { id: 'group_1', name: 'Group A' },
        { id: 'group_2', name: 'Group B' },
        { id: 'group_3', name: 'Group C' },
      ]);

      expect(filteredByPrefix).toHaveLength(3);
    });
  });
});
