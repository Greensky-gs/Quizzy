import { Collection } from "discord.js";
import { Quizz } from "../structures/Quizz";

export const quizzes: Collection<string, Quizz> = new Collection();