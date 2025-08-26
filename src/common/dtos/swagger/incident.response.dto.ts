import { ApiProperty } from '@nestjs/swagger';
import { IncidentPriority, IncidentStatus, IncidentType } from '../inputs/incident.input.dto';

export class VehicleDataResponseDto {
  @ApiProperty()
  vehicleCode: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  vehicleType: string;

  @ApiProperty()
  color: string;
}

export class IncidentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: IncidentType })
  type: IncidentType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: IncidentStatus })
  status: IncidentStatus;

  @ApiProperty({ enum: IncidentPriority })
  priority: IncidentPriority;

  @ApiProperty()
  reportedBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: 'object', additionalProperties: true })
  incidentData?: any;
}

export class IncidentListResponseDto {
  @ApiProperty({ type: IncidentResponseDto, isArray: true })
  data: IncidentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class CreateIncidentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: {
    id: string;
    incident: IncidentResponseDto;
  };
}
