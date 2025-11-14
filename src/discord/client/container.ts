import { ContainerBuilder } from "discord.js";

export abstract class Container {
    public abstract render(userSettings?): ContainerBuilder;
}