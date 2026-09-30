'use strict';
const categoryNames={'outboard':'아웃보드','deep-dive':'엔지니어 딥다이브','microphone':'마이크'};
const params=new URLSearchParams(location.search);
const guide=(window.BLUEGEE_CATALOG||[]).find(item=>item.id===params.get('id'));
const frame=document.getElementById('guide-frame');
let currentIndex=0,ready=false,chapterNodes=[];
const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function closeTOC(){document.getElementById('reader-main').classList.remove('toc-open');document.getElementById('toc-toggle').setAttribute('aria-expanded','false');}
function chapterFromTarget(target){if(!target)return -1;return chapterNodes.findIndex(node=>node===target||node.contains(target));}
function selectChapter(index,anchor,updateURL=true){
 if(!guide||!ready||index<0||index>=guide.chapters.length)return;
 currentIndex=index;
 const doc=frame.contentDocument;
 chapterNodes.forEach((node,i)=>{node.hidden=false;node.classList.toggle('platform-current',i===index);if(i===index){node.style.removeProperty('display');node.classList.add('active');}});
 const chapter=guide.chapters[index];
 document.getElementById('current-chapter').textContent=String(index+1).padStart(2,'0')+' / '+guide.chapters.length+' · '+chapter.title;
 document.querySelectorAll('.chapter-link').forEach(button=>{if(Number(button.dataset.index)===index)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
 document.getElementById('previous-chapter').disabled=index===0;
 document.getElementById('next-chapter').disabled=index===guide.chapters.length-1;
 if(updateURL)history.replaceState({},'',`reader.html?id=${guide.id}&chapter=${encodeURIComponent(chapter.id)}`);
 closeTOC();
 frame.contentWindow.scrollTo({top:0,behavior:'instant'});
 if(anchor&&anchor!==chapter.id){const target=doc.getElementById(anchor);if(target){let el=target.parentElement;while(el&&el!==chapterNodes[index]){if(el.tagName==='DETAILS')el.open=true;el=el.parentElement;}target.scrollIntoView({block:'start'});}}
}
function renderTOC(){const query=document.getElementById('toc-search').value.trim().toLocaleLowerCase();document.querySelectorAll('.chapter-link').forEach(button=>{const chapter=guide.chapters[Number(button.dataset.index)];button.hidden=!!query&&!chapter.title.toLocaleLowerCase().includes(query);});}
if(!guide){frame.hidden=true;document.getElementById('reader-error').hidden=false;document.getElementById('current-chapter').textContent='가이드 선택';document.getElementById('guide-title').textContent='BlueGEE Audio Library';document.getElementById('previous-chapter').disabled=true;document.getElementById('next-chapter').disabled=true;}
else{
 document.title=guide.title+' — BlueGEE Audio Library';
 document.getElementById('guide-category').textContent=categoryNames[guide.category]+' · '+guide.id;
 document.getElementById('guide-title').textContent=guide.title;
 document.getElementById('back-to-category').href='index.html?category='+guide.category;
 document.querySelectorAll('.main-nav a').forEach(a=>{if(a.href.endsWith('category='+guide.category))a.setAttribute('aria-current','page');});
 document.getElementById('chapter-nav').innerHTML=guide.chapters.map((chapter,index)=>`<button class="chapter-link" data-index="${index}" type="button"><span>${String(index+1).padStart(2,'0')}</span>${escapeText(chapter.title)}</button>`).join('');
 document.querySelectorAll('.chapter-link').forEach(button=>button.addEventListener('click',()=>selectChapter(Number(button.dataset.index))));
 document.getElementById('toc-search').addEventListener('input',renderTOC);
 frame.title=guide.title+' 본문';
 frame.addEventListener('load',()=>{
  const doc=frame.contentDocument;if(!doc)return;
  chapterNodes=guide.chapters.map(chapter=>doc.getElementById(chapter.id));
  if(chapterNodes.some(node=>!node)){document.getElementById('current-chapter').textContent='목차 연결을 확인할 수 없습니다.';return;}
  doc.body.classList.add('platform-reading');chapterNodes.forEach(node=>node.classList.add('platform-chapter'));
  doc.querySelectorAll('.hero,.v4-hero,.bg-hero,.v4-research-hero').forEach(hero=>{if(!chapterNodes.some(node=>node.contains(hero)))hero.classList.add('platform-chrome');});
  const style=doc.createElement('style');style.textContent=`
   html{scroll-padding-top:20px!important}body.platform-reading{margin:0!important;padding:0!important;overflow-x:hidden!important}
   .platform-reading .bg-top,.platform-reading .bg-sidebar,.platform-reading #bg-chapter-controls,.platform-reading #bg-search-panel,.platform-reading .bg-skip,.platform-reading .v4-head,.platform-reading .v4-rail,.platform-reading .v4-skip,.platform-reading #v4-search-panel,.platform-reading .v4-mobile-select,.platform-reading .reader-sidebar,.platform-reading .sidebar,.platform-reading body>header,.platform-reading .topbar,.platform-reading .top-bar,.platform-reading .top-header,.platform-reading .header-bar,.platform-reading .site-header,.platform-reading .sticky-header,.platform-reading .tabs-scroll,.platform-reading #tabsNav,.platform-reading .tab-nav,.platform-reading .tabs,.platform-reading .tabs-nav,.platform-reading .nav-tabs,.platform-reading .tab-buttons,.platform-reading .tab-bar,.platform-reading .sticky-nav,.platform-reading .v4-nav,.platform-reading .read-panel,.platform-reading .bg-footer,.platform-reading .v4-chapter-footer,.platform-reading .v4-read-btn{display:none!important}
   .platform-reading>header,.platform-reading>nav,.platform-reading>.top,.platform-reading>.topbar,.platform-reading>.header,.platform-reading>.navbar{display:none!important}
   .platform-reading #bg-main,.platform-reading #v4-main,.platform-reading main,.platform-reading .main-content,.platform-reading .content,.platform-reading .container,.platform-reading .v4-research-wrap{margin:0 auto!important;padding:24px clamp(16px,3vw,36px)!important;max-width:1180px!important;width:100%!important;min-width:0!important}
   .platform-reading .platform-chrome{display:none!important}.platform-reading .platform-chapter{display:none!important;visibility:visible!important;scroll-margin-top:15px!important;animation:none!important;opacity:1!important}
   .platform-reading .platform-chapter.platform-current{display:block!important}
   .platform-reading h1{font-size:clamp(25px,3vw,36px)!important;line-height:1.3!important}
   .platform-reading table{max-width:100%}.platform-reading .table-wrap,.platform-reading .table-responsive{overflow-x:auto!important}
   .platform-reading .hero{padding:25px!important}.platform-reading .bg-chapter-head,.platform-reading .v4-title{scroll-margin-top:15px!important}
   @media(max-width:620px){.platform-reading #bg-main,.platform-reading #v4-main,.platform-reading main,.platform-reading .content,.platform-reading .container,.platform-reading .v4-research-wrap{padding:18px 14px!important}}
  `;doc.head.append(style);
  doc.addEventListener('click',event=>{const a=event.target.closest?.('a[href^="#"]');if(!a)return;const anchor=decodeURIComponent(a.getAttribute('href').slice(1));const target=doc.getElementById(anchor),index=chapterFromTarget(target);if(index!==-1){event.preventDefault();event.stopPropagation();selectChapter(index,anchor);}},true);
  ready=true;
  const requested=params.get('chapter');const index=guide.chapters.findIndex(chapter=>chapter.id===requested);selectChapter(index>=0?index:0,undefined,false);
 });
 frame.src=guide.url;
}
document.getElementById('previous-chapter').addEventListener('click',()=>selectChapter(currentIndex-1));document.getElementById('next-chapter').addEventListener('click',()=>selectChapter(currentIndex+1));document.getElementById('toc-toggle').addEventListener('click',()=>{const open=document.getElementById('reader-main').classList.toggle('toc-open');document.getElementById('toc-toggle').setAttribute('aria-expanded',String(open));});document.getElementById('reader-overlay').addEventListener('click',closeTOC);addEventListener('keydown',event=>{if(event.key==='Escape')closeTOC();});
