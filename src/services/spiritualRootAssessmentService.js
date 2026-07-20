const crypto = require('crypto');
const path = require('path');
const { loadXml, arrayOf } = require('../config/xmlLoader');

const ELEMENTS = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
const ROOT_IDS = {
  kim: 'kim_linh_can',
  moc: 'moc_linh_can',
  thuy: 'thuy_linh_can',
  hoa: 'hoa_linh_can',
  tho: 'tho_linh_can'
};

const XML_PATH = path.join(
  __dirname, '..', '..', 'data', 'worlds', 'NhanGioi',
  'TuyenDao', 'KhaoNghiemLinhCan.xml'
);

const TOKEN_SECRET = String(
  process.env.SPIRITUAL_ROOT_ASSESSMENT_SECRET ||
  process.env.SESSION_SECRET ||
  'nhan-gioi-thien-menh-doi-khi-trien-khai'
);

let cache = null;
const toArray = value => arrayOf(value);
const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function loadAssessment() {
  if (cache) return cache;

  const document = loadXml(XML_PATH);
  const root = document.SpiritualRootAssessment;
  if (!root) throw new Error('KhaoNghiemLinhCan.xml thiếu thẻ SpiritualRootAssessment.');

  const questionCount = Math.max(1, asNumber(root.questionCount, 10));
  const tokenLifetimeSeconds = Math.max(60, asNumber(root.tokenLifetimeSeconds, 900));

  const questions = toArray(root.Questions?.Question).map(rawQuestion => {
    const id = String(rawQuestion.id || '').trim();
    const text = String(rawQuestion.text || '').trim();
    const answers = toArray(rawQuestion.Answer).map(rawAnswer => ({
      id: String(rawAnswer.id || '').trim(),
      text: String(rawAnswer.text || '').trim(),
      effects: toArray(rawAnswer.Effect).map(effect => ({
        element: String(effect.element || '').trim().toLowerCase(),
        points: asNumber(effect.points, 0),
        primary: String(effect.primary || '').toLowerCase() === 'true'
      })),
      traits: toArray(rawAnswer.Trait).map(trait => ({
        id: String(trait.id || '').trim().toLowerCase(),
        points: asNumber(trait.points, 0)
      }))
    }));

    if (!id || !text) throw new Error('Có câu khảo nghiệm thiếu id hoặc text.');
    if (answers.length !== 3) throw new Error(`Câu ${id} phải có đúng 3 lựa chọn.`);

    const answerIds = new Set();
    for (const answer of answers) {
      if (!answer.id || !answer.text || answerIds.has(answer.id)) {
        throw new Error(`Câu ${id} có đáp án thiếu hoặc trùng id.`);
      }
      answerIds.add(answer.id);
      if (!answer.effects.length) throw new Error(`Đáp án ${id}.${answer.id} chưa có Effect.`);
      if (!answer.traits.length) throw new Error(`Đáp án ${id}.${answer.id} chưa có Trait.`);
      for (const effect of answer.effects) {
        if (!ELEMENTS.includes(effect.element) || effect.points <= 0) {
          throw new Error(`Đáp án ${id}.${answer.id} có Effect không hợp lệ.`);
        }
      }
      for (const trait of answer.traits) {
        if (!trait.id || trait.points <= 0) {
          throw new Error(`Đáp án ${id}.${answer.id} có Trait không hợp lệ.`);
        }
      }
    }
    return { id, text, answers };
  });

  if (questions.length < questionCount) {
    throw new Error(`Đạo Tạng chỉ có ${questions.length} câu, không đủ chọn ${questionCount} câu.`);
  }

  const questionIds = new Set();
  for (const question of questions) {
    if (questionIds.has(question.id)) throw new Error(`Trùng id câu khảo nghiệm: ${question.id}`);
    questionIds.add(question.id);
  }

  const specialRoots = toArray(root.SpecialRootRules?.SpecialRoot).map(raw => {
    const id = String(raw.id || '').trim();
    const requirements = toArray(raw.Requirements?.Requirement).map(req => ({
      trait: String(req.trait || '').trim().toLowerCase(),
      minPoints: Math.max(1, asNumber(req.minPoints, 1))
    }));
    const chance = Math.min(1, Math.max(0, asNumber(raw.chance, 0.01)));
    if (!id || !requirements.length || chance <= 0) {
      throw new Error(`Quy tắc Linh Căn Đặc Tính ${id || '(không id)'} không hợp lệ.`);
    }
    return {
      id,
      name: String(raw.name || id),
      priority: asNumber(raw.priority, 0),
      chance,
      minTotalTraitPoints: Math.max(1, asNumber(raw.minTotalTraitPoints, 1)),
      requirements
    };
  });

  cache = { questionCount, tokenLifetimeSeconds, questions, specialRoots };
  return cache;
}

function shuffle(rows) {
  const result = [...rows];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const selected = crypto.randomInt(index + 1);
    [result[index], result[selected]] = [result[selected], result[index]];
  }
  return result;
}

const base64UrlEncode = value => Buffer.from(value, 'utf8').toString('base64url');
const sign = encoded => crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');

function createToken(questionIds, lifetimeSeconds) {
  const payload = {
    questionIds,
    expiresAt: Date.now() + lifetimeSeconds * 1000,
    nonce: crypto.randomBytes(12).toString('hex')
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function readToken(token) {
  const [encoded, signature] = String(token || '').split('.');
  if (!encoded || !signature) throw badRequest('Thiên Mệnh khảo nghiệm không hợp lệ.');

  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw badRequest('Thiên Mệnh khảo nghiệm đã bị thay đổi.');
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    throw badRequest('Không thể giải đọc Thiên Mệnh khảo nghiệm.');
  }
  if (!Array.isArray(payload.questionIds) || Date.now() > payload.expiresAt) {
    throw badRequest('Khảo nghiệm đã hết hiệu lực, hãy khai mở lại.');
  }
  return payload;
}

function beginAssessment() {
  const assessment = loadAssessment();
  const selected = shuffle(assessment.questions).slice(0, assessment.questionCount);
  return {
    token: createToken(selected.map(question => question.id), assessment.tokenLifetimeSeconds),
    total: selected.length,
    questions: selected.map(question => ({
      id: question.id,
      text: question.text,
      answers: question.answers.map(answer => ({ id: answer.id, text: answer.text }))
    }))
  };
}

function secureRandomFloat() {
  return crypto.randomInt(0, 1_000_000) / 1_000_000;
}

function findQualifiedSpecialRoot(specialRoots, traitScores) {
  const qualified = specialRoots.map(rule => {
    const requirementPoints = rule.requirements.reduce(
      (sum, requirement) => sum + Number(traitScores[requirement.trait] || 0), 0
    );
    const allRequirementsMet = rule.requirements.every(
      requirement => Number(traitScores[requirement.trait] || 0) >= requirement.minPoints
    );
    return { ...rule, qualificationScore: requirementPoints, qualified: allRequirementsMet && requirementPoints >= rule.minTotalTraitPoints };
  }).filter(rule => rule.qualified);

  qualified.sort((left, right) =>
    right.qualificationScore - left.qualificationScore ||
    right.priority - left.priority ||
    left.id.localeCompare(right.id)
  );
  return qualified[0] || null;
}

function evaluateAssessment(token, submittedAnswers) {
  const payload = readToken(token);
  const assessment = loadAssessment();
  const answers = Array.isArray(submittedAnswers) ? submittedAnswers : [];
  if (answers.length !== payload.questionIds.length) {
    throw badRequest('Phải hoàn thành toàn bộ câu hỏi trước khi khai sinh nhân vật.');
  }

  const answerMap = new Map();
  for (const row of answers) {
    const questionId = String(row?.questionId || '');
    const answerId = String(row?.answerId || '');
    if (!questionId || !answerId || answerMap.has(questionId)) {
      throw badRequest('Danh sách đáp án khảo nghiệm không hợp lệ.');
    }
    answerMap.set(questionId, answerId);
  }

  const scores = Object.fromEntries(ELEMENTS.map(element => [element, 0]));
  const primaryHits = Object.fromEntries(ELEMENTS.map(element => [element, 0]));
  const decisiveScores = Object.fromEntries(ELEMENTS.map(element => [element, 0]));
  const traitScores = {};

  payload.questionIds.forEach((questionId, index) => {
    const question = assessment.questions.find(item => item.id === questionId);
    const answer = question?.answers.find(item => item.id === answerMap.get(questionId));
    if (!question || !answer) throw badRequest('Có đáp án không thuộc khảo nghiệm đã được cấp.');

    const positionWeight = payload.questionIds.length - index;
    for (const effect of answer.effects) {
      scores[effect.element] += effect.points;
      decisiveScores[effect.element] += effect.points * positionWeight;
      if (effect.primary) primaryHits[effect.element] += 1;
    }
    for (const trait of answer.traits) {
      traitScores[trait.id] = Number(traitScores[trait.id] || 0) + trait.points;
    }
  });

  const ranking = [...ELEMENTS].sort((left, right) =>
    scores[right] - scores[left] ||
    primaryHits[right] - primaryHits[left] ||
    decisiveScores[right] - decisiveScores[left] ||
    ELEMENTS.indexOf(left) - ELEMENTS.indexOf(right)
  );

  const mainElement = ranking[0];
  const hiddenElements = ranking.slice(1, 4);
  const missingElement = ranking[4];
  const qualifiedSpecialRoot = findQualifiedSpecialRoot(assessment.specialRoots, traitScores);
  const innateSpecialAwakened = Boolean(
    qualifiedSpecialRoot && secureRandomFloat() < qualifiedSpecialRoot.chance
  );

  return {
    mainElement,
    mainRootId: ROOT_IDS[mainElement],
    mainRootLevel: crypto.randomInt(1, 101),
    visibleRootId: innateSpecialAwakened ? qualifiedSpecialRoot.id : ROOT_IDS[mainElement],
    innateSpecialAwakened,
    innateSpecialRootId: innateSpecialAwakened ? qualifiedSpecialRoot.id : null,
    innateSpecialRootName: innateSpecialAwakened ? qualifiedSpecialRoot.name : null,
    hiddenElements,
    hiddenRootIds: hiddenElements.map(element => ROOT_IDS[element]),
    hiddenRootLevels: hiddenElements.map(element => ({
      element,
      rootId: ROOT_IDS[element],
      level: crypto.randomInt(1, 101),
      unlocked: false
    })),
    missingElement,
    missingRootId: ROOT_IDS[missingElement],
    scores,
    primaryHits,
    traitScores
  };
}

function getSummary() {
  const assessment = loadAssessment();
  return {
    totalQuestions: assessment.questions.length,
    selectedQuestions: assessment.questionCount,
    tokenLifetimeSeconds: assessment.tokenLifetimeSeconds,
    innateSpecialRootCount: assessment.specialRoots.length
  };
}

module.exports = { beginAssessment, evaluateAssessment, getSummary };
