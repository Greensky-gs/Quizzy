import { AmethystEvent } from "amethystjs";

export default new AmethystEvent('ready', (client) => {
    client.user.setActivity({
        name: 'Learning general culture'
    });
})