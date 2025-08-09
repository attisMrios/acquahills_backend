export class CommonArea {
    id: number ;
    name: string ;      
    description: string ;
    createdAt: Date ;
    updatedAt: Date ;
    maximunCapacity: number ;
    peoplePerReservation: number ;
    unavailableDays: {
        weekDay: string;
        isFirstWorkingDay: boolean;
    }[];
    timeSlots: {
        startTime: string;
        endTime: string;
    }[];
}
