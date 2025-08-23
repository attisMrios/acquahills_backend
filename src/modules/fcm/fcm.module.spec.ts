import { Test, TestingModule } from '@nestjs/testing';
import { ServicesModule } from '../../common/services/services.module';
import { FcmController } from './fcm.controller';
import { FcmModule } from './fcm.module';
import { FcmService } from './fcm.service';

describe('FcmModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FcmModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have FcmController defined', () => {
    const controller = module.get<FcmController>(FcmController);
    expect(controller).toBeDefined();
  });

  it('should have FcmService defined', () => {
    const service = module.get<FcmService>(FcmService);
    expect(service).toBeDefined();
  });

  it('should import ServicesModule', () => {
    const servicesModule = module.get(ServicesModule, { strict: false });
    expect(servicesModule).toBeDefined();
  });

  it('should export FcmService', () => {
    const service = module.get<FcmService>(FcmService);
    expect(service).toBeDefined();
  });

  it('should have correct module structure', () => {
    const moduleMetadata = Reflect.getMetadata('imports', FcmModule);
    const moduleProviders = Reflect.getMetadata('providers', FcmModule);
    const moduleControllers = Reflect.getMetadata('controllers', FcmModule);
    const moduleExports = Reflect.getMetadata('exports', FcmModule);

    expect(moduleMetadata).toContain(ServicesModule);
    expect(moduleProviders).toContain(FcmService);
    expect(moduleControllers).toContain(FcmController);
    expect(moduleExports).toContain(FcmService);
  });
});
