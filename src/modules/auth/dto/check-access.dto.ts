/* eslint-disable perfectionist/sort-modules */
import { IsArray, IsIn, IsOptional, IsString, Type, ValidateNested } from '@ecom-co/utils';

export type Logic = 'AND' | 'OR';

export class StringValueDto {
    @IsOptional()
    @IsString()
    value?: string;
}

export class ResourceRefDto {
    @IsOptional()
    @Type(() => StringValueDto)
    @ValidateNested()
    id?: null | StringValueDto;

    @IsOptional()
    @Type(() => StringValueDto)
    @ValidateNested()
    type?: null | StringValueDto;
}

export class PermissionGroupDto {
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    permissions: string[] = [];
}

export class CheckAccessRequestDto {
    @IsArray()
    @IsOptional()
    @Type(() => PermissionGroupDto)
    @ValidateNested({ each: true })
    groups?: PermissionGroupDto[];

    @IsIn(['AND', 'OR'])
    @IsOptional()
    logic?: Logic;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    permissions?: string[];

    @IsOptional()
    @Type(() => ResourceRefDto)
    @ValidateNested()
    resource?: ResourceRefDto;
}
