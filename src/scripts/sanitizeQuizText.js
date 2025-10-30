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
	// Remove markdown bold/italics/code
	s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
	s = s.replace(/\*([^*]+)\*/g, '$1');
	s = s.replace(/__([^_]+)__/g, '$1');
	s = s.replace(/_([^_]+)_/g, '$1');
	s = s.replace(/`([^`]+)`/g, '$1');
	// Remove headings and leading symbols like #, ##, -, •
	s = s.replace(/^\s*#{1,6}\s*/gm, '');
	s = s.replace(/^\s*[-•–]\s*/gm, '');
	// Remove emojis and special symbols like ✅ ❌ ✗ ✓
	s = s.replace(/[\u2700-\u27BF\u1F300-\u1FAD6\u2600-\u26FF]/g, '');
	// Collapse multiple spaces and dashes
	s = s.replace(/\s{2,}/g, ' ');
	s = s.replace(/\s*-\s*-+/g, ' - ');
	// Normalize quotes and trim
	s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
	s = s.replace(/\s+/g, ' ').trim();
	// Limit extreme length
	if (s.length > 320) s = s.slice(0, 317) + '...';
	return s;
}

function sanitizeQuestionObject(q) {
	if (!q || typeof q !== 'object') return q;
	const sanitized = { ...q };
	sanitized.question = stripMarkdown(String(q.question || ''));
	if (sanitized.type === 'multiple_choice' && Array.isArray(q.options)) {
		sanitized.options = q.options.map((opt) => stripMarkdown(String(opt)));
	}
	if (q.correctAnswer != null && typeof q.correctAnswer === 'string') {
		sanitized.correctAnswer = stripMarkdown(q.correctAnswer);
	}
	if (q.explanation != null && typeof q.explanation === 'string') {
		sanitized.explanation = stripMarkdown(q.explanation);
	}
	return sanitized;
}

async function sanitizeAllQuizzes() {
	const quizzes = await prisma.quiz.findMany({});
	let updated = 0;
	for (const quiz of quizzes) {
		const before = coerceQuestions(quiz.questions);
		if (!Array.isArray(before)) continue;
		const after = before.map(sanitizeQuestionObject);
		if (JSON.stringify(after) !== JSON.stringify(quiz.questions)) {
			await prisma.quiz.update({ where: { id: quiz.id }, data: { questions: after } });
			updated++;
		}
	}
	return { updated };
}

async function main() {
	console.log('🧹 Sanitizing quiz text (removing markdown, emojis, headings)...');
	const res = await sanitizeAllQuizzes();
	console.log(`✅ Done. Quizzes updated: ${res.updated}`);
}

main()
	.catch((e) => {
		console.error('❌ Sanitize failed:', e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
