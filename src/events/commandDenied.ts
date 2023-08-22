import { AmethystEvent, commandDeniedCode, log4js } from "amethystjs";
import { baseDenied } from '../contents/embeds'

export default new AmethystEvent('commandDenied', (command, reason) => {
    if (command.interaction?.isCommand()) {
        if (reason.code === commandDeniedCode.GuildOnly) {
            command.interaction.reply({
                embeds: [ baseDenied(command.user).setTitle("Guild only").setDescription(`You cannot run this command in direct messages`) ]
            }).catch(log4js.trace)
        }
    }
})