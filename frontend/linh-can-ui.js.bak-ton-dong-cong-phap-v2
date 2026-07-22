(function () {
  const $id = id => document.getElementById(id);

  const state = {
    name: '',
    token: '',
    questions: [],
    index: 0,
    answers: []
  };

  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Thiên cơ không phản hồi.');
    }

    return data;
  }

  function showQuestion() {
    const question = state.questions[state.index];
    if (!question) return;

    const progressText = $id('destiny-progress-text');
    const progressBar = $id('destiny-progress-bar');
    const questionElement = $id('destiny-question');
    const answersElement = $id('destiny-answers');

    if (progressText) {
      progressText.textContent =
        `${state.index + 1} / ${state.questions.length}`;
    }

    if (progressBar) {
      progressBar.style.width =
        `${state.index / Math.max(1, state.questions.length) * 100}%`;
    }

    if (questionElement) {
      questionElement.textContent = question.text;
    }

    if (!answersElement) return;

    answersElement.innerHTML = question.answers
      .map(answer => (
        `<button class="destiny-answer" data-answer="${answer.id}">` +
        `${answer.text}</button>`
      ))
      .join('');

    answersElement
      .querySelectorAll('[data-answer]')
      .forEach(button => {
        button.onclick = () => choose(button.dataset.answer);
      });
  }

  async function choose(answerId) {
    const question = state.questions[state.index];
    if (!question) return;

    state.answers.push({
      questionId: question.id,
      answerId
    });

    state.index += 1;

    if (state.index < state.questions.length) {
      showQuestion();
      return;
    }

    try {
      const message = $id('destiny-message');
      if (message) message.textContent = 'Thiên mệnh đang định hình...';

      const data = await request('/api/player', {
        method: 'POST',
        body: JSON.stringify({
          name: state.name,
          assessmentToken: state.token,
          answers: state.answers
        })
      });

      $id('destiny-assessment')?.classList.add('hidden');

      window.dispatchEvent(
        new CustomEvent('thienmenh:created', { detail: data })
      );
    } catch (error) {
      const message = $id('destiny-message');
      if (message) message.textContent = error.message;
    }
  }

  async function begin(name) {
    state.name = String(name || '').trim();

    if (state.name.length < 2) {
      throw new Error('Đạo hiệu phải có ít nhất 2 ký tự.');
    }

    const data = await request('/api/player/assessment');
    const assessment = data.assessment || data;

    state.token = assessment.token || assessment.assessmentToken;
    state.questions = assessment.questions || [];
    state.index = 0;
    state.answers = [];

    if (!state.token || !state.questions.length) {
      throw new Error('Không tải được Thiên Mệnh Khảo Nghiệm.');
    }

    $id('destiny-assessment')?.classList.remove('hidden');

    const message = $id('destiny-message');
    if (message) message.textContent = '';

    showQuestion();
  }

  function gradeName(level) {
    const value = Math.max(1, Number(level || 1));

    if (value >= 401) return `Thiên phẩm · ${value - 400}/100`;
    if (value >= 301) return `Địa phẩm · ${value - 300}/100`;
    if (value >= 201) return `Huyền phẩm · ${value - 200}/100`;
    if (value >= 101) return `Hoàng phẩm · ${value - 100}/100`;

    return `Phàm phẩm · ${value}/100`;
  }

  function render(player, roots) {
    if (!player) return;

    const list = Array.isArray(roots) ? roots : [];
    const rootId = player.spiritual_root || player.spiritualRoot;
    const root = list.find(item => String(item.id) === String(rootId));

    const name =
      player.spiritual_root_name ||
      player.spiritualRootName ||
      root?.name ||
      'Chưa ngộ Linh Căn';

    const level =
      player.spiritual_root_level ||
      player.spiritualRootLevel ||
      1;

    const special = Boolean(
      player.is_innate_special_root || player.isInnateSpecialRoot
    );

    const setText = (id, value) => {
      const element = $id(id);
      if (element) element.textContent = value;
    };

    setText('root-full-name', name);
    setText(
      'root-full-description',
      player.spiritual_root_description ||
        root?.description ||
        'Chưa có ghi chép.'
    );
    setText('root-grade-level', gradeName(level));
    setText('root-element-name', root?.element || '—');
    setText('root-rarity', root?.rarity || '—');
    setText(
      'root-origin',
      special ? 'Thiên sinh đặc tính' : 'Thiên Mệnh Ngũ Hành'
    );
    setText(
      'root-type-badge',
      root?.rootType === 'dao_tac'
        ? 'Đạo Tắc'
        : root?.rootType === 'dac_tinh'
          ? 'Linh Căn Đặc Tính'
          : 'Ngũ Hành'
    );

    const growth = player.spiritual_root_growth || {
      hp: root?.growthHp,
      mp: root?.growthMp,
      attack: root?.growthAttack,
      defense: root?.growthDefense
    };

    const growthBox = $id('root-growth-list');
    if (growthBox) {
      growthBox.innerHTML = [
        ['Sinh Lực', growth.hp],
        ['Nội Lực', growth.mp],
        ['Công Kích', growth.attack],
        ['Phòng Thủ', growth.defense]
      ]
        .map(([label, value]) => (
          `<span>${label} ×${Number(value || 1).toFixed(2)}</span>`
        ))
        .join('');
    }
  }

  window.ThienMenhUI = {
    begin,
    render,
    gradeName
  };
})();
