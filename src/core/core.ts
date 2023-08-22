import axios from "axios";
import { question, QuestionCategory, questionDifficulty, questionType } from "../typings/core";
import { log4js } from "amethystjs";

export const fetchQuestion = async<T extends questionType>(params?: { type?: T; difficulty?: questionDifficulty; category?: QuestionCategory; }): Promise<question<T> | 'no question'> => {
    return new Promise(async(resolve) => {
        if (!params) params = {}
        Object.keys(params).map(x => !params[x] ? delete params[x] : null);

        const options = {
            ...params
        }

        let url = `https://opentdb.com/api.php?amount=1`

        if (options.category) url+=`&category=${options.category}`
        if (options.difficulty) url+=`&difficulty=${options.difficulty}`
        if (options.type) url+=`&type=${options.type === 'Multiple Choice' ? 'multiple' : 'boolean'}`;

        const req = await axios.get(url).catch(log4js.trace)
        if (!req) return resolve('no question')

        const question = (req.data.results as question<T>[])[0]
        if (!question) return resolve('no question')
        resolve(question);
    })
}
export const getTime = (diff: questionDifficulty) => {
    const map: Record<questionDifficulty, number> = {
        easy: 80000,
        hard: 120000,
        medium: 100000
    }
    return map[diff];
}