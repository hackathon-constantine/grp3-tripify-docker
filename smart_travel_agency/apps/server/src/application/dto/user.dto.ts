import { IsEmail, IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional } from "class-validator";

import { UserRoles } from "@prisma/client"
export class UserDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRoles)
  @IsOptional()
  role: UserRoles;

  @IsString()
  password: string;
}
export class CreateUserDto{
    @IsEmail()
    email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRoles)
  @IsOptional()
  role: UserRoles;

  @IsString()
  password: string;

}