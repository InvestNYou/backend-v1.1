const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function coerceQuestions(questions) {
	if (Array.isArray(questions)) return questions;
	if (typeof questions === 'string') {
		try {
			const parsed = JSON.parse(questions);
			return Array.isArray(parsed) ? parsed : questions;
		} catch (_) {
			return questions;
	}
	}
	return questions;
}

function convertTrueFalseToMC(q) {
	if (!q || typeof q !== 'object') return q;
	const t = (q.type || '').toLowerCase();
	if (t !== 'true_false') return q;
	const answerBool = typeof q.correctAnswer === 'boolean' ? q.correctAnswer : String(q.correctAnswer).toLowerCase() === 'true';
	return {
		...q,
		type: 'multiple_choice',
		options: ['True', 'False'],
		correctAnswer: answerBool ? 0 : 1
	};
}

function ensureAtLeastOneShortAnswer(questions, quizTitle) {
	const hasShort = questions.some((q) => (q?.type || '').toLowerCase() === 'short_answer');
	if (hasShort) return questions;
	const nextId = (questions.reduce((m, q) => Math.max(m, q?.id || 0), 0) || 0) + 1;
	const prompt = 'In 1-2 sentences, summarize the most important idea from this quiz.';
	return [
		...questions,
		{
			id: nextId,
			type: 'short_answer',
			question: prompt,
			correctAnswer: 'Answers will vary, but should concisely state the primary concept in their own words.',
			explanation: `Short reflection to reinforce learning for ${quizTitle || 'this lesson'}.`
		}
	];
}

function normalizeQuestions(questions, quizTitle) {
	const list = coerceQuestions(questions);
	if (!Array.isArray(list)) return list;
	const converted = list.map((q) => convertTrueFalseToMC(q));
	return ensureAtLeastOneShortAnswer(converted, quizTitle);
}

async function normalizeAllQuizzes() {
	const quizzes = await prisma.quiz.findMany({});
	let updated = 0;
	let tfConverted = 0;
	let shortAdded = 0;
	for (const quiz of quizzes) {
		const before = coerceQuestions(quiz.questions);
		const after = normalizeQuestions(quiz.questions, quiz.title);
		if (Array.isArray(before) && Array.isArray(after)) {
			const beforeTF = before.filter((q) => (q?.type || '').toLowerCase() === 'true_false').length;
			const afterShort = after.filter((q) => (q?.type || '').toLowerCase() === 'short_answer').length;
			const beforeShort = before.filter((q) => (q?.type || '').toLowerCase() === 'short_answer').length;
			if (JSON.stringify(after) !== JSON.stringify(quiz.questions)) {
				await prisma.quiz.update({ where: { id: quiz.id }, data: { questions: after } });
				updated++;
				if (beforeTF > 0) tfConverted += beforeTF;
				if (afterShort > beforeShort) shortAdded += (afterShort - beforeShort);
			}
		}
	}
	return { updated, tfConverted, shortAdded };
}

async function main() {
	console.log('🔧 Normalizing quizzes: convert true/false to multiple choice and ensure short-answer...');
	const res = await normalizeAllQuizzes();
	console.log(`✅ Done. Quizzes updated: ${res.updated}, true/false converted: ${res.tfConverted}, short_answer added: ${res.shortAdded}`);
}

main()
	.catch((e) => {
		console.error('❌ Normalization failed:', e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
