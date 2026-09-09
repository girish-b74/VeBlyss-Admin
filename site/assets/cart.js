(function(){
  const KEY='veblyss_cart_v1';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function save(c){localStorage.setItem(KEY,JSON.stringify(c))}
  function count(){return load().reduce((s,i)=>s+i.qty,0)}
  function updateBadges(){document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count())}
  function add(item){const c=load();const x=c.find(i=>i.id===item.id);if(x)x.qty++;else c.push({...item,qty:1});save(c);updateBadges();showToast(item.name+' added to cart')}
  function showToast(msg){let t=document.getElementById('cart-toast');if(!t){t=document.createElement('div');t.id='cart-toast';t.className='cart-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(window._ct);window._ct=setTimeout(()=>t.classList.remove('show'),1800)}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-add-to-cart]');if(b){e.preventDefault();add({id:b.dataset.id,name:b.dataset.name,image:b.dataset.image,url:b.dataset.url||'',price:Number(b.dataset.price||0)})}})
  window.VeBlyssCart={load,save,add,count,updateBadges,total:function(){return load().reduce((s,i)=>s+(i.price*i.qty),0)}};
  document.addEventListener('DOMContentLoaded',updateBadges)
})();
