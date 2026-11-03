(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const PROJECT_URL = "https://nuyzvpkvawixidotuuio.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_Xe8zdn_sbokiGy1aIvu-VQ_jGxV2qWS";
  const getClient = () => { let c={}; try{c=JSON.parse(localStorage.getItem("vsa_config_v1")||"{}")}catch{} return window.supabase.createClient(c.url||PROJECT_URL,c.key||PUBLISHABLE_KEY); };
  const client = getClient();
  const label = {draft:"Rascunho",approved:"Aprovado para publicação",publishing:"Publicando",published:"Publicado",failed:"Falha"};
  const platformNames = {instagram:"Instagram",facebook:"Facebook"};
  function render(){
    document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view==="publishing"));
    $("#view-title").textContent = "Central de Publicação";
    $("#view-content").innerHTML = `
      <div class="audience-hero"><div><span class="hero-kicker">ORGANIC CONTENT · META ADS</span><h2>Crie, aprove e publique em um só lugar.</h2><p>Prepare conteúdos para Instagram e Facebook e organize campanhas pagas. Nada será enviado à Meta sem sua aprovação explícita.</p></div><div class="audience-hero-mark">✦</div></div>
      <div class="card form-card" style="margin-top:16px">
        <div class="panel-heading"><div><span class="section-kicker">ETAPA 1 · CONEXÃO</span><h3>Contas Meta</h3></div><span class="panel-tag">CONFIGURAÇÃO PENDENTE</span></div>
        <div class="notice"><b>Leitura de anúncios já configurada.</b><p>A conexão atual usa <code>ads_read</code>, que permite consultar campanhas, mas não publicar posts nem criar anúncios. A publicação orgânica exige permissões próprias do Instagram/Facebook; anúncios exigem <code>ads_management</code>.</p></div>
        <div class="form-grid">
          <div class="field"><b>Instagram</b><p class="muted">A conta precisa ser profissional (Empresa ou Criador). Para o fluxo Facebook Login, deve estar vinculada a uma Página.</p><span class="pill">Aguardando autorização de publicação</span></div>
          <div class="field"><b>Facebook</b><p class="muted">A Página precisa conceder acesso para criar conteúdo.</p><span class="pill">Aguardando autorização de publicação</span></div>
        </div>
        <p class="muted" style="margin-top:12px">Próximo passo técnico: configurar OAuth da Meta no app e solicitar os escopos adequados. O token será armazenado somente no Supabase, nunca no navegador.</p>
        <a class="btn ghost" href="https://developers.facebook.com/apps/" target="_blank" rel="noopener">Abrir Meta for Developers</a>
      </div>
      <div class="card form-card" style="margin-top:16px">
        <div class="panel-heading"><div><span class="section-kicker">ETAPA 2 · CONTEÚDO ORGÂNICO</span><h3>Novo conteúdo</h3></div><span class="panel-tag">RASCUNHO</span></div>
        <form id="vsa-pub-form">
          <div class="form-grid">
            <label class="field">Publicar em<select name="platforms" multiple size="2"><option value="instagram" selected>Instagram</option><option value="facebook">Facebook</option></select><small>Use Ctrl para selecionar as duas redes.</small></label>
            <label class="field">Formato<select name="content_type"><option value="post">Post com imagem</option><option value="carousel">Carrossel</option><option value="reel">Reels</option><option value="facebook_post">Post do Facebook</option></select></label>
            <label class="field">Produto relacionado<select name="product_id"><option value="">Sem produto vinculado</option></select></label>
            <label class="field">Agendar para (opcional)<input type="datetime-local" name="scheduled_at"></label>
            <label class="field" style="grid-column:1/-1">Legenda e hashtags<textarea name="caption" rows="5" required placeholder="Escreva a legenda, chamada para ação e hashtags..."></textarea></label>
            <label class="field" style="grid-column:1/-1">URLs públicas das imagens/vídeos<textarea name="media_urls" rows="2" placeholder="Uma URL por linha. Para publicar, os arquivos precisam estar acessíveis publicamente."></textarea><small>O rascunho pode ser salvo sem mídia; a publicação exigirá os arquivos no formato compatível.</small></label>
          </div>
          <button class="btn primary" type="submit">Salvar rascunho</button>
          <span id="vsa-pub-message" class="muted" aria-live="polite"></span>
        </form>
      </div>
      <div class="card" style="margin-top:16px"><div class="panel-heading"><div><span class="section-kicker">ETAPA 3 · APROVAÇÃO</span><h3>Fila de publicações</h3></div><button class="btn ghost" id="vsa-pub-refresh">Atualizar</button></div><div id="vsa-pub-list"><p class="muted">Carregando rascunhos...</p></div></div>
      <div class="card form-card" style="margin-top:16px"><div class="panel-heading"><div><span class="section-kicker">ETAPA 4 · ANÚNCIOS PAGOS</span><h3>Meta Ads</h3></div><span class="panel-tag">PUBLICAÇÃO BLOQUEADA ATÉ AUTORIZAÇÃO</span></div><p class="muted">O próximo módulo reaproveitará seus produtos, públicos e criativos para montar campanha, conjunto de anúncios e anúncio. Você revisará orçamento, segmentação, posicionamentos e criativo antes de aprovar o envio para a conta Fluentimmersion.</p><button class="btn ghost" type="button" id="vsa-open-meta">Ver conexão de anúncios</button></div>`;
    loadProducts();
    loadDrafts();
    $("#vsa-pub-form").addEventListener("submit", saveDraft);
    $("#vsa-pub-refresh").onclick = loadDrafts;
    $("#vsa-open-meta").onclick = () => document.querySelector('[data-view="meta"]')?.click();
  }
  async function loadProducts(){
    const select = $('[name="product_id"]');
    try{
      const {data,error}=await client.from("vsa_products").select("id,name").order("created_at",{ascending:false});
      if(error)throw error;
      for(const p of data||[]){const o=document.createElement("option");o.value=p.id;o.textContent=p.name;select.append(o)}
    }catch(e){select.insertAdjacentHTML("beforeend",'<option value="">Produtos indisponíveis nesta sessão</option>')}
  }
  async function saveDraft(e){
    e.preventDefault();
    const form=e.currentTarget, btn=form.querySelector('button[type="submit"]'), msg=$("#vsa-pub-message");
    const {data:auth}=await client.auth.getSession(), user=auth?.session?.user;
    if(!user){msg.textContent="Entre no modo conectado ao Supabase para salvar seus rascunhos.";return}
    const d=new FormData(form);
    const platforms=[...form.elements.platforms.selectedOptions].map(x=>x.value);
    if(!platforms.length){msg.textContent="Selecione Instagram, Facebook ou ambos.";return}
    const media=String(d.get("media_urls")||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const scheduled=String(d.get("scheduled_at")||"");
    const payload={user_id:user.id,platforms,content_type:d.get("content_type"),caption:String(d.get("caption")||"").trim(),media_urls:media,product_id:d.get("product_id")||null,scheduled_at:scheduled?new Date(scheduled).toISOString():null,status:"draft"};
    btn.disabled=true;btn.textContent="Salvando...";
    try{
      const {error}=await client.from("vsa_publication_drafts").insert(payload);
      if(error)throw error;
      form.reset();msg.textContent="Rascunho salvo. Ainda não foi publicado.";
      await loadDrafts();
    }catch(err){msg.textContent="Não foi possível salvar: "+err.message}
    finally{btn.disabled=false;btn.textContent="Salvar rascunho"}
  }
  async function loadDrafts(){
    const host=$("#vsa-pub-list");if(!host)return;
    host.innerHTML='<p class="muted">Carregando...</p>';
    const {data:auth}=await client.auth.getSession();
    if(!auth?.session?.user){host.innerHTML='<div class="notice">Entre com sua conta para visualizar os rascunhos salvos na nuvem.</div>';return}
    const {data,error}=await client.from("vsa_publication_drafts").select("*,vsa_products(name)").order("created_at",{ascending:false}).limit(50);
    if(error){host.innerHTML='<div class="notice">Erro ao carregar rascunhos: '+esc(error.message)+'</div>';return}
    if(!data?.length){host.innerHTML='<p class="muted">Nenhum rascunho criado ainda.</p>';return}
    host.innerHTML='<div class="table-wrap"><table class="data-table"><thead><tr><th>Conteúdo</th><th>Redes</th><th>Produto</th><th>Status</th><th>Ações</th></tr></thead><tbody>'+data.map(x=>'<tr><td><b>'+esc(x.content_type)+'</b><br><small>'+esc(x.caption.slice(0,90))+'</small></td><td>'+x.platforms.map(p=>esc(platformNames[p]||p)).join(" + ")+'</td><td>'+esc(x.vsa_products?.name||"—")+'</td><td><span class="pill">'+esc(label[x.status]||x.status)+'</span></td><td>'+(x.status==="draft"?'<button class="text-button" data-pub-approve="'+x.id+'">Aprovar</button> ':"")+'<button class="text-button" data-pub-delete="'+x.id+'">Excluir</button></td></tr>').join("")+'</tbody></table></div><p class="panel-footnote">Aprovar registra sua autorização para a próxima etapa, mas não publica enquanto a conexão de publicação não estiver configurada.</p>';
    host.querySelectorAll("[data-pub-approve]").forEach(b=>b.onclick=()=>setStatus(b.dataset.pubApprove,"approved"));
    host.querySelectorAll("[data-pub-delete]").forEach(b=>b.onclick=()=>deleteDraft(b.dataset.pubDelete));
  }
  async function setStatus(id,status){
    const {error}=await client.from("vsa_publication_drafts").update({status,updated_at:new Date().toISOString()}).eq("id",id);
    if(error)alert("Não foi possível atualizar: "+error.message);else loadDrafts();
  }
  async function deleteDraft(id){
    if(!confirm("Excluir este rascunho?"))return;
    const {error}=await client.from("vsa_publication_drafts").delete().eq("id",id);
    if(error)alert("Não foi possível excluir: "+error.message);else loadDrafts();
  }
  document.addEventListener("click",e=>{if(e.target.closest('[data-view="publishing"]'))setTimeout(render,0)});
})();