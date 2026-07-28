import { AvailabilityStatus } from "../../../generated/prisma/enums";
import { PropertyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import {
  ICreateProperty,
  IPropertyQuery,
  IUpdateProperty,
} from "./property.interface";
import httpStatus from "http-status";

const createPropertyToDB = async (
  landlordId: string,
  payload: ICreateProperty,
) => {
  const isCategoryExist = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!isCategoryExist || !isCategoryExist.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found.");
  }

  const isDuplicate = await prisma.property.findFirst({
    where: {
      landlordId,
      categoryId: payload.title,
      address: payload.address,
    },
  });

  if (isDuplicate) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have a listing with this title and address",
    );
  }

  const property = await prisma.property.create({
    data: { ...payload, landlordId },
    include: {
      category: true,
      landlord: {
        omit: {
          password: true,
        },
      },
    },
  });
  return property;
};

const findAllPropertyFromDB = async (query: IPropertyQuery) => {
  const allowedSortFields = ["price", "sizeSqft", "createdAt", "bedrooms"];
  const allowedSortOrders = ["asc", "desc"];

  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = allowedSortFields.includes(query.sortBy as string)
    ? (query.sortBy as string)
    : "createdAt";
  const sortOrder = allowedSortOrders.includes(query.sortOrder as string)
    ? (query.sortOrder as string)
    : "desc";

  const amenities = query.amenities
    ? JSON.parse(query.amenities as string)
    : null;
  const amenitiesArray = Array.isArray(amenities) ? amenities : [];

  const andConditions: PropertyWhereInput[] = [];
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        ...(query.minPrice && { gte: Number(query.minPrice) }),
        ...(query.maxPrice && { lte: Number(query.maxPrice) }),
      },
    });
  }
  if (query.bedrooms) {
    andConditions.push({
      bedrooms: Number(query.bedrooms),
    });
  }
  if (query.bathrooms) {
    andConditions.push({
      bathrooms: Number(query.bathrooms),
    });
  }
  if (query.sizeSqft) {
    andConditions.push({
      sizeSqft: Number(query.sizeSqft),
    });
  }

  if (query.city) {
    andConditions.push({
      city: query.city,
    });
  }

  if (query.division) {
    andConditions.push({
      division: query.division,
    });
  }
  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }
  if (query.amenities) {
    andConditions.push({
      amenities: {
        hasSome: amenitiesArray,
      },
    });
  }
  if (query.availabilityStatus) {
    andConditions.push({
      availabilityStatus: query.availabilityStatus as AvailabilityStatus,
    });
  }

  const properties = await prisma.property.findMany({
    where: {
      isActive: true,
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      landlord: {
        omit: {
          password: true,
        },
      },
    },
  });

  const totalPropertyCount = await prisma.property.count({
    where: {
      isActive: true,
      AND: andConditions,
    },
  });

  return {
    data: properties,
    meta: {
      page: page,
      limit: limit,
      total: totalPropertyCount,
      totalPage: Math.ceil(totalPropertyCount / limit),
    },
  };
};

const findPropertyByIdFromDB = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isActive: true },
    include: {
      landlord: {
        omit: {
          password: true,
        },
      },
      category: true,
    },
  });

  if (!property || !property.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Property is not found");
  }

  return property;
};

const updateProperty = async (
  propertyId: string,
  payload: IUpdateProperty,
  landlordId: string,
) => {
  const isPropertyExist = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!isPropertyExist || !isPropertyExist.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Property is not found");
  }

  if (isPropertyExist.landlordId !== landlordId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this property",
    );
  }

  if (payload.categoryId) {
    const isCategoryExist = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!isCategoryExist || !isCategoryExist.isActive) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }
  }
  const property = await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: {
      landlord: {
        omit: { password: true },
      },
      category: true,
    },
  });

  return property;
};

const deleteProperty = async (propertyId: string, landlordId: string) => {
  const isPropertyExist = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!isPropertyExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }
  if (!isPropertyExist.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Property is already deleted");
  }

  if (isPropertyExist.landlordId !== landlordId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to delete this property",
    );
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { isActive: false },
  });

  return null;
};
export const propertyService = {
  createPropertyToDB,
  findAllPropertyFromDB,
  findPropertyByIdFromDB,
  updateProperty,
  deleteProperty,
};
