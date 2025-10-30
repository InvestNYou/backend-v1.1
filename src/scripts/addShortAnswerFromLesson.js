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

function stripMarkdown(input) {
	if (typeof input !== 'string') return input;
	let s = input;
	s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
	s = s.replace(/\*([^*]+)\*/g, '$1');
	s = s.replace(/__([^_]+)__/g, '$1');
	s = s.replace(/_([^_]+)_/g, '$1');
	s = s.replace(/`([^`]+)`/g, '$1');
	s = s.replace(/^\s*#{1,6}\s*/gm, '');
	s = s.replace(/^\s*[-•–]\s*/gm, '');
	s = s.replace(/[\u2700-\u27BF\u1F300-\u1FAD6\u2600-\u26FF]/g, '');
	s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
	s = s.replace(/\s+/g, ' ').trim();
	if (s.length > 220) s = s.slice(0, 217) + '...';
	return s;
}

function extractKeySentences(text, maxSentences = 1) {
	if (!text || typeof text !== 'string') return [];
	const normalized = text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
	const sentences = normalized.split(/(?<=[.!?])\s+/).filter((s) => s && s.length > 20);
	const keywords = ['invest', 'investment', 'risk', 'return', 'diversify', 'portfolio', 'budget', 'emergency fund', 'market', 'supply', 'demand', 'tax', 'insurance', 'compound interest', '401(k)', 'ira'];
	const scored = sentences.map((s) => {
		const lowered = s.toLowerCase();
		const score = keywords.reduce((acc, k) => acc + (lowered.includes(k) ? 1 : 0), 0) + Math.min(s.length / 120, 1);
		return { s, score };
	});
	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, maxSentences).map((x) => stripMarkdown(x.s));
}

function buildShortQuestion(lessonTitle, lessonContent, nextId) {
	const key = extractKeySentences(lessonContent, 1)[0] || `a key concept in ${lessonTitle}`;
	const qText = `Briefly explain: "${key}"`;
	const ref = `A concise explanation of "${key}" based on the lesson.`;
	return {
		id: nextId,
		type: 'short_answer',
		question: qText,
		correctAnswer: ref,
		explanation: `Derived from the lesson text for ${lessonTitle}`
	};
}

async function processQuiz(quiz) {
	const questions = coerceQuestions(quiz.questions);
	if (!Array.isArray(questions)) return { updated: false };
	// If a non-anchored short_answer already exists, do nothing
	const hasShort = questions.some((q) => (q?.type || '').toLowerCase() === 'short_answer');
	if (hasShort) return { updated: false };
	const lesson = await prisma.lesson.findUnique({ where: { id: quiz.lessonId } });
	const lessonTitle = lesson?.title || 'this lesson';
	const lessonContent = stripMarkdown(lesson?.content || '');
	const nextId = (questions.reduce((m, q) => Math.max(m, q?.id || 0), 0) || 0) + 1;
	const shortQ = buildShortQuestion(lessonTitle, lessonContent, nextId);
	const updatedList = [...questions, shortQ];
	await prisma.quiz.update({ where: { id: quiz.id }, data: { questions: updatedList } });
	return { updated: true };
}

async function main() {
	console.log('➕ Adding one clean short_answer per quiz from lesson text (no citations)...');
	const quizzes = await prisma.quiz.findMany({});
	let updatedCount = 0;
	for (const quiz of quizzes) {
		try {
			const res = await processQuiz(quiz);
			if (res.updated) updatedCount++;
		} catch (e) {
			console.warn(`Skipping quiz ${quiz.id}:`, e.message);
		}
	}
	console.log(`✅ Done. Quizzes updated: ${updatedCount}`);
}

main()
	.catch((e) => {
		console.error('❌ Short-answer seeding failed:', e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
