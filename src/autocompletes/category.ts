import { AutocompleteListener } from "amethystjs";
import { QuestionCategory } from '../typings/core'

export default new AutocompleteListener({
    commandName: [{commandName: 'question'}, { commandName: 'quizz' }],
    listenerName: 'category',
    run: ({ focusedValue }) => {
        const keys = Object.keys(QuestionCategory).filter(x => !(parseInt(x) >= 0));;
        return keys.filter(x => x.toLowerCase().includes(focusedValue.toLowerCase()) ||focusedValue.toLowerCase().includes(x.toLowerCase())).slice(0, 24).map(x => ({ name: x, value: QuestionCategory[x] }))
    }
})