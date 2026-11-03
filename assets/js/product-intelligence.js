(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
  const PROJECT_URL = "https://nuyzvpkvawixidotuuio.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_Xe8zdn_sbokiGy1aIvu-VQ_jGxV2qWS";
  const config = () => { try { return JSON.parse(localStorage.getItem("vsa_config_v1")||"{}"); } catch { return {}; } };
  const client = () => { const c=config(); return window.supabase.createClient(c.url||PROJECT_URL,c.key||PUBLISHABLE_KEY); };
  const session = async sb => (await sb.auth.getSession()).data.session;
  const toast = msg => { const el=$("#toast"); if(el){el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2800);} };
  const formHTML = x => `
    <form id="vsa-product-intelligence-form" class="card form-card">
      <div class="panel-heading"><div><span class="section-kicker">PRODUCT INTELLIGENCE</span><h3>${x?.id?"Editar produto":"Novo produto"}</h3></div><span class="panel-tag">ETAPA 1 · PRODUTO</span></div>
      <p class="muted">Essas informações serão a base para a IA analisar a oferta, sugerir públicos e preparar campanhas. Campos marcados são obrigatórios.</p>
      <div class="form-grid">
        <label class="field">Nome do produto *<input name="name" required maxlength="180" value="${esc(x?.name)}" placeholder="Ex.: Atividades Cognitivas para Crianças"></label>
        <label class="field">Nicho / categoria *<input name="niche" required value="${esc(x?.niche||"Geral")}" placeholder="Educação, beleza, fitness..."></label>
        <label class="field">Preço de venda (R$)<input name="price" type="number" min="0" step=".01" value="${Number(x?.price)||0}"></label>
        <label class="field">Custo por unidade (R$)<input name="cost" type="number" min="0" step=".01" value="${Number(x?.cost)||0}"></label>
        <label class="field">Página de vendas / checkout<input name="url" type="url" value="${esc(x?.destination_url)}" placeholder="https://..."></label>
        <label class="field">Plataforma de checkout<input name="checkout_provider" value="${esc(x?.checkout_provider)}" placeholder="Kiwify, Hotmart, Eduzz..."></label>
        <label class="field">Imagem do produto (URL)<input name="image_url" type="url" value="${esc(x?.image_url)}" placeholder="https://..."></label>
        <label class="field">Status<select name="product_status"><option value="draft" ${(!x?.product_status||x.product_status==="draft")?"selected":""}>Rascunho</option><option value="active" ${x?.product_status==="active"?"selected":""}>Ativo</option><option value="archived" ${x?.product_status==="archived"?"selected":""}>Arquivado</option></select></label>
        <label class="field" style="grid-column:1/-1">Descrição comercial<textarea name="description" rows="3" placeholder="O que é o produto? O que o comprador recebe?">${esc(x?.description)}</textarea></label>
        <label class="field">Público comprador<input name="target_audience" value="${esc(x?.target_audience)}" placeholder="Quem tem maior probabilidade de comprar?"></label>
        <label class="field">Principais benefícios<textarea name="benefits" rows="2" placeholder="Liste benefícios e diferenciais reais">${esc(x?.benefits)}</textarea></label>
      </div>
      <div class="notice">Margem bruta estimada por unidade: <b id="vsa-product-margin">${money((Number(x?.price)||0)-(Number(x?.cost)||0))}</b>. Não inclui taxas, impostos ou anúncios.</div>
      <button class="btn primary" type="submit">${x?.id?"Salvar alterações":"Salvar produto e continuar"}</button>
      <button class="btn ghost" type="button" id="vsa-product-cancel">Cancelar</button>
    </form>`;
  function openEditor(x) {
    const slot=$("#product-form-slot"); if(!slot) return;
    slot.innerHTML=formHTML(x);
    const form=$("#vsa-product-intelligence-form");
    $("#vsa-product-cancel").onclick=()=>slot.innerHTML="";
    const updateMargin=()=>{const d=new FormData(form);$("#vsa-product-margin").textContent=money((Number(d.get("price"))||0)-(Number(d.get("cost"))||0));};
    form.elements.price.addEventListener("input",updateMargin);
    form.elements.cost.addEventListener("input",updateMargin);
    form.onsubmit=async e=>{
      e.preventDefault();
      const sb=client(),s=await session(sb);
      if(!s){toast("Entre na sua conta para salvar o produto na nuvem.");return;}
      const d=Object.fromEntries(new FormData(form));
      const payload={name:d.name.trim(),niche:d.niche.trim(),price:Number(d.price)||0,cost:Number(d.cost)||0,destination_url:d.url.trim()||null,checkout_provider:d.checkout_provider.trim()||null,image_url:d.image_url.trim()||null,product_status:d.product_status,description:d.description.trim()||null,target_audience:d.target_audience.trim()||null,benefits:d.benefits.trim()||null};
      const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent="Salvando...";
      try {
        let q=x?sb.from("vsa_products").update(payload).eq("id",x.id):sb.from("vsa_products").insert({...payload,user_id:s.user.id});
        const {error}=await q;if(error)throw error;
        toast(x?"Produto atualizado":"Produto salvo com sucesso");
        slot.innerHTML="";
        document.querySelector('[data-view="products"]')?.click();
      } catch(err){toast("Erro ao salvar produto: "+err.message);button.disabled=false;button.textContent=x?"Salvar alterações":"Salvar produto e continuar";}
    };
  }
  document.addEventListener("click",e=>{
    const add=e.target.closest("#new-product");
    const edit=e.target.closest("[data-edit-product]");
    if(!add&&!edit)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(add)openEditor(null);
    else {
      const id=edit.dataset.editProduct;
      const sb=client();
      sb.from("vsa_products").select("*").eq("id",id).single().then(({data,error})=>{
        if(error){toast("Não foi possível abrir o produto: "+error.message);return;}
        openEditor(data);
      });
    }
  },true);
  document.addEventListener("click",e=>{
    if(e.target.closest('[data-view="products"]')) setTimeout(()=>{
      const host=$("#view-content");
      if(host&&!$("#vsa-product-intelligence-note")) {
        const note=document.createElement("div");note.id="vsa-product-intelligence-note";note.className="notice";
        note.innerHTML="<b>Cadastro inteligente habilitado.</b> Complete descrição, público, benefícios e custos para que as próximas etapas usem os dados do produto.";
        const slot=$("#product-form-slot");if(slot)slot.after(note);
      }
    },30);
  },true);
})();