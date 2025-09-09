import { z } from 'zod';
import { RegisterTokenSchema } from './fcm.input.dto';

describe('FcmInputDto', () => {
  describe('RegisterTokenSchema', () => {
    it('should validate correct fcmToken', () => {
      // Arrange
      const validData = {
        fcmToken: 'fcm_token_example_123456789',
      };

      // Act
      const result = RegisterTokenSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject empty fcmToken', () => {
      // Arrange
      const invalidData = {
        fcmToken: '',
      };

      // Act
      const result = RegisterTokenSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El token FCM es requerido');
      }
    });

    it('should reject missing fcmToken', () => {
      // Arrange
      const invalidData = {};

      // Act
      const result = RegisterTokenSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El token FCM es requerido');
      }
    });

    it('should reject fcmToken with only whitespace', () => {
      // Arrange
      const invalidData = {
        fcmToken: '   ',
      };

      // Act
      const result = RegisterTokenSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El token FCM es requerido');
      }
    });

    it('should accept fcmToken with special characters', () => {
      // Arrange
      const validData = {
        fcmToken: 'fcm_token_with_special_chars_!@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      // Act
      const result = RegisterTokenSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept fcmToken with numbers', () => {
      // Arrange
      const validData = {
        fcmToken: 'fcm_token_123456789',
      };

      // Act
      const result = RegisterTokenSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept very long fcmToken', () => {
      // Arrange
      const longToken = 'fcm_token_' + 'a'.repeat(1000);
      const validData = {
        fcmToken: longToken,
      };

      // Act
      const result = RegisterTokenSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject null fcmToken', () => {
      // Arrange
      const invalidData = {
        fcmToken: null,
      };

      // Act
      const result = RegisterTokenSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject undefined fcmToken', () => {
      // Arrange
      const invalidData = {
        fcmToken: undefined,
      };

      // Act
      const result = RegisterTokenSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('RegisterTokenDto type', () => {
    it('should infer correct type from schema', () => {
      // This test ensures TypeScript types are correctly inferred
      const testFunction = (data: z.infer<typeof RegisterTokenSchema>) => {
        expect(typeof data.fcmToken).toBe('string');
        expect(data.fcmToken.length).toBeGreaterThan(0);
      };

      const validData = {
        fcmToken: 'valid_fcm_token',
      };

      // Should not throw TypeScript errors
      testFunction(validData);
    });
  });
});
