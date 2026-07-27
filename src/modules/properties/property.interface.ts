import { AvailabilityStatus } from "../../../generated/prisma/enums";
import { PropertyWhereInput } from "../../../generated/prisma/models";

export interface ICreateProperty {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sizeSqft?: number;
  address: string;
  city: string;
  division: string;
  country?: string;
  amenities: string[];
  images: string[];
  availabilityStatus?: AvailabilityStatus;
  categoryId: string;
}

export interface IPropertyQuery extends PropertyWhereInput {
  searchTerm?: string;
  minPrice?: string;
  maxPrice?: string;
  limit?: string;
  page?: string;
  sortOrder?: string;
  sortBy?: string;
}

export interface IUpdateProperty {
  title?: string;
  description?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqft?: number;
  address?: string;
  city?: string;
  division?: string;
  country?: string;
  amenities?: string[];
  images?: string[];
  availabilityStatus?: AvailabilityStatus;
  categoryId?: string;
}
