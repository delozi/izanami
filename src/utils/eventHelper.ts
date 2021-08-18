import {
    Channel,
    TextChannel,
    Message,
    MessageEmbed,
    Client,
} from "discord.js";
import { EVENT_CHANNEL, EVENT_CLIENT_ROLE, SERVER } from "../config";

class EventHelper {
    eventData: Event[];

    client: Client;

    eventChannel: TextChannel | undefined;

    constructor(client: Client) {
        this.eventData = [];
        this.client = client;
        this.eventChannel = this.getEventChannel();
    }

    addEvent(
        msg: Message,
        date: Date,
        embed: MessageEmbed,
        reschedule = false
    ): void {
        const etaMS = date.getTime() - Date.now();
        const timeout = setTimeout(() => {
            embed.setTitle("Event Started");
            if (this.eventChannel) {
                this.eventChannel.send(`<@&${EVENT_CLIENT_ROLE}>`);
                this.eventChannel.send({ embed });
            }
        }, etaMS);
        const { id } = msg.author;
        this.eventData.push({ timeout, embed, title: embed.title, host: id });
        if (reschedule) {
            embed.setTitle("Event Rescheduled");
        }
        if (this.eventChannel) {
            this.eventChannel.send(`<@&${EVENT_CLIENT_ROLE}>`);
            this.eventChannel.send({ embed });
        }
    }

    cancelEvent(msg: Message, verbose = true): void {
        const events = this.eventData.filter(
            (evnt) => evnt.host === msg.author.id
        );
        events.forEach((event) => {
            if (event?.timeout) {
                clearTimeout(event.timeout);
                this.eventData = [];
                if (this.eventChannel instanceof TextChannel) {
                    const showName = event.embed.fields.find(
                        (fld) => fld.name === "Show"
                    )?.value;
                    if (showName && verbose) {
                        this.eventChannel.send(`<@&${EVENT_CLIENT_ROLE}>`);

                        const cancelEmbed = new MessageEmbed()
                            .setTitle(`Event Cancelled`)
                            .setColor("#CF574C")
                            .addField("Show", showName)
                            .addField("Host", `<@${event.host}>`);
                        this.eventChannel.send({ embed: cancelEmbed });
                    }
                }
            }
        });
    }

    rescheduleEvent(msg: Message, date: Date, embed: MessageEmbed): void {
        this.cancelEvent(msg, false);
        this.addEvent(msg, date, embed, true);
    }

    reallocateEvent(msg: Message, date: Date, embed: MessageEmbed): void {
        const etaMS = date.getTime() - Date.now();
        const timeout = setTimeout(() => {
            embed.setTitle("Event Started");
            if (this.eventChannel) {
                this.eventChannel.send(`<@&${EVENT_CLIENT_ROLE}>`);
                this.eventChannel.send({ embed });
            }
        }, etaMS);
        const { id } = msg.author;
        this.eventData.push({ timeout, embed, title: embed.title, host: id });
    }

    getEventChannel(): TextChannel | undefined {
        const ourServer = this.client.guilds.cache.get(SERVER);
        const eventChannel: Channel | undefined =
            ourServer?.channels.cache.get(EVENT_CHANNEL);
        if (eventChannel instanceof TextChannel) {
            return eventChannel as TextChannel;
        }
        return undefined;
    }
}

export default EventHelper;