import { AvailabilityStatus } from "../../../generated/prisma/enums";

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
  landlordId: string;
  categoryId: string;
}
