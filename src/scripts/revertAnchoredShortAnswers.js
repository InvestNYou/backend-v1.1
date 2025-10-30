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

function isAnchoredShortAnswer(q) {
	if (!q || typeof q !== 'object') return false;
	if ((q.type || '').toLowerCase() !== 'short_answer') return false;
	const text = String(q.question || '');
	const expl = String(q.explanation || '');
	if (expl.includes('Anchored to lesson content') || expl.includes('Grounded in lesson content')) return true;
	if (/^\s*In\s*1[–-]?2\s*sentences,/i.test(text)) return true;
	if (/Based on the lesson\s*"/i.test(text)) return true;
	if (/in the context of/i.test(text)) return true;
	return false;
}

async function revertAll() {
	const quizzes = await prisma.quiz.findMany({});
	let updated = 0;
	let removedCount = 0;
	for (const quiz of quizzes) {
		const before = coerceQuestions(quiz.questions);
		if (!Array.isArray(before)) continue;
		const after = before.filter((q) => !isAnchoredShortAnswer(q));
		const removed = before.length - after.length;
		if (removed > 0) {
			await prisma.quiz.update({ where: { id: quiz.id }, data: { questions: after } });
			updated++;
			removedCount += removed;
		}
	}
	return { updated, removedCount };
}

async function main() {
	console.log('⏪ Removing anchored short-answer questions...');
	const res = await revertAll();
	console.log(`✅ Done. Quizzes updated: ${res.updated}, questions removed: ${res.removedCount}`);
}

main()
	.catch((e) => {
		console.error('❌ Revert failed:', e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
