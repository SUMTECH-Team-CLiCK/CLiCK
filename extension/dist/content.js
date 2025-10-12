(function(){const o=document.createElement("div");o.id="click-overlay",Object.assign(o.style,{position:"fixed",top:"72px",right:"24px",zIndex:"2147483647",width:"360px",maxHeight:"70vh",background:"#fff",border:"1px solid #ddd",borderRadius:"12px",boxShadow:"0 8px 28px rgba(0,0,0,.12)",overflow:"hidden",fontFamily:"Noto Sans KR, sans-serif"}),o.innerHTML=`
    <div style="padding:12px">
      <div style="font-weight:700; margin-bottom:8px">CLICK 패널</div>
      <button id="analyzeBtn"
        style="background:#10a37f;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer">
        초록 버튼 (분석)
      </button>
    </div>
  `,document.documentElement.appendChild(o),console.log("CLICK content script loaded on ChatGPT")})();
