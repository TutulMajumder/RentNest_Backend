import { ActiveStatus } from "../../../generated/prisma/enums";
import {
  PropertyWhereInput,
  RentalRequestWhereInput,
  UserWhereInput,
} from "../../../generated/prisma/models";

export interface IUpdateUserStatus {
  status: ActiveStatus;
}

export interface IAdminUserQuery extends UserWhereInput {
  limit?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
}
export interface IAdminPropertiesQuery extends PropertyWhereInput {
  limit?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface IAdminRentalRequestQuery extends RentalRequestWhereInput {
  limit?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
}
