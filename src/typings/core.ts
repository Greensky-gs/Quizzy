import { BaseInteraction, CommandInteraction, Interaction, User } from "discord.js";

export type questionDifficulty = 'easy' | 'medium' | 'hard'
export type questionType = 'Multiple Choice' | 'boolean'
export type booleanAnswer = 'True' | 'False'
export enum QuestionCategory {
  'General Knowledge' = 9,
  'Entertainment: Books' = 10,
  'Entertainment: Film' = 11,
  'Entertainment: Music' = 12,
  'Entertainment: Musicals & Theatres' = 13,
  'Entertainment: Television' = 14,
  'Entertainment: Video Games' = 15,
  'Entertainment: Board Games' = 16,
  'Science & Nature' = 17,
  'Science: Computers' = 18,
  'Science: Mathematics' = 19,
  'Mythology' = 20,
  'Sports' = 21,
  'Geography' = 22,
  'History' = 23,
  'Politics' = 24,
  'Art' = 25,
  'Celebrities' = 26,
  'Animals' = 27,
  'Vehicles' = 28,
  'Entertainment: Comics' = 29,
  'Science: Gadgets' = 30,
  'Entertainment: Japanese Anime & Manga' = 31,
  'Entertainment: Cartoon & Animations' = 32
}
export type categoryName = keyof typeof QuestionCategory;

type answerType<T extends questionType> = T extends 'Multiple Choice' ? string : booleanAnswer;
export type question<T extends questionType> = {
    category: categoryName;
    difficulty: questionDifficulty;
    type: T;
    correct_answer: answerType<T>;
    incorrect_answers: answerType<T>[];
    question: string;
}
export type quizzOptions = {
	players: User[];
	difficulty?: questionDifficulty;
	type?: questionType;
	category?: QuestionCategory;
	interaction: CommandInteraction;
  rounds: number;
  host: User;
}
export type userResolvable = User | BaseInteraction;