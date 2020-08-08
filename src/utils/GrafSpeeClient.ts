import AzurLane from "azurlane";
import Command from "./Command";
import Logger from "./Logger";
import Collection from "./Collection";
import settings from "../../settings";
import { Client, ClientOptions, Guild } from "eris";

export default class GrafSpee extends Client {
    public commands: Collection<Command> = new Collection();
    public logger: Logger;
    public prefix: string;
    public azurlane: AzurLane = new AzurLane({
        userAgent: `GrafSpee/${settings.version}`,
        token: settings.tokens.azurlane
    });

    public constructor(token: string, options?: ClientOptions) {
        super(token, options);

        this.logger = new Logger();
        this.prefix = settings.env === "production" ? settings.prefix.production : settings.prefix.development
    }

    embedColor(guild?: Guild): number {
        if (!guild)  return settings.colors.default;
        const selfMember = guild.members.get(this.user.id)!
        const role = selfMember.highestColoredRole;
        return role ? role.color : settings.colors.default;
    }
}
