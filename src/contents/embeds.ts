import { EmbedBuilder, User } from "discord.js";
import { QuestionCategory, question, questionType } from "../typings/core";
import { capitalize, resize } from "../core/toolbox";
import { Player } from '../structures/Quizz';
import { decode } from 'he';

export const base = (user: User) => new EmbedBuilder().setTimestamp().setFooter({ text: user.username, iconURL: user.displayAvatarURL({ forceStatic: false }) })

export const askQuestion = (user: User, question: question<questionType>, endsAt: number, round?: number) => base(user).setFooter({ text: capitalize(question.difficulty), iconURL: user.displayAvatarURL({ forceStatic: false }) }).setColor('#9BF48D').setAuthor({ name: resize(!!round ? `round ${round} | ${question.category}` : question.category, 256)  }).setDescription(`### ${decode(question.question)}\n\nAnswer before <t:${Math.floor(endsAt / 1000)}:R>`)
export const noQuestion = (user: User) => base(user).setTitle("No question").setDescription(`No question found`)
export const invalidAnswer = (user: User, question: question<questionType>) => base(user).setColor('#411B56').setTitle("Wrong!").setDescription(`The answer was **${question.correct_answer}**`)
export const validAnswer = (user: User, question: question<questionType>) => base(user).setTitle("Correct answer!").setDescription(`You're right, the answer was indeed **${question.correct_answer}**`).setColor('#1DB0A3')
export const quizzEnd = (list: Player[]) => {
    const sorted = list.sort((a, b) => b.points - a.points);
    return base(sorted[0].user).setColor('#F08822').setTitle("Quizz results").setDescription(`Here are the top players:\n\n${sorted.map((x, i) => `**${i + 1})** <@${x.user.id}> ( ${x.points}  )`).join('\n')}`)
}
export const lookForPeople = (user: User, list: User[], startsAt: number) => base(user).setColor("#EEBAD0").setTitle("Quizz").setDescription(`<@${user.id}> is starting a quizz.\nWho plays ? Get in, it starts <t:${Math.floor(startsAt / 1000)}:R>`).addFields({
        name: 'Players',
        value: [user, ...list].map(x => `<@${x.id}>`).join(' ')
    })

export const baseDenied = (user: User) => base(user).setColor('#C77B57')
export const cancel = () => new EmbedBuilder().setTitle("Canceled").setColor('#73A0CA')
export const matchmaking = (user: User) => baseDenied(user).setTitle("Matchmaking").setDescription(`You already are looking for a quizz`)
export const playing = (user: User) => baseDenied(user).setTitle("Playing").setDescription(`You are already playing a quizz`)