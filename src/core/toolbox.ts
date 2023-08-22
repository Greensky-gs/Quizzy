import { ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, ButtonStyle, User} from "discord.js";
import { userResolvable } from "../typings/core";
import { matchmakings } from "../cache/matchmakings";
import { quizzes } from "../cache/quizz";

export const capitalize = (str: string | number) => {
    str = typeof str === 'string' ? str : str.toString();
    return str[0].toUpperCase() + str.slice(1);
}
export const row = <C extends AnyComponentBuilder>(...components: C[]): ActionRowBuilder<C> => {
    return new ActionRowBuilder().setComponents(components) as ActionRowBuilder<C>;
}
export const shuffleArray = <T>(arr: T[]): T[] =>
    arr
        .map((value) => [Math.random(), value] as any[])
        .sort(([a], [b]) => a - b)
        .map((entry) => entry[1]);
export const button = ({
    style,
    label,
    url,
    disabled,
    emoji,
    custom
}: {
    label?: string;
    style: keyof typeof ButtonStyle;
    custom?: string;
    url?: string;
    disabled?: boolean;
    emoji?: string;
}) => {
    const btn = new ButtonBuilder().setStyle(ButtonStyle[style]);

    if (label) btn.setLabel(label);
    if (url) btn.setURL(url);
    if (disabled != undefined) btn.setDisabled(disabled);
    if (emoji) btn.setEmoji(emoji);
    if (custom) btn.setCustomId(custom);

    return btn;
};
export const resize = (str: string, length = 50) => {
    if (str.length <= length) return str;
    return str.slice(0, length - 3) + '...';
};
const getUser = (user: userResolvable): User => user instanceof User ? user : user.user;
export const isMatchmaking = (user: userResolvable) => matchmakings.has(getUser(user).id);
export const isPlaying = (user: userResolvable) => !!quizzes.find(x => x.players.find(y => y.user.id === getUser(user).id))
export const matchmake = (user: userResolvable) => matchmakings.set(getUser(user).id, getUser(user));
export const unmatchmake = (user: userResolvable) => matchmakings.delete(getUser(user).id);