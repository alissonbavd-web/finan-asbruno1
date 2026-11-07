// Armazenamento local (localStorage) e aviso de erros
window.store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
window.addEventListener('error',function(ev){try{if(/Script error|tailwind|Chart is not defined/.test(ev.message||''))return;var b=document.getElementById('errBanner');if(!b){b=document.createElement('div');b.id='errBanner';b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;background:#be123c;color:#fff;font:12px/1.4 sans-serif;padding:8px 12px;border-radius:10px;white-space:pre-wrap';(document.body||document.documentElement).appendChild(b);}
var m=(ev.message||'erro')+' (linha '+(ev.lineno||'?')+')';b.textContent='Erro na página: '+m;}catch(e){}});
