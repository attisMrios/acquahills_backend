import { Test, TestingModule } from '@nestjs/testing';
import { TypeCommonAreasService } from './type-common-areas.service';

describe('TypeCommonAreasService', () => {
  let service: TypeCommonAreasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeCommonAreasService],
    }).compile();

    service = module.get<TypeCommonAreasService>(TypeCommonAreasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
