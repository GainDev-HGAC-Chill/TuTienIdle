(()=>{
  const CATEGORIES={tam_phap:'Tâm Pháp',chien_phap:'Chiến Pháp',luyen_the:'Luyện Thể Pháp',than_thong:'Thần Thông'};
  function playerId(){return window.state?.player?.id||window.currentPlayer?.id||Number(localStorage.getItem('playerId')||0)}
  async function api(url,options){const r=await fetch(url,{headers:{'Content-Type':'application/json'},...options});const d=await r.json();if(!r.ok||d.success===false)throw new Error(d.message||'Thiên Cơ gián đoạn');return d}
  function host(){return document.querySelector('#overviewPanel,#tong-quan,.overview-content,[data-panel="overview"]')||document.querySelector('main')||document.body}
  async function render(){const id=playerId();if(!id)return;let panel=document.getElementById('daoTangCongPhap');if(!panel){panel=document.createElement('section');panel.id='daoTangCongPhap';panel.className='panel dao-tang-panel';host().appendChild(panel)}
    const profile=await api(`/api/cultivation-arts/player/${id}`);const catalog=await api(`/api/cultivation-arts/catalog?rootId=${encodeURIComponent(profile.rootId)}`);const eq=new Map(profile.equipped.map(x=>[x.category,x.art_id]));
    panel.innerHTML=`<h3>Đạo Tàng Công Pháp</h3><p>Mỗi Linh Căn có 3 Tâm Pháp, 3 Chiến Pháp, 3 Luyện Thể Pháp và 3 Thần Thông.</p><div class="dao-tang-toolbar">${Object.entries(CATEGORIES).map(([k,v])=>`<button data-cat="${k}">${v}</button>`).join('')}</div><div class="dao-tang-grid"></div>`;
    const grid=panel.querySelector('.dao-tang-grid');
    function show(cat){const owned=new Map(profile.owned.map(x=>[x.art_id,x]));grid.innerHTML=catalog.arts.filter(a=>a.category===cat).map(a=>{const o=owned.get(a.id),g=a.grades[o?.grade||'pham'],isEq=eq.get(cat)===a.id;return `<article class="dao-art-card ${isEq?'dao-equipped':''}"><h4>${a.name}</h4><div class="dao-art-meta">${a.categoryName} · ${a.element} · ${o?o.grade:'Chưa lĩnh ngộ'}</div><p>${a.description||''}</p><div class="dao-art-effects">${(g?.effects||[]).map(e=>`${e.id} ${e.chancePercent||0}%`).join(' · ')||'Chỉ số thường trực'}</div><button data-art="${a.id}" data-owned="${!!o}">${isEq?'Đã trang bị':o?'Trang bị':'Lĩnh ngộ'}</button></article>`}).join('');}
    panel.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>show(b.dataset.cat));
    grid.onclick=async e=>{const b=e.target.closest('[data-art]');if(!b)return;const artId=b.dataset.art;const url=b.dataset.owned==='true'?`/api/cultivation-arts/player/${id}/equip`:`/api/cultivation-arts/player/${id}/learn`;await api(url,{method:'POST',body:JSON.stringify({artId})});await render()};show('tam_phap');
  }
  window.renderDaoTangCongPhap=render;document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>render().catch(()=>{}),700));
})();
