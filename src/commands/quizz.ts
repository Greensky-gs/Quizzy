import { AmethystCommand, log4js, preconditions, waitForInteraction } from "amethystjs";
import { ApplicationCommandOptionType, ComponentType, Message, User } from "discord.js";
import { QuestionCategory, questionDifficulty, questionType } from "../typings/core";
import { button, capitalize, isMatchmaking, isPlaying, matchmake, row, unmatchmake } from "../core/toolbox";
import { base, cancel, lookForPeople, matchmaking, playing } from "../contents/embeds";
import { Quizz } from "../structures/Quizz";
import { quizzes } from "../cache/quizz";

export default new AmethystCommand({
    name: 'quizz',
    description: "Play a quizz with some friends",
    options: [
        {
            name: 'rounds',
            description: "Number of rounds you want to do",
            required: true,
            minValue: 1,
            maxValue: 20,
            type: ApplicationCommandOptionType.Integer
        },
        {
            name: 'players',
            description: "Number of players you want to play with",
            required: false,
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            maxValue: 9
        },
        {
            name: 'difficulty',
            description: "Difficulty of the question",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: ['easy', 'medium', 'hard'].map(x => ({ name: capitalize(x), value: x }))
        },
        {
            name: 'category',
            description: "Category of the question",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            autocomplete: true
        },
        {
            name: 'type',
            description: "Type of the question",
            required: false,
            choices: [
                {
                    name: 'Multiple choice',
                    value: "Multiple Choice"
                },
                {
                    name: 'True/False',
                    value: 'boolean'
                }
            ],
            type: ApplicationCommandOptionType.String
        }
    ],
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async({ interaction, options }) => {
    const difficulty = options.getString('difficulty') as questionDifficulty;
    const category = options.getInteger('category') as QuestionCategory;
    const type = options.getString('type') as questionType;
    const rounds = options.getInteger('rounds')
    const players = options.getInteger('players') ?? 3;

    let list: User[] = [];
    
    const startsAt = Date.now() + 300000;

    const components = () => {
        return [row(button({ label: 'I play!', style: 'Primary', custom: 'quizz.play' }), button({ label: 'Actually, no', style: 'Secondary', custom: 'quizz.resign' }), button({ label: "Nevermind, we're not playing", style: 'Danger', custom: 'quizz.cancel' }), button({ label: "Let's start", style: 'Success', custom: 'quizz.start', disabled: list.length === 0 }))]
    }
    const msg = await interaction.reply({
        embeds: [ lookForPeople(interaction.user, list, startsAt) ],
        components: components(),
        fetchReply: true
    }).catch(log4js.trace)

    if (!msg) return;

    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000
    });
    matchmake(interaction);

    collector.on('collect', async(ctx) => {
        const isHost = ctx.user.id === interaction.user.id;
        if (ctx.customId === 'quizz.cancel') {
            if (!isHost) {
                ctx.reply({
                    content: ":x: | You can't do that",
                    ephemeral: true
                }).catch(log4js.trace)
                return
            }
            const res = await ctx.reply({
                content: "Are you sure ?",
                components: [row(button({ label: 'Yes, cancel', style: 'Danger', custom: 'quizz.stop' }), button({ label: "I changed my mind, carry on", style: 'Primary', custom: 'quizz.resume' }))],
                fetchReply: true
            }).catch(log4js.trace) as Message<true>

            if (!res) return;
            const rep = await waitForInteraction({
                componentType: ComponentType.Button,
                user: ctx.user,
                message: res
            }).catch(log4js.trace)

            if (!rep || rep.customId === 'quizz.resume') {
                ctx.deleteReply().catch(log4js.trace);
                return;
            }

            await ctx.deleteReply().catch(log4js.trace)
            interaction.editReply({
                embeds: [ cancel()],
                components: []
            }).catch(log4js.trace)
            collector.stop('canceled')
        }
        if (ctx.customId === 'quizz.start') {
            if (!isHost) {
                ctx.reply({
                    content: ":x: | You can't do that",
                    ephemeral: true
                }).catch(log4js.trace)
                return
            }

            await ctx.deferUpdate();
            await interaction.editReply({
                components: []
            }).catch(log4js.trace)
            collector.stop('start')
        }
        if (ctx.customId === 'quizz.play') {
            if (isPlaying(ctx)) {
                ctx.reply({
                    embeds: [ playing(ctx.user) ],
                    ephemeral: true
                }).catch(log4js.trace)
                return;
            }
            if (isMatchmaking(ctx)) {
                ctx.reply({
                    embeds: [ matchmaking(ctx.user) ],
                    ephemeral: true
                }).catch(log4js.trace)
                return;
            }
            if (list.find(x => x.id === ctx.user.id) || isHost) {
                ctx.reply({
                    content: ":x: | You are already participating",
                    ephemeral: true
                }).catch(log4js.trace)
                return
            }
            list.push(ctx.user);
            ctx.deferUpdate().catch(log4js.trace)

            matchmake(ctx);

            if (list.length === players) {
                collector.stop('start')
            } else {
                interaction.editReply({
                    embeds: [ lookForPeople(interaction.user, list, startsAt) ],
                    components: components()
                }).catch(log4js.trace)
            }
        }
        if (ctx.customId === 'quizz.resign') {
            if (!list.find(x => x.id === ctx.user.id) || !isHost)  {
                ctx.reply({
                    content: `:x: | You are not participating to this quizz`,
                    ephemeral: true
                }).catch(log4js.trace)
                return
            }

            list = list.filter(x => x.id !== ctx.user.id);
            ctx.deferUpdate().catch(log4js.trace)

            unmatchmake(ctx);

            interaction.editReply({
                embeds: [ lookForPeople(interaction.user, list, startsAt) ],
                components: components()
            }).catch(log4js.trace)
        }
    });

    collector.on('end', (_c, reason) => {
        [...list, interaction].map(unmatchmake);
        if (reason === 'canceled') {
            interaction.editReply({
                embeds: [ cancel() ],
                components: []
            }).catch(log4js.trace);
            return
        }
        if (list.length === 0) {
            interaction.editReply({
                embeds: [base(interaction.user).setTitle("Not enough participants").setDescription(`There is not enough participants to start the quizz`).setColor('#C77B57') ],
                components: []
            }).catch(log4js.trace);
            return
        }

        const quizz = new Quizz({
            interaction,
            players: [interaction.user, ...list],
            rounds,
            category,
            difficulty,
            type,
            host: interaction.user
        })
        quizzes.set(interaction.user.id, quizz);
    })
})