const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const FORCE = String(process.env.FORCE_REF_ANSWERS || '').toLowerCase() === 'true' || process.argv.includes('--force');

function buildReferenceAnswer(questionText) {
	const trimmed = (questionText || '').trim();
	if (!trimmed) {
		return 'Answers will vary, but should demonstrate clear understanding with definitions, key points, and one concrete example.';
	}
	return `Answers will vary. A strong answer should directly address: "${trimmed}"; define key terms, explain core concepts clearly, and include at least one concise real-world example.`;
}

function needsReferenceAnswer(q) {
	if (!q || typeof q !== 'object') return false;
	const t = (q.type || '').toLowerCase();
	if (t !== 'free_response') return false;
	if (FORCE) return true;
	if (q.correctAnswer == null) return true;
	const s = String(q.correctAnswer).trim();
	return s.length === 0;
}

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

function ensureReferenceAnswers(questions, stats) {
	const qList = coerceQuestions(questions);
	if (!Array.isArray(qList)) return qList;
	let changed = false;
	const next = qList.map((q) => {
		try {
			if ((q?.type || '').toLowerCase() === 'free_response') {
				stats.freeResponseSeen++;
			}
			if (needsReferenceAnswer(q)) {
				stats.freeResponseUpdated++;
				changed = true;
				return {
					...q,
					correctAnswer: buildReferenceAnswer(q.question)
				};
			}
			return q;
		} catch (_) {
			return q;
		}
	});
	return changed ? next : qList;
}

async function updateQuizzes() {
	const quizzes = await prisma.quiz.findMany({});
	let updated = 0;
	const stats = { freeResponseSeen: 0, freeResponseUpdated: 0 };
	for (const quiz of quizzes) {
		const nextQuestions = ensureReferenceAnswers(quiz.questions, stats);
		if (JSON.stringify(nextQuestions) !== JSON.stringify(quiz.questions)) {
			await prisma.quiz.update({ where: { id: quiz.id }, data: { questions: nextQuestions } });
			updated++;
		}
	}
	return { updated, stats };
}

async function updateUnitTests() {
	const tests = await prisma.unitTest.findMany({});
	let updated = 0;
	const stats = { freeResponseSeen: 0, freeResponseUpdated: 0 };
	for (const test of tests) {
		const nextQuestions = ensureReferenceAnswers(test.questions, stats);
		if (JSON.stringify(nextQuestions) !== JSON.stringify(test.questions)) {
			await prisma.unitTest.update({ where: { id: test.id }, data: { questions: nextQuestions } });
			updated++;
		}
	}
	return { updated, stats };
}

async function main() {
	console.log('🌱 Seeding reference answers for free-response questions...');
	console.log(`   FORCE_REF_ANSWERS=${FORCE}`);
	const [qRes, tRes] = await Promise.all([updateQuizzes(), updateUnitTests()]);
	console.log(`✅ Done.`);
	console.log(`   Quizzes → updated: ${qRes.updated}, free-response seen: ${qRes.stats.freeResponseSeen}, updated: ${qRes.stats.freeResponseUpdated}`);
	console.log(`   UnitTests → updated: ${tRes.updated}, free-response seen: ${tRes.stats.freeResponseSeen}, updated: ${tRes.stats.freeResponseUpdated}`);
}

main()
	.catch((e) => {
		console.error('❌ Failed to seed reference answers:', e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
