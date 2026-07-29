import { Role } from "../../../generated/prisma/enums";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}
export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUpdateProfile {
  name?: string;
  phone?: string;
  oldPassword?: string;
  newPassword?: string;
}
