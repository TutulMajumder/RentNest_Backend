import { RentalStatus } from "../../../generated/prisma/enums";
import { RentalRequestWhereInput } from "../../../generated/prisma/models";

export interface ICreateRentalRequest {
  propertyId: string;
  moveInDate: Date;
  moveOutDate?: Date;
  message?: string;
}
export interface IRentalRequestQuery extends RentalRequestWhereInput {
  limit?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
}
export interface IUpdateRentalRequestStatus {
  status: RentalStatus;
}
