import { Test, TestingModule } from '@nestjs/testing';
import { TypeCommonAreasController } from './type-common-areas.controller';
import { TypeCommonAreasService } from './type-common-areas.service';

describe('TypeCommonAreasController', () => {
  let controller: TypeCommonAreasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeCommonAreasController],
      providers: [TypeCommonAreasService],
    }).compile();

    controller = module.get<TypeCommonAreasController>(TypeCommonAreasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
