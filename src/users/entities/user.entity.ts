import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { Exclude } from "class-transformer";

export class UserEntity implements User {

    // we want to use UserEntity as a return type in controller to cast results, so we need to define a constructur to be able to instantiate this class
    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial)
    }

    @ApiProperty()
    id: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    // ClassSerializerInterceptor picks ups these decorators to update object (in this case this field will be excluded
    @Exclude()
    password: string;
}
