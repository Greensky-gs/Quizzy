import { CommandInteraction, ComponentType, Message, User } from "discord.js";
import { question, questionType, quizzOptions } from "../typings/core";
import { fetchQuestion, getTime } from "../core/core";
import { log4js, wait, waitForInteraction } from "amethystjs";
import { askQuestion, invalidAnswer, quizzEnd, validAnswer } from "../contents/embeds";
import { shuffleArray, row, button, resize } from "../core/toolbox";
import { quizzes } from "../cache/quizz";
import { decode } from 'he';

export class Player {
    private _user: User;
    private _points = 0

    constructor(user: User) {
        this._user = user;
    }
    public get user() {
        return this._user
    }
    public get points() {
        return this._points
    }
    public add(int: number) {
        this._points += int
    }
    public remove(int: number) {
        this._points -= int;
    }
}
export class Quizz {
    private options: quizzOptions;
    private interaction: CommandInteraction;
    private index = 0;
    private _players: Player[] = []
    private question: question<questionType>;
    private message: Message<true>
    private round = 0;

    constructor(options: quizzOptions) {
        this.options = options;
        this.interaction = options.interaction
        this._players = this.options.players.map(x => new Player(x));

        this.start();
    }

    public get current() {
        return this._players[this.index % this._players.length];
    }
    public get players() {
        return this._players;
    }

    private async fetch() {
        const question = await fetchQuestion({
            category: this.options.category,
            type: this.options.type,
            difficulty: this.options.difficulty
        }).catch(log4js.trace);

        if (!question || question === 'no question') return undefined;
        this.question = question;
        return question;
    }
    private async edit() {
        const ques = await this.fetch()
        if (!ques) return;

        const time = getTime(this.question.difficulty);
        const endsAt = Date.now() + time;

        const answers = [this.question.correct_answer, ...this.question.incorrect_answers];
        const shuffled = shuffleArray(answers);
    
        const components = row(...shuffled.map((x, i) => button({ label: resize(decode(x)), custom: i.toString(), style: 'Primary' })))

        this.interaction.editReply({
            embeds: [ askQuestion(this.current.user, this.question, endsAt, this.round + 1) ],
            components: [components],
            content: `<@${this.current.user.id}>`
        }).catch(log4js.trace);

        const rep = await waitForInteraction({
            message: this.message,
            time,
            componentType: ComponentType.Button,
            user: this.current.user
        }).catch(log4js.trace);
    
        if (!rep) return this.interaction.editReply({
            embeds: [invalidAnswer(this.current.user, this.question)],
            components: []
        }).catch(log4js.trace)
        
        const isValid = (() => {
            const choosen = shuffled[parseInt(rep.customId)];
            if (choosen !== this.question.correct_answer) return false;
            return true
        })();
    
        if (rep) rep.deferUpdate().catch(log4js.trace);
        this.interaction.editReply({
            embeds: [(isValid ? validAnswer : invalidAnswer)(this.current.user, this.question)],
            components: []
        }).catch(log4js.trace)

        if (isValid) {
            this.current.add(1);
        }

        this.index++;
        if (this.index % this._players.length === 0) {
            this.round++;
        }

        if (this.round === this.options.rounds) {
            this.end();
        } else {
            await wait(2500);
            this.edit();
        }
    }
    private async end() {
        quizzes.delete(this.options.host.id);
        this.interaction.editReply({
            components: [],
            embeds: [quizzEnd(this._players)]
        }).catch(log4js.trace)
    }
    private async start() {
        const message = await this.interaction.fetchReply().catch(log4js.trace) as Message<true>
        if (!message) return;

        this.message = message;

        this.edit();
    }
}