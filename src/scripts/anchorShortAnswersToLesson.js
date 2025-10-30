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

function extractKeySentences(text, maxSentences = 2) {
	if (!text || typeof text !== 'string') return [];
	const normalized = text
		.replace(/\s+/g, ' ')
		.replace(/\n+/g, ' ')
		.trim();
	const sentences = normalized
		.split(/(?<=[.!?])\s+/)
		.filter((s) => s && s.length > 20);
	const keywords = ['invest', 'risk', 'return', 'diversify', 'diversification', 'portfolio', 'budget', 'retire', 'market', 'supply', 'demand', 'tax', 'insurance', 'compound', 'interest'];
	const scored = sentences.map((s) => {
		const lowered = s.toLowerCase();
		const score = keywords.reduce((acc, k) => acc + (lowered.includes(k) ? 1 : 0), 0) + Math.min(s.length / 120, 1);
		return { s, score };
	});
	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, maxSentences).map((x) => x.s);
}

function toConceptSnippet(sentence) {
	if (!sentence) return '';
	// Trim quotes and trailing punctuation for cleaner prompts
	return sentence.replace(/^\s*"|"\s*$/g, '').replace(/\s*[.!?]\s*$/, '');
}

function buildGroundedShortAnswerQuestion(lessonTitle, lessonContent, nextId) {
	const keySentence = extractKeySentences(lessonContent, 1)[0] || '';
	const concept = toConceptSnippet(keySentence) || `the main idea from "${lessonTitle}"`;
	const questionText = `In 1–2 sentences, what does "${concept}" mean in the context of "${lessonTitle}"?`;
	const reference = `A clear explanation of "${concept}" grounded in the lesson's definition and rationale.`;
	return {
		id: nextId,
		type: 'short_answer',
		question: questionText,
		correctAnswer: reference,
		explanation: `Grounded in lesson content from "${lessonTitle}"`
	};
}

async function processQuiz(quiz) {
	const questions = coerceQuestions(quiz.questions);
	if (!Array.isArray(questions)) return { updated: false };
	let updated = false;
	const lesson = await prisma.lesson.findUnique({ where: { id: quiz.lessonId } });
	const lessonTitle = lesson?.title || 'this lesson';
	const lessonContent = lesson?.content || '';
	const nextId = (questions.reduce((m, q) => Math.max(m, q?.id || 0), 0) || 0) + 1;
	const grounded = buildGroundedShortAnswerQuestion(lessonTitle, lessonContent, nextId);
	const idx = questions.findIndex((q) => (q?.type || '').toLowerCase() === 'short_answer');
	if (idx >= 0) {
		questions[idx] = { ...questions[idx], ...grounded, id: questions[idx].id || grounded.id };
		updated = true;
	} else {
		questions.push(grounded);
		updated = true;
	}
	if (updated) {
		await prisma.quiz.update({ where: { id: quiz.id }, data: { questions } });
	}
	return { updated };
}

async function main() {
	console.log('📝 Grounding short_answer questions in lesson text (no citation language)...');
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
		console.error('❌ Grounding script failed:', e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
