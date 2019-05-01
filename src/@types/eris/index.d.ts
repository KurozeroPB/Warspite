declare module "eris" {
    interface Role {
        higherThan(role2: Role): boolean
    }

    interface Member {
        highestRole: Role | undefined
        highestColoredRole: Role | undefined
    }
}
