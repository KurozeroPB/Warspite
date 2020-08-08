import eris from "eris";

declare module "eris" {
    interface Role {
        higherThan(role2: Role): boolean;
    }

    interface User {
        tag: string;
    }

    interface Member {
        highestRole: Role | undefined;
        highestColoredRole: Role | undefined;
        tag: string;
    }
}
