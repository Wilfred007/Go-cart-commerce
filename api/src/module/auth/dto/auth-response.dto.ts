import { Role } from "../../../../../generated/prisma"







export class AuthResponseDTO {
    accessToken: string
    refreshToken: string
    user: {
        id: string,
        email: string,
        firstName: string | null,
        lastName: string | null,
        role: Role
    }
}