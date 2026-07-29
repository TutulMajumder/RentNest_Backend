import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import {
  IAdminPropertiesQuery,
  IAdminRentalRequestQuery,
  IAdminUserQuery,
  IUpdateUserStatus,
} from "./admin.interface";
import {
  PropertyWhereInput,
  RentalRequestWhereInput,
  UserWhereInput,
} from "../../../generated/prisma/models";
import { AvailabilityStatus } from "../../../generated/prisma/enums";

const getAllUsersFromDB = async (query: IAdminUserQuery) => {
  const allowedSortFields = ["createdAt", "name", "role"];
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

  const andConditions: UserWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { email: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }
  if (query.role) {
    andConditions.push({ role: query.role });
  }
  if (query.status) {
    andConditions.push({ status: query.status });
  }

  const users = await prisma.user.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    omit: { password: true },
  });

  const totalUsers = await prisma.user.count({
    where: { AND: andConditions },
  });

  return {
    data: users,
    meta: {
      page: page,
      limit: limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

const updateUserStatusIntoDB = async (
  userId: string,
  payload: IUpdateUserStatus,
) => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (isUserExist.role === "ADMIN") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot change status of an admin account",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: payload.status },
    omit: { password: true },
  });

  return updatedUser;
};

const getAllPropertiesFromDB = async (query: IAdminPropertiesQuery) => {
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

const getAllRentalRequestsFromDB = async (query: IAdminRentalRequestQuery) => {
  const allowedSortBy = ["createdAt", "status", "moveInDate"];
  const allowedSortOrder = ["asc", "desc"];
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = allowedSortBy.includes(query.sortBy as string)
    ? (query.sortBy as string)
    : "createdAt";
  const sortOrder = allowedSortOrder.includes(query.sortOrder as string)
    ? (query.sortOrder as string)
    : "desc";

  const andConditions: RentalRequestWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      message: {
        contains: query.searchTerm,
        mode: "insensitive",
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  if (query.propertyId) {
    andConditions.push({ propertyId: query.propertyId });
  }

  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      property: { include: { category: true } },
      tenant: { omit: { password: true } },
    },
  });

  const rentalRequestCount = await prisma.rentalRequest.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    data: rentalRequests,
    meta: {
      limit,
      page,
      count: rentalRequestCount,
      totalPage: Math.ceil(rentalRequestCount / limit),
    },
  };
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllPropertiesFromDB,
  getAllRentalRequestsFromDB,
};
