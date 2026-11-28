const $ = id => document.getElementById(id);
const view=$('model-view'), load=$('model-load'), status=$('model-status'), svg=$('konfSvg');
let initialized=false, refresh, draw, turn, opened=false;
load.addEventListener('click',async()=>{
  if(initialized){view.hidden=false;svg.style.display='none';load.hidden=true;for(const id of ['model-action','model-rotate','model-2d']) $(id).hidden=false;refresh();return;}
  load.disabled=true;status.textContent='Učitavanje 3D prikaza…';
  try{
    const T=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    const scene=new T.Scene();scene.background=new T.Color(0x485463);
    const camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(5,3,8);camera.lookAt(0,0,0);
    const light=new T.DirectionalLight(0xffffff,3);light.position.set(4,5,6);scene.add(light,new T.HemisphereLight(0xffffff,0x344466,2));
    turn=new T.Group();scene.add(turn);turn.rotation.y=.25;
    let hinges=[];
    draw=()=>{if(view.hidden)return;const w=view.clientWidth,h=view.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.zoom=Math.min(1,camera.aspect);camera.updateProjectionMatrix();renderer.render(scene,camera);};
    const value=id=>$(id).value;
    refresh=()=>{
      if(view.hidden)return;
      const materials=new Set();turn.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());turn.clear();hinges=[];opened=false;
      const rawW=Math.max(30,Math.min(400,+value('kW')||100)),rawH=Math.max(30,Math.min(300,+value('kH')||100)),scale=3.5/Math.max(rawW,rawH),w=rawW*scale,h=rawH*scale;
      const t=Math.min(w,h)*.065,alu=value('kMat')==='ALU',color=value('kBoja');
      const frame=new T.MeshStandardMaterial({color,metalness:alu ? .55 : .08,roughness:alu ? .35 : .65});
      const glass=new T.MeshStandardMaterial({color:0x90b9ce,transparent:true,opacity:.55,roughness:.15});
      const metal=new T.MeshStandardMaterial({color:0x9ba2a8,metalness:.7,roughness:.3});
      const box=(parent,mat,a,b,c,x,y,z=0)=>{const m=new T.Mesh(new T.BoxGeometry(Math.max(.001,a),Math.max(.001,b),c),mat);m.position.set(x,y,z);parent.add(m);};
      const depth=alu ? .16 : .23;
      for(const sign of [-1,1]){box(turn,frame,t,h,depth,sign*(w-t)/2,0);box(turn,frame,w,t,depth,0,sign*(h-t)/2);}
      const type=value('kVrsta'),gar=type==='Garažna vrata',door=type==='Vrata';
      if(gar&&value('kGarTip')==='Rolo'){
        const count=18;for(let i=0;i<count;i++)box(turn,frame,w-2*t,(h-2*t)/count*.94,.1,0,-h/2+t+(i+.5)*(h-2*t)/count);
        box(turn,frame,w,t*2,.32,0,h/2-t);
      }else{
        let parts=[];
        if(door){const n=+value('kPomN'),side=value('kPomStr');if(n===2||(n===1&&side==='Levo'))parts.push({weight:.45,mode:value('kPomL')==='Da'?'Fiksno':'Okretno'});parts.push({weight:1,mode:'Okretno',solid:true});if(n===2||(n===1&&side==='Desno'))parts.push({weight:.45,mode:value('kPomD')==='Da'?'Fiksno':'Okretno'});}
        else if(gar)parts=[{weight:1,mode:'Okretno',solid:true},{weight:1,mode:'Okretno',solid:true}];
        else parts=Array.from($('kOtv').querySelectorAll('select'),s=>({weight:1,mode:s.value}));
        const total=parts.reduce((a,p)=>a+p.weight,0);let left=-w/2+t;
        parts.forEach((p,i)=>{const pw=(w-2*t)*p.weight/total,ph=h-2*t,dir=i===parts.length-1&&i>0?-1:1,g=new T.Group();g.position.set(left+(dir<0?pw:0),p.mode==='Nagibno (kip)'?-ph/2:0,0);turn.add(g);const cx=dir*pw/2,cy=p.mode==='Nagibno (kip)'?ph/2:0,s=Math.min(t*.65,pw*.15);
          for(const sign of [-1,1]){box(g,frame,s,ph,.14,cx+sign*(pw-s)/2,cy);box(g,frame,pw,s,.14,cx,cy+sign*(ph-s)/2);}
          if(p.solid){box(g,frame,pw-2*s,ph-2*s,.09,cx,cy);if(!gar||value('kGarPr')==='Da')box(g,glass,pw*.7,ph*.25,.04,cx,cy+ph*.25,.06);}
          else box(g,glass,pw-2*s,ph-2*s,.035,cx,cy);
          if(p.mode!=='Fiksno'){box(g,metal,.045,Math.min(.2,ph*.15),.08,cx+dir*(pw/2-s*2),cy,.13);hinges.push({g,dir,tilt:p.mode==='Nagibno (kip)'});}
          left+=pw;
        });
      }
      if(!gar&&$('kRol').checked){box(turn,frame,w,t*2,.35,0,h/2+t);for(let i=0;i<5;i++)box(turn,frame,w-t,t*.48,.05,0,h/2-t-i*t*.5,.17);}
      if(!gar&&$('kMreza').checked){const mesh=new T.MeshStandardMaterial({color:0x333333,transparent:true,opacity:.25,wireframe:true});const m=new T.Mesh(new T.PlaneGeometry(w-2*t,h-2*t,24,24),mesh);m.position.z=.17;turn.add(m);}
      $('model-action').disabled=!hinges.length;$('model-action').setAttribute('aria-pressed','false');draw();
    };
    $('model-action').addEventListener('click',()=>{opened=!opened;hinges.forEach(({g,dir,tilt})=>{g.rotation.y=opened&&!tilt?dir*1.05:0;g.rotation.x=opened&&tilt?-.22:0;});$('model-action').setAttribute('aria-pressed',String(opened));draw();});
    $('model-rotate').addEventListener('click',()=>{turn.rotation.y+=Math.PI/4;draw();});
    $('model-2d').addEventListener('click',()=>{view.hidden=true;svg.style.display='';load.hidden=false;for(const id of ['model-action','model-rotate','model-2d'])$(id).hidden=true;});
    let x=null;const canvas=renderer.domElement;canvas.style.touchAction='pan-y';canvas.style.width='100%';canvas.style.height='100%';
    canvas.addEventListener('pointerdown',e=>{x=e.clientX;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(x===null)return;turn.rotation.y+=(e.clientX-x)*.012;x=e.clientX;draw();});canvas.addEventListener('lostpointercapture',()=>x=null);
    view.append(canvas);view.hidden=false;svg.style.display='none';load.hidden=true;for(const id of ['model-action','model-rotate','model-2d'])$(id).hidden=false;
    $('konf').addEventListener('input',refresh);$('konf').addEventListener('change',refresh);new ResizeObserver(draw).observe(view);initialized=true;refresh();status.textContent='Ilustrativni 3D prikaz; nije proizvodni nacrt.';
  }catch(e){view.hidden=true;svg.style.display='';load.hidden=false;status.textContent='3D nije dostupan. Koristite 2D crtež.';}finally{load.disabled=false;}
});

// Automatically load the preview when the configurator approaches the viewport.
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => { if(entries.some(e=>e.isIntersecting)){observer.disconnect();if(!initialized&&!load.disabled)load.click();} }, {rootMargin:'150px'});
 observer.observe($('konf'));
} else { load.click(); }
