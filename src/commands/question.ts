import { AmethystCommand, log4js, waitForInteraction } from "amethystjs";
import { ApplicationCommandOptionType, ComponentType, Message } from "discord.js";
import { QuestionCategory, questionDifficulty, questionType } from "../typings/core";
import { button, capitalize, resize, row, shuffleArray } from "../core/toolbox";
import { fetchQuestion, getTime } from "../core/core";
import { askQuestion, invalidAnswer, noQuestion, validAnswer } from "../contents/embeds";
import { decode } from 'he';

export default new AmethystCommand({
    name: 'question',
    description: "Ask the bot for a question",
    options: [
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
    ]
}).setChatInputRun(async({ interaction, options }) => {
    const difficulty = options.getString('difficulty') as questionDifficulty;
    const category = options.getInteger('category') as QuestionCategory;
    const type = options.getString('type') as questionType;

    const msg = await interaction.deferReply({ fetchReply: true }).catch(log4js.trace) as Message<true>;
    if (!msg) return;

    const question = await fetchQuestion({
        type,
        category,
        difficulty
    });

    if (!question || question === 'no question') return interaction.editReply({
        embeds: [noQuestion(interaction.user)]
    }).catch(log4js.trace)

    const answers = [question.correct_answer, ...question.incorrect_answers];
    const shuffled = shuffleArray(answers);

    const components = row(...shuffled.map((x, i) => button({ label: resize(decode(x)), custom: i.toString(), style: 'Primary' })))

    const time = getTime(question.difficulty);
    const endsAt = time + Date.now();

    interaction.editReply({
        components: [components],
        embeds: [askQuestion(interaction.user, question, endsAt)]
    }).catch(log4js.trace)

    const rep = await waitForInteraction({
        message: msg,
        time,
        componentType: ComponentType.Button,
        user: interaction.user
    }).catch(log4js.trace);

    if (!rep) return interaction.editReply({
        embeds: [invalidAnswer(interaction.user, question)],
        components: []
    }).catch(log4js.trace)
    
    const isValid = (() => {
        const choosen = shuffled[parseInt(rep.customId)];
        if (choosen !== question.correct_answer) return false;
        return true
    })();

    interaction.editReply({
        embeds: [(isValid ? validAnswer : invalidAnswer)(interaction.user, question)],
        components: []
    }).catch(log4js.trace)
})