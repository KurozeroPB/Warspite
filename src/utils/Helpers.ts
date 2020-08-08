import {
    Role,
    Member,
    User,
    Channel,
    GuildChannel,
    PrivateChannel
} from "eris";

/** Capitalize first character of string */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/** Sleep x amout of time */
export function sleep(ms: number): Promise<{}> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export function isGuildChannel(channel: Channel): channel is GuildChannel {
    if (channel instanceof GuildChannel) return true; // TextChannel, VoiceChannel, CategoryChannel, NewsChannel, StoreChannel
    else return false;
};

export function isDMChannel(channel: Channel): channel is PrivateChannel {
    if (channel instanceof PrivateChannel) return true;
    else return false;
};

/** Check if role is higher than role2 */
Role.prototype.higherThan = function(role2: Role): boolean {
    if (this.position === role2.position) {
        return (BigInt(role2.id) - BigInt(this.id)) > 0;
    } else {
        return (this.position - role2.position) > 0;
    }
};

/** Return highest role the member has */
Object.defineProperty(Member.prototype, "highestRole", {
    get: function(): Role | undefined {
        if (this.roles.length === 0) {
            /** Return default role if member has no roles */
            return this.guild.roles.get(this.guild.id);
        } else {
            const roleObjects = this.roles.map((roleID: string) => this.guild.roles.get(roleID));
            return roleObjects.reduce((prev: any, role: any) => !prev || role.higherThan(prev) ? role : prev);
        }
    }
});

/** Return highest colores role the member has */
Object.defineProperty(Member.prototype, "highestColoredRole", {
    get: function(): Role | undefined {
        if (this.roles.length === 0) {
            /** Return default role if member has no roles */
            return this.guild.roles.get(this.guild.id);
        } else {
            const roleObjects = this.roles.map((roleID: string) => this.guild.roles.get(roleID)!).filter((role: Role) => role.color);
            return roleObjects.reduce((prev: any, role: any) => !prev || role.higherThan(prev) ? role : prev);
        }
    }
});

Object.defineProperty(User.prototype, "tag", {
    get: function () {
        return `${this.username}#${this.discriminator}`;
    }
});

Object.defineProperty(Member.prototype, "tag", {
    get: function () {
        return `${this.username}#${this.discriminator}`;
    }
});
