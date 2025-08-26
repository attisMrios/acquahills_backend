import { CommonArea } from "@prisma/client";

export class TypeCommonArea {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    commonAreas: CommonArea[];
}
