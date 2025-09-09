import { Test, TestingModule } from '@nestjs/testing';
import { PropertyOwnersService } from './property-owners.service';

describe('PropertyOwnersService', () => {
  let service: PropertyOwnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyOwnersService],
    }).compile();

    service = module.get<PropertyOwnersService>(PropertyOwnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
