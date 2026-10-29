(() => {
  'use strict';
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer;
  window.BongoMotion={
    reveal(root=document){
      if(reduced()||!('IntersectionObserver'in window))return;
      observer?.disconnect();
      observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.08});
      root.querySelectorAll('.section-head,.product-card,.service-card,.how-grid,.estimator,.faq-layout,.maker-banner,.workspace-card').forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',Math.min(i%4*65,195)+'ms');observer.observe(el);});
    },
    added(product,{quantity,source,saved=true,detail=null}){
      const bag=document.querySelector('.bag-button');
      bag.classList.remove('bag-bump');void bag.offsetWidth;bag.classList.add('bag-bump');
      if(source){if(!source.dataset.originalMarkup)source.dataset.originalMarkup=source.innerHTML;clearTimeout(source._bbAddedTimer);source.innerHTML='✓';source.classList.add('is-added');source._bbAddedTimer=setTimeout(()=>{if(source.isConnected){source.innerHTML=source.dataset.originalMarkup;source.classList.remove('is-added');}},1400);}
      if(!reduced()&&source){const start=source.getBoundingClientRect(),end=bag.getBoundingClientRect();const flight=document.createElement('img');flight.src=product.image;flight.alt='';flight.className='cart-flight';Object.assign(flight.style,{left:start.left-25+'px',top:start.top-25+'px'});document.body.append(flight);const animation=flight.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${end.left-start.left}px,${end.top-start.top}px) scale(.2)`,opacity:.3}],{duration:650,easing:'cubic-bezier(.22,.65,.35,1)'});animation.finished.finally(()=>flight.remove());}
      let notice=document.getElementById('cart-notice');if(!notice){notice=document.createElement('aside');notice.id='cart-notice';notice.className='cart-notice';notice.setAttribute('aria-label','Shopping bag confirmation');document.body.append(notice);}
      clearTimeout(window.BongoMotion.noticeTimer);
      notice.innerHTML=`<div class="cart-notice-status" role="status">✓ Added to your demo bag<button data-action="dismiss-cart" aria-label="Dismiss bag confirmation">×</button></div><div class="cart-notice-product"><img src="${product.image}" alt="${product.imageAlt||product.name}"><div><strong>${product.name}</strong><span>${detail||`${quantity} in your bag · ৳${Math.round(product.priceBDT).toLocaleString('en-US')} each`}</span></div></div><div class="cart-notice-actions"><button class="button dark small" data-action="bag">View bag & checkout ↗</button><button data-action="dismiss-cart">Keep exploring</button></div>${saved?'':'<p class="storage-warning">Storage unavailable; keep this tab open.</p>'}`;
      notice.hidden=false;notice.classList.remove('notice-enter');void notice.offsetWidth;notice.classList.add('notice-enter');
      window.BongoMotion.noticeTimer=setTimeout(()=>{notice.hidden=true;},7000);
    },
    dismiss(){const n=document.getElementById('cart-notice');if(n)n.hidden=true;clearTimeout(window.BongoMotion.noticeTimer);}
  };
})();
