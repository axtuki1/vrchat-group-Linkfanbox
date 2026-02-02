import { ButtonStyle, AnySelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, BaseSelectMenuBuilder, ChannelSelectMenuBuilder, UserSelectMenuBuilder, MentionableSelectMenuBuilder, RoleSelectMenuBuilder } from "discord.js";
import { Interaction } from "./interaction";

export abstract class SelectMenu extends Interaction {
    public abstract customId: string;
    public abstract placeholder: string;
    public required: boolean = false;
    public maxValues: number = 1;
    public minValues: number = 1;

    public abstract execute(interaction: AnySelectMenuInteraction): Promise<void>;

    public abstract options(): Array<SelectMenuOption>;

    public getButtonComponent(
        menu: StringSelectMenuBuilder | ChannelSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder
    ): StringSelectMenuBuilder | ChannelSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder {
        const options = this.options().map(option => {
            return {
                label: option.label,
                description: option.description,
                value: option.value,
                emoji: option.emoji,
                default: option.default,
            };
        });

        menu.setCustomId(this.customId)
            .setPlaceholder(this.placeholder)
            .setRequired(this.required)
            .setMaxValues(this.maxValues)
            .setMinValues(this.minValues);

        if(menu instanceof StringSelectMenuBuilder) {
            menu.addOptions(options);
        }
        
        return menu;
    }
}

export interface SelectMenuOption {
    label: string;
    description?: string;
    value: string;
    emoji?: string;
    default?: boolean;
}