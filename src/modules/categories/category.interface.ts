import { CategoryWhereInput } from "../../../generated/prisma/models";

export interface ICreateCategory {
  name: string;
  description?: string;
}

export interface ICategoryQuery extends CategoryWhereInput {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
  includeInactive?: string;
}

export interface IUpdateCategory {
  name?: string;
  description?: string;
  isActive?: boolean;
}
