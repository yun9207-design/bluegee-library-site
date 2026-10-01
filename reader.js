'use strict';
const query=new URLSearchParams(location.search);
const selectedGuide=(window.BLUEGEE_CATALOG||[]).find(item=>item.id===query.get('id'));
if(selectedGuide){const chapter=query.get('chapter');location.replace(selectedGuide.url+(chapter?'#'+encodeURIComponent(chapter):''));}
else document.getElementById('reader-status').textContent='가이드를 찾을 수 없습니다. 목록에서 선택해 주세요.';
