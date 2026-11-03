const $=s=>document.querySelector(s);
const PROJECT_URL="https://nuyzvpkvawixidotuuio.supabase.co";
const PUBLISHABLE_KEY="sb_publishable_Xe8zdn_sbokiGy1aIvu-VQ_jGxV2qWS";
const cfg=JSON.parse(localStorage.getItem("vsa_config_v1")||"{}");
const client=window.supabase.createClient(cfg.url||PROJECT_URL,cfg.key||PUBLISHABLE_KEY);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function showMeta(){
 document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view==="meta"));
 $("#view-title").textContent="Meta Ads · Conexão";
 $("#view-content").innerHTML=`<div class="card form-card"><div class="panel-heading"><div><span class="section-kicker">INTEGRAÇÃO OFICIAL · META MARKETING API</span><h3>Conectar conta de anúncios</h3></div><span class="panel-tag">SOMENTE LEITURA</span></div><p class="muted">Teste a autorização do VIRAL SALES AI para consultar campanhas. O token permanece nos Secrets do Supabase e nunca aparece nesta tela.</p><div class="notice"><b>Conta em teste:</b> act_164750873099530<br><b>Permissão esperada:</b> ads_read</div><button class="btn primary" id="test-meta-connection">↻ Testar conexão com Meta</button><div id="meta-connection-result" aria-live="polite" style="margin-top:18px"></div></div>`;
 $("#test-meta-connection").onclick=async()=>{
  const btn=$("#test-meta-connection"),out=$("#meta-connection-result");
  btn.disabled=true;btn.textContent="Testando conexão...";
  out.innerHTML='<p class="muted">Verificando sessão, token e acesso à conta de anúncios...</p>';
  try{
   const {data:sessionData}=await client.auth.getSession();
   const session=sessionData?.session;
   if(!session){out.innerHTML='<div class="notice">Sua sessão não foi encontrada. Saia e entre novamente no VIRAL SALES AI.</div>';return}
   const {data,error}=await client.functions.invoke("vsa-meta-insights",{body:{}});
   if(error){
    let detail=error.message||"Falha ao chamar a função.";
    try{const response=error.context;if(response&&typeof response.clone==="function"){const payload=await response.clone().json();detail=payload.message||payload.error||detail}}catch{}
    out.innerHTML='<div class="notice"><b>Não foi possível concluir o teste.</b><p>'+esc(detail)+'</p><small>Consulte os logs da função no Supabase. Nenhum token é exibido.</small></div>';
   }else if(data?.status==="CONNECTED"){
    const rows=Array.isArray(data.campaigns)?data.campaigns:[];
    out.innerHTML='<div class="notice"><b>✓ Meta conectada com sucesso</b><p>A API retornou '+rows.length+' campanha(s).</p></div>'+(rows.length?'<div class="table-wrap"><table class="data-table"><thead><tr><th>Campanha</th><th>Status</th><th>Objetivo</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+esc(x.name||x.id)+'</td><td>'+esc(x.status||"—")+'</td><td>'+esc(x.objective||"—")+'</td></tr>').join("")+'</tbody></table></div>':'<p class="muted">A conexão funcionou, mas não há campanhas retornadas.</p>');
   }else{
    out.innerHTML='<div class="notice"><b>Conexão ainda não confirmada</b><p>'+esc(data?.message||data?.error||"Resposta inesperada.")+'</p><small>Código: '+esc(data?.status||"UNKNOWN")+'</small></div>';
   }
  }catch(err){out.innerHTML='<div class="notice"><b>Erro durante o teste</b><p>'+esc(err.message||"Erro inesperado.")+'</p></div>'}
  finally{btn.disabled=false;btn.textContent="↻ Testar novamente"}
 };
}
document.addEventListener("click",e=>{const b=e.target.closest('[data-view="meta"]');if(b){setTimeout(showMeta,0)}});
