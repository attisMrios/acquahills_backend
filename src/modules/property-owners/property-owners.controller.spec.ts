import { Test, TestingModule } from '@nestjs/testing';
import { PropertyOwnersController } from './property-owners.controller';
import { PropertyOwnersService } from './property-owners.service';

describe('PropertyOwnersController', () => {
  let controller: PropertyOwnersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyOwnersController],
      providers: [PropertyOwnersService],
    }).compile();

    controller = module.get<PropertyOwnersController>(PropertyOwnersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
