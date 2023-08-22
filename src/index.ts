import { AmethystClient } from "amethystjs";
import { config } from "dotenv";
config()

const client = new AmethystClient({
    intents: []
}, {
    token: process.env.token,
    debug: true,
    commandsFolder: './dist/commands',
    preconditionsFolder: './dist/preconditions',
    autocompleteListenersFolder: './dist/autocompletes',
    buttonsFolder: './dist/buttons',
    eventsFolder: './dist/events'
})

client.start({});