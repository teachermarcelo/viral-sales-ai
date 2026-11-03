const $ = (s) => document.querySelector(s);
const PROJECT_URL = "https://nuyzvpkvawixidotuuio.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_Xe8zdn_sbokiGy1aIvu-VQ_jGxV2qWS";
const cfg = JSON.parse(localStorage.getItem("vsa_config_v1") || "{}");
const client = window.supabase.createClient(cfg.url || PROJECT_URL, cfg.key || PUBLISHABLE_KEY);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let interests = [], locations = [];
function renderFinder() {
  document.querySelectorAll(".nav-item").forEach(x => x.classList.toggle("active", x.dataset.view === "audience"));
  $("#view-title").textContent = "AI Audience Finder · Meta";
  $("#view-content").innerHTML = `
  <div class="audience-hero"><div><span class="hero-kicker">META AUDIENCE INTELLIGENCE</span><h2>Encontre e combine públicos para suas campanhas.</h2><p>Pesquise opções reais do catálogo de segmentação da Meta e monte uma hipótese de público por interesse, idade e localização.</p></div><div class="audience-hero-mark">◎</div></div>
  <div class="card form-card">
   <div class="panel-heading"><div><span class="section-kicker">01 · PERFIL DO PÚBLICO</span><h3>Defina idade e região</h3></div><span class="panel-tag">SOMENTE LEITURA</span></div>
   <div class="form-grid">
    <label class="field">Produto ou campanha<input id="aud-product" placeholder="Ex.: Atividades Cognitivas para Crianças"></label>
    <label class="field">Idade mínima<select id="aud-age-min"><option>18</option><option>21</option><option>25</option><option>30</option><option>35</option><option>40</option><option>45</option><option>50</option><option>55</option><option>60</option></select></label>
    <label class="field">Idade máxima<select id="aud-age-max"><option>65</option><option>60</option><option>55</option><option>50</option><option>45</option><option>40</option><option>35</option><option>30</option><option>25</option></select></label>
    <label class="field">Localização para pesquisar<input id="aud-geo-query" placeholder="Ex.: Curitiba, Paraná ou Brasil"></label>
   </div>
   <button class="btn primary" id="aud-search-geo">⌖ Pesquisar localização na Meta</button>
   <div id="aud-geo-results" style="margin-top:14px"></div>
  </div>
  <div class="card form-card" style="margin-top:16px">
   <div class="panel-heading"><div><span class="section-kicker">02 · INTERESSES</span><h3>Descubra interesses relacionados</h3></div></div>
   <div class="form-grid"><label class="field">Pesquisar interesse<input id="aud-interest-query" placeholder="Ex.: educação infantil, psicopedagogia, inglês"></label></div>
   <button class="btn primary" id="aud-search-interest">✧ Pesquisar interesses na Meta</button>
   <div id="aud-interest-results" style="margin-top:14px"></div>
  </div>
  <div class="card form-card" style="margin-top:16px">
   <div class="panel-heading"><div><span class="section-kicker">03 · RESUMO</span><h3>Seu público selecionado</h3></div></div>
   <div id="aud-selected-summary" class="notice">Selecione uma localização e pelo menos um interesse para montar a segmentação.</div>
   <button class="btn primary" id="aud-build-spec">Gerar especificação de público</button>
   <pre id="aud-spec-output" style="display:none;white-space:pre-wrap;overflow:auto;background:#171329;color:#f3edff;padding:16px;border-radius:12px;margin-top:14px"></pre>
   <p class="panel-footnote">Esta etapa apenas pesquisa e monta uma sugestão. Não cria anúncios, não altera campanhas e não identifica pessoas individualmente.</p>
  </div>`;
  interests = []; locations = [];
  const runSearch = async (kind, query, target) => {
    if (query.trim().length < 2) { target.innerHTML = '<div class="notice">Digite pelo menos 2 caracteres.</div>'; return; }
    target.innerHTML = '<p class="muted">Consultando o catálogo de segmentação da Meta...</p>';
    try {
      const {data, error} = await client.functions.invoke("vsa-meta-targeting", {body:{kind, query:query.trim()}});
      if (error) {
        let msg = error.message || "Falha ao consultar a Meta.";
        try { const p = await error.context.clone().json(); msg = p.message || p.error || msg; } catch {}
        target.innerHTML = '<div class="notice"><b>Não foi possível pesquisar.</b><p>'+esc(msg)+'</p></div>'; return;
      }
      if (data?.error) { target.innerHTML = '<div class="notice"><b>Pesquisa não concluída.</b><p>'+esc(data.message || data.error)+'</p><small>Código: '+esc(data.code || "—")+'</small></div>'; return; }
      const results = data?.results || [];
      if (kind === "geo") locations = results;
      else interests = results;
      target.innerHTML = results.length ? '<div class="table-wrap"><table class="data-table"><thead><tr><th>Selecionar</th><th>Nome</th><th>Tipo</th><th>Alcance estimado</th></tr></thead><tbody>'+results.map((x,i)=>'<tr><td><input type="checkbox" data-'+kind+'-index="'+i+'"></td><td><b>'+esc(x.name)+'</b><br><small>'+esc((x.path||[]).join(" › "))+'</small></td><td>'+esc(x.type || "—")+'</td><td>'+(x.audience_size_lower_bound!=null ? Number(x.audience_size_lower_bound).toLocaleString("pt-BR")+" – "+Number(x.audience_size_upper_bound||x.audience_size_lower_bound).toLocaleString("pt-BR") : "—")+'</td></tr>').join("")+'</tbody></table></div>' : '<div class="notice">Nenhuma opção encontrada. Tente outro termo.</div>';
      target.querySelectorAll('input[type="checkbox"]').forEach(ch => ch.addEventListener("change", updateSummary));
    } catch(e) { target.innerHTML = '<div class="notice">'+esc(e.message || "Erro inesperado.")+'</div>'; }
  };
  $("#aud-search-geo").onclick = () => runSearch("geo", $("#aud-geo-query").value, $("#aud-geo-results"));
  $("#aud-search-interest").onclick = () => runSearch("interest", $("#aud-interest-query").value, $("#aud-interest-results"));
  function selected(kind) {
    const target = kind === "geo" ? $("#aud-geo-results") : $("#aud-interest-results");
    const source = kind === "geo" ? locations : interests;
    return [...target.querySelectorAll('input[type="checkbox"]:checked')].map(ch => source[Number(ch.dataset[kind+"Index"])]).filter(Boolean);
  }
  function updateSummary() {
    const a = selected("geo"), b = selected("interest");
    $("#aud-selected-summary").innerHTML = '<b>Localizações:</b> '+(a.map(x=>esc(x.name)).join(", ") || "nenhuma")+'<br><b>Interesses:</b> '+(b.map(x=>esc(x.name)).join(", ") || "nenhum")+'<br><b>Faixa etária:</b> '+esc($("#aud-age-min").value)+'–'+esc($("#aud-age-max").value)+' anos';
    $("#aud-spec-output").style.display = "none";
  }
  $("#aud-age-min").onchange = updateSummary;
  $("#aud-age-max").onchange = updateSummary;
  $("#aud-build-spec").onclick = () => {
    const a = selected("geo"), b = selected("interest");
    const min = Number($("#aud-age-min").value), max = Number($("#aud-age-max").value);
    if (min > max) { $("#aud-selected-summary").innerHTML = '<b>A idade mínima não pode ser maior que a máxima.</b>'; return; }
    if (!a.length || !b.length) { $("#aud-selected-summary").innerHTML = '<b>Selecione pelo menos uma localização e um interesse.</b>'; return; }
    const geo = {countries:[],regions:[],cities:[]};
    for (const x of a) {
      const t = String(x.type || "").toLowerCase();
      if (t === "country" && x.country_code) geo.countries.push(x.country_code);
      else if (t === "region" && (x.key || x.id)) geo.regions.push({key:String(x.key || x.id)});
      else if (t === "city" && (x.key || x.id)) geo.cities.push({key:String(x.key || x.id)});
    }
    const spec = {age_min:min,age_max:max,geo_locations:geo,interests:b.map(x=>({id:x.id,name:x.name}))};
    $("#aud-spec-output").textContent = JSON.stringify(spec,null,2);
    $("#aud-spec-output").style.display = "block";
    $("#aud-selected-summary").innerHTML = '<b>Especificação criada.</b> Revise os itens e copie o JSON para usar na configuração da campanha.';
  };
}
document.addEventListener("click", e => { const b=e.target.closest('[data-view="audience"]'); if(b) setTimeout(renderFinder,0); });
