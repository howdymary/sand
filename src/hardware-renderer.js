import * as THREE from './vendor/three.module.min.js';

const TEXTURES = {
  rack:'./assets/hardware/etched-rack.webp',
  tray:'./assets/hardware/etched-tray.webp',
  chip:'./assets/hardware/etched-chip.webp',
  board:'./assets/hardware/reconstructed-board.png',
  hoses:'./assets/hardware/reconstructed-hoses.png',
  coldplates:'./assets/hardware/reconstructed-coldplates.png'
};
const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,value)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t);};
const snap=(value,stops)=>stops.reduce((a,b)=>Math.abs(value-b)<Math.abs(value-a)?b:a,stops[0]);
const vec=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const box=(x,y,z,w,h,d)=>new THREE.Box3(vec(x-w/2,y-h/2,z-d/2),vec(x+w/2,y+h/2,z+d/2));
const blendBox=(a,b,t)=>new THREE.Box3(a.min.clone().lerp(b.min,t),a.max.clone().lerp(b.max,t));
const cloneState=state=>({...state,errors:[...state.errors],anchors:{...state.anchors}});

/** A scroll-scrubbed 3D interpretation, with official photographs kept on their
 * corresponding surfaces. Concealed PCB and package anatomy are explanatory. */
export function createHardwareRenderer(host,options={}) {
  let disposed=false,visible=true,compact=false,aspect=1,lastPhase='',ready=false,contextLost=false;
  let position={chapter:0,progress:0,reducedMotion:false};
  let state={available:false,loaded:false,loading:true,errors:[],phase:'rack',architectureMix:0,conceptual:false,anchors:{}};
  const noop=()=>{};
  const failedController={available:false,setPosition:()=>cloneState(state),setCompact:noop,setVisible:noop,dispose:noop,getState:()=>cloneState(state)};
  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:false});
  } catch(error) {
    state={...state,loading:false,errors:[`WebGL unavailable: ${error.message}`]};
    host.dataset.hardwareAvailable='false';
    queueMicrotask(()=>options.onReady?.(cloneState(state)));
    return failedController;
  }
  state.available=true;
  host.classList.add('hardware-renderer');
  host.dataset.hardwareAvailable='true';host.dataset.hardwareLoaded='false';
  const canvas=renderer.domElement;canvas.className='hardware-renderer-canvas';canvas.setAttribute('aria-hidden','true');host.append(canvas);
  const note=document.createElement('div');note.className='hardware-renderer-note';note.hidden=true;host.append(note);
  const labels={};
  for(const key of ['compute','memory','storage','tray']) {
    const label=document.createElement('div');label.className=`hardware-renderer-label hardware-renderer-label-${key}`;label.hidden=true;host.append(label);labels[key]=label;
  }
  labels.compute.textContent='Compute die · inferred';labels.memory.textContent='HBM · inferred';labels.storage.textContent='On-chip storage · conceptual';
  labels.tray.textContent='Compute tray';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#ffffff');
  const camera=new THREE.PerspectiveCamera(35,1,.025,100);
  const light=new THREE.DirectionalLight('#ffffff',4.6);light.position.set(-4,9,7);light.castShadow=true;
  light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-7;light.shadow.camera.right=7;light.shadow.camera.top=7;light.shadow.camera.bottom=-7;light.shadow.normalBias=.025;light.shadow.bias=-.0002;scene.add(light);
  const fill=new THREE.DirectionalLight('#e8eef8',2);fill.position.set(6,5,-4);scene.add(fill);
  scene.add(new THREE.HemisphereLight('#ffffff','#62666b',2.4));
  const resourceTextures=new Set(),geometries=new Set(),materials=new Set();
  const ownGeometry=geometry=>(geometries.add(geometry),geometry);
  const material=parameters=>{const result=new THREE.MeshStandardMaterial(parameters);materials.add(result);return result;};
  const photoMaterial=texture=>{const result=new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false,side:THREE.DoubleSide,depthWrite:true});materials.add(result);return result;};
  const graphite=material({color:'#16181b',roughness:.54,metalness:.58});
  const darkMetal=material({color:'#30343a',roughness:.43,metalness:.75});
  const silver=material({color:'#9ea2a7',roughness:.27,metalness:.84});
  const copperMaterial=material({color:'#bf8268',roughness:.29,metalness:.86});
  const hoseMaterial=material({color:'#121416',roughness:.83,metalness:.1});
  const circuitMaterial=material({color:'#141917',roughness:.7,metalness:.26});
  function meshBox(parent,w,h,d,mat,x=0,y=0,z=0) {
    const instanceMat=mat.clone();materials.add(instanceMat);
    const mesh=new THREE.Mesh(ownGeometry(new THREE.BoxGeometry(w,h,d)),instanceMat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function plane(parent,w,h,mat,x=0,y=0,z=0,top=false) {
    const mesh=new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(w,h)),mat);mesh.position.set(x,y,z);if(top)mesh.rotation.x=-Math.PI/2;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function cropped(texture,x,y,w,h,nativeW,nativeH) {
    const result=texture.clone();result.repeat.set(w/nativeW,h/nativeH);result.offset.set(x/nativeW,1-(y+h)/nativeH);result.needsUpdate=true;result.colorSpace=THREE.SRGBColorSpace;resourceTextures.add(result);return result;
  }
  function setOpacity(group,value) {
    group.visible=value>.001;
    group.traverse(object=>{if(!object.isMesh||!object.material)return;for(const mat of(Array.isArray(object.material)?object.material:[object.material])){mat.userData.hardwareDepthWrite??=mat.depthWrite;mat.transparent=true;mat.opacity=value;mat.depthWrite=mat.userData.hardwareDepthWrite&&value>.96;}});
  }
  const rack=new THREE.Group();scene.add(rack);
  const rackShell=new THREE.Group();rack.add(rackShell);
  // Side/back surfaces supply depth. The front is assembled as photo strips
  // around a genuine open bay; its pixels are never stretched into a drawer.
  meshBox(rackShell,.105,7,2.7,graphite,-1.315,0,0);meshBox(rackShell,.105,7,2.7,graphite,1.315,0,0);
  meshBox(rackShell,2.63,.09,2.7,graphite,0,3.5,0);meshBox(rackShell,2.63,.09,2.7,graphite,0,-3.5,0);
  meshBox(rackShell,2.6,6.9,.1,graphite,0,0,-1.35);
  const rackPhoto=new THREE.Group();rack.add(rackPhoto);
  const rackPhotoMaterials=[];
  const rackW=2.65,rackH=6.98,rackCrop={x:820,y:600,w:900,h:2370};
  const bay={x:1030,y:1390,w:470,h:350};
  const photoPart=(x,y,w,h,texture)=>{
    if(w<=0||h<=0)return;
    const mat=photoMaterial(cropped(texture,x,y,w,h,2525,3200));rackPhotoMaterials.push(mat);
    plane(rackPhoto,w/rackCrop.w*rackW,h/rackCrop.h*rackH,mat,((x+w/2-rackCrop.x)/rackCrop.w-.5)*rackW,(.5-(y+h/2-rackCrop.y)/rackCrop.h)*rackH,1.405);
  };
  const drawer=new THREE.Group();drawer.position.set(0,.65,.105);scene.add(drawer);
  const trayWidth=1.70,trayLength=2.59,trayTop=.525;
  meshBox(drawer,trayWidth,.09,trayLength,darkMetal,0,-.45,0);
  meshBox(drawer,.045,.96,trayLength,silver,-trayWidth/2,.015,0);meshBox(drawer,.045,.96,trayLength,silver,trayWidth/2,.015,0);
  meshBox(drawer,trayWidth,.045,.05,darkMetal,0,.49,-trayLength/2);
  const boardMat=photoMaterial(null);boardMat.color.set('#232923');
  const board=plane(drawer,trayWidth-.055,trayLength-.045,boardMat,0,trayTop,0,true);
  const trayPhotoMat=photoMaterial(null);const trayPhoto=plane(drawer,trayWidth,trayLength,trayPhotoMat,0,trayTop+.012,0,true);
  const frontMat=photoMaterial(null);const front=plane(drawer,bay.w/rackCrop.w*rackW,bay.h/rackCrop.h*rackH,frontMat,-.015,0,trayLength/2+.022);
  const bayW=bay.w/rackCrop.w*rackW,bayH=bay.h/rackCrop.h*rackH;
  const bayLineMat=new THREE.LineBasicMaterial({color:'#ff642e',transparent:true,opacity:0});materials.add(bayLineMat);
  const bayLine=new THREE.LineLoop(ownGeometry(new THREE.BufferGeometry().setFromPoints([vec(-bayW/2-.015,-bayH/2,trayLength/2+.027),vec(bayW/2-.015,-bayH/2,trayLength/2+.027),vec(bayW/2-.015,bayH/2,trayLength/2+.027),vec(-bayW/2-.015,bayH/2,trayLength/2+.027)])),bayLineMat);drawer.add(bayLine);
  meshBox(drawer,trayWidth,.07,.09,darkMetal,0,-.43,trayLength/2+.02);
  const rails=new THREE.Group();scene.add(rails);
  for(const side of [-1,1])meshBox(rails,.035,.055,3.5,silver,side*.9,.25,2.1);
  const packageGroup=new THREE.Group();drawer.add(packageGroup);
  const chipMat=photoMaterial(null),chipPositions=[];
  const packageWidth=.42,packageLength=.486;
  const packageRows=[.234,.444,.649,.837],packageColumns=[.321,.679];
  let selectedPackage;
  for(const row of packageRows)for(const col of packageColumns) {
    const x=(col-.5)*(trayWidth-.055),z=(row-.5)*(trayLength-.045);
    const group=new THREE.Group();group.position.set(x,trayTop+.028,z);packageGroup.add(group);
    meshBox(group,packageWidth,.029,packageLength,darkMetal,0,.005,0);
    const face=plane(group,packageWidth,packageLength,chipMat,0,.022,0,true);face.renderOrder=2;
    chipPositions.push({x,z,group});if(!selectedPackage)selectedPackage=group;
  }
  const cooling=new THREE.Group();drawer.add(cooling);
  const plates=new THREE.Group();cooling.add(plates);
  const copperTops=[];
  // Four visible cold plates follow the photographed upper bank. Lower blocks
  // remain dark cooling bars, instead of inventing hidden copper surfaces.
  const plateSources=[
    {x:1360,y:430,w:188,h:180,px:-.31,pz:-.78},
    {x:1655,y:430,w:195,h:180,px:.31,pz:-.78},
    {x:1355,y:650,w:193,h:180,px:-.31,pz:-.31},
    {x:1655,y:650,w:195,h:180,px:.31,pz:-.31}
  ];
  for(const source of plateSources) {
    const part=new THREE.Group();part.position.set(source.px,trayTop+.077,source.pz);plates.add(part);
    meshBox(part,.43,.06,.37,copperMaterial);
    const mat=photoMaterial(null);plane(part,.424,.364,mat,0,.031,0,true);copperTops.push({source,mat});
    for(const x of [-.18,.18])for(const z of [-.15,.15]){
      const screw=new THREE.Mesh(ownGeometry(new THREE.CylinderGeometry(.015,.015,.015,10)),silver);screw.position.set(x,.038,z);part.add(screw);
    }
  }
  for(const z of [.18,.72])meshBox(plates,1.08,.09,.17,graphite,0,trayTop+.12,z);
  const hoses=new THREE.Group();cooling.add(hoses);
  const hosePhotoMat=photoMaterial(null);hosePhotoMat.alphaTest=.025;
  const hosePhoto=plane(hoses,1.60,trayLength,hosePhotoMat,0,trayTop+.18,0,true);hosePhoto.visible=false;
  const hoseDepthMat=photoMaterial(null);hoseDepthMat.alphaTest=.025;hoseDepthMat.color.set('#696969');
  const hoseDepth=plane(hoses,1.60,trayLength,hoseDepthMat,0,trayTop+.16,0,true);hoseDepth.visible=false;hosePhoto.castShadow=true;hoseDepth.castShadow=true;
  const hosePaths=[];
  for(const side of [-1,1])for(let i=0;i<4;i++) {
    const x=side*(.25+i*.065),targetZ=[-.78,-.31,.18,.72][i];
    const points=[vec(side*.63,trayTop+.14,-1.16),vec(side*(.64+i*.012),trayTop+.22,-.6),vec(side*.57,trayTop+.24,targetZ+.2),vec(x,trayTop+.18,targetZ+.18),vec(x,trayTop+.14,targetZ)];
    const tube=new THREE.Mesh(ownGeometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),36,.022,7,false)),hoseMaterial);tube.castShadow=true;hoses.add(tube);hosePaths.push(tube);
  }
  // A fine deterministic normal-height texture gives the cooling parts their
  // material scale without manufacturing nonexistent board or routing detail.
  const bumpData=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const k=(y*64+x)*4,v=120+Math.round(32*Math.sin((x+y)*1.7)*Math.sin((x-y)*1.7));bumpData[k]=bumpData[k+1]=bumpData[k+2]=v;bumpData[k+3]=255;}
  const bump=new THREE.DataTexture(bumpData,64,64,THREE.RGBAFormat);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;bump.repeat.set(9,2);bump.needsUpdate=true;resourceTextures.add(bump);hoseMaterial.bumpMap=bump;hoseMaterial.bumpScale=.006;
  const copperBump=bump.clone();copperBump.repeat.set(1,12);copperBump.needsUpdate=true;resourceTextures.add(copperBump);copperMaterial.bumpMap=copperBump;copperMaterial.bumpScale=.0015;
  plates.traverse(object=>{if(object.isMesh&&object.material.isMeshStandardMaterial&&object.material.metalness>.85){object.material.bumpMap=copperBump;object.material.bumpScale=.0015;object.material.needsUpdate=true;}});
  const anatomy=new THREE.Group();selectedPackage.add(anatomy);
  const anatomyMat=material({color:'#ff642e',roughness:.6,metalness:.15,transparent:true,opacity:.14,depthWrite:false});
  const anatomyLines=[];
  function outline(w,d,x,z) {
    const mesh=meshBox(anatomy,w,.008,d,anatomyMat,x,.034,z);mesh.renderOrder=3;
    const edgeMat=new THREE.LineBasicMaterial({color:'#ff642e',transparent:true,opacity:.9,depthWrite:false});materials.add(edgeMat);
    const edges=new THREE.LineSegments(ownGeometry(new THREE.EdgesGeometry(mesh.geometry)),edgeMat);edges.position.copy(mesh.position);edges.renderOrder=3;anatomy.add(edges);anatomyLines.push(edges);
  }
  outline(.137,.172,0,0);
  for(const side of [-1,1])for(const z of[-.057,0,.057])outline(.057,.052,side*.103,z);
  const storage=new THREE.Group();selectedPackage.add(storage);
  const dieLid=new THREE.Group();selectedPackage.add(dieLid);
  const lidBody=meshBox(dieLid,.137,.008,.172,silver,0,.04,0);lidBody.material.depthWrite=false;lidBody.renderOrder=4;
  const dieLidMat=photoMaterial(null);dieLidMat.depthWrite=false;const lidFace=plane(dieLid,.136,.171,dieLidMat,0,.0445,0,true);lidFace.renderOrder=4;
  const storageFloorMat=material({color:'#272b2c',roughness:.8,metalness:.08,depthWrite:false});
  const storageFloor=meshBox(storage,.144,.004,.18,storageFloorMat,0,.052,0);storageFloor.renderOrder=2.5;
  const storageMat=material({color:'#b4b7b9',roughness:.56,metalness:.32,depthWrite:false});
  const storageAccent=material({color:'#df845e',roughness:.52,metalness:.3,depthWrite:false});
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){const tile=meshBox(storage,.026,.012,.031,(row+col)%5===0?storageAccent:storageMat,(col-1.5)*.031,.065,(row-1.5)*.037);tile.renderOrder=3;}
  const floor=new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(40,40)),new THREE.ShadowMaterial({opacity:.022}));materials.add(floor.material);floor.rotation.x=-Math.PI/2;floor.position.y=-3.56;floor.receiveShadow=true;scene.add(floor);
  const loadedTextures={};
  const loader=new THREE.TextureLoader();
  const loads=Object.entries(TEXTURES).map(async([key,url])=>{
    try {const texture=await loader.loadAsync(url);if(disposed){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());resourceTextures.add(texture);loadedTextures[key]=texture;}
    catch(error){state.errors.push(`${key}: ${error.message||'texture failed to load'}`);}
  });
  Promise.all(loads).then(()=>{
    if(disposed)return;
    const {rack:rackTexture,tray:trayTexture,chip:chipTexture,board:boardTexture,hoses:hoseTexture,coldplates:coldplateTexture}=loadedTextures;
    if(rackTexture) {
      photoPart(820,600,900,790,rackTexture);photoPart(820,1740,900,1230,rackTexture);photoPart(820,1390,210,350,rackTexture);photoPart(1500,1390,220,350,rackTexture);
      frontMat.map=cropped(rackTexture,bay.x,bay.y,bay.w,bay.h,2525,3200);frontMat.needsUpdate=true;
    }
    if(trayTexture) {
      trayPhotoMat.map=cropped(trayTexture,1190,275,820,1250,3200,1800);trayPhotoMat.needsUpdate=true;
      for(const {source,mat}of copperTops){mat.map=cropped(trayTexture,source.x,source.y,source.w,source.h,3200,1800);mat.needsUpdate=true;}
    }
    if(chipTexture){chipMat.map=cropped(chipTexture,1165,775,860,1010,3200,2562);chipMat.needsUpdate=true;dieLidMat.map=cropped(chipTexture,1450,1100,290,365,3200,2562);dieLidMat.needsUpdate=true;}
    if(boardTexture){boardMat.map=cropped(boardTexture,480,12,714,915,1672,941);boardMat.color.set('#ffffff');boardMat.needsUpdate=true;}
    if(hoseTexture){const hoseMap=cropped(hoseTexture,540,5,595,925,1672,941);hosePhotoMat.map=hoseMap;hoseDepthMat.map=hoseMap;hosePhotoMat.needsUpdate=true;hoseDepthMat.needsUpdate=true;hosePhoto.visible=true;hoseDepth.visible=true;for(const support of hosePaths)support.visible=false;}
    if(coldplateTexture){for(const {source,mat}of copperTops){mat.map=cropped(coldplateTexture,source.px<0?660:867,198,146,130,1672,941);mat.needsUpdate=true;}}
    ready=Object.keys(TEXTURES).every(key=>Boolean(loadedTextures[key]));
    state.loaded=ready;state.loading=false;host.dataset.hardwareLoaded=String(ready);host.dataset.hardwareErrors=String(state.errors.length);
    setPosition(position.chapter,position.progress,position.reducedMotion);
    options.onReady?.(cloneState(state));
  });
  const resizeObserver=new ResizeObserver(()=>{if(!disposed)renderPosition();});resizeObserver.observe(host);
  function updateSize() {
    const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
    if(canvas.width!==Math.floor(width*renderer.getPixelRatio())||canvas.height!==Math.floor(height*renderer.getPixelRatio()))renderer.setSize(width,height,false);
    aspect=width/height;camera.aspect=aspect;camera.updateProjectionMatrix();return {width,height};
  }
  function fitCamera(bounds,direction,up) {
    const target=bounds.getCenter(vec());camera.up.copy(up);camera.position.copy(target).addScaledVector(direction,10);camera.lookAt(target);camera.updateMatrixWorld();
    const e=camera.matrixWorld.elements,right=vec(e[0],e[1],e[2]),vertical=vec(e[4],e[5],e[6]),back=vec(e[8],e[9],e[10]);
    const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));let distance=.15;
    for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){
      const p=vec(x,y,z).sub(target),depth=p.dot(back);distance=Math.max(distance,depth+Math.abs(p.dot(right))/(tan*aspect),depth+Math.abs(p.dot(vertical))/tan);
    }
    camera.position.copy(target).addScaledVector(direction,distance*1.075+.025);camera.lookAt(target);camera.updateMatrixWorld();camera.updateProjectionMatrix();
  }
  function labelAt(key,point,shown,width,height) {
    const label=labels[key];label.hidden=!shown;if(!shown)return null;
    const projected=point.clone().project(camera),x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;
    label.style.left=`${Math.max(6,Math.min(width-100,x))}px`;label.style.top=`${Math.max(5,Math.min(height-32,y))}px`;
    return{x,y};
  }
  function renderPosition() {
    if(disposed)return cloneState(state);
    let{chapter,progress:p,reducedMotion}=position;
    if(reducedMotion)p=chapter===0?snap(p,[0,.2,.64,.9,1]):chapter===1?snap(p,[0,.35,.55,.7,.95,1]):snap(p,[0,.25,.5,1]);
    const extraction=chapter===0?p:1,separation=chapter<1?0:chapter===1?p:1,inside=chapter===2?p:chapter>2?1:0;
    const slide=smooth(.24,.64,extraction),orbit=smooth(.34,.9,extraction),rackFade=smooth(.45,.77,extraction);
    drawer.position.z=.105+3.05*slide;
    const selectedBay=smooth(.11,.17,extraction)*(1-smooth(.29,.38,extraction));bayLineMat.opacity=selectedBay;bayLine.visible=selectedBay>.001;
    setOpacity(rack,1-rackFade);setOpacity(rails,(1-smooth(.62,.88,extraction))*smooth(.25,.4,extraction));
    rackShell.visible=orbit>.001;
    const geometryReveal=smooth(0,.115,separation);
    const tubeLift=smooth(.12,.35,separation),plateLift=smooth(.35,.55,separation),packageZoom=smooth(.7,.95,separation);
    hoses.position.set(-.68*tubeLift,.92*tubeLift,0);hoses.rotation.z=.13*tubeLift;
    plates.position.set(.7*plateLift,.64*plateLift,-.08*plateLift);plates.rotation.z=-.08*plateLift;
    const coolingOpacity=geometryReveal*(1-smooth(.6,.76,separation));setOpacity(cooling,coolingOpacity);
    trayPhotoMat.opacity=1-geometryReveal;trayPhoto.visible=trayPhotoMat.opacity>.001;trayPhotoMat.depthWrite=trayPhotoMat.opacity>.98;
    setOpacity(packageGroup,smooth(.45,.58,separation));
    const anatomyReveal=smooth(.15,.25,inside)*(1-smooth(.53,.65,inside));anatomy.visible=anatomyReveal>.001;anatomy.traverse(object=>{if(object.material){object.material.depthWrite=false;if(object.isMesh)object.material.opacity=.14*anatomyReveal;}});for(const line of anatomyLines)line.material.opacity=.9*anatomyReveal;
    const cutaway=smooth(.4,.59,inside);storage.visible=cutaway>.001;storage.position.y=.018*cutaway;setOpacity(storage,cutaway);
    dieLid.visible=cutaway>.001;dieLid.position.set(.14*cutaway,.09*cutaway,-.07*cutaway);dieLid.rotation.z=-.12*cutaway;setOpacity(dieLid,cutaway*.76);
    drawer.updateMatrixWorld(true);
    const selectedCenter=selectedPackage.getWorldPosition(vec()).add(vec(0,.035,0));
    const rackBounds=orbit>.001?box(0,0,.05,2.85,7.1,2.85):box(0,0,1.405,2.65,6.98,.02),trayCenter=vec(0,drawer.position.y+.1,drawer.position.z),trayBounds=box(trayCenter.x,trayCenter.y,trayCenter.z,1.84,1.1,2.76);
    const openingBounds=rackBounds.clone().union(trayBounds);
    let frame=blendBox(openingBounds,trayBounds,smooth(.77,.9,extraction));
    if(chapter>=1){
      const coolingBounds=box(-.03,drawer.position.y+.65,drawer.position.z,3.16,1.9,2.85);
      frame=blendBox(trayBounds,coolingBounds,smooth(.1,.36,separation));
      frame=blendBox(frame,trayBounds,smooth(.55,.73,separation));
      frame=blendBox(frame,box(selectedCenter.x,selectedCenter.y,selectedCenter.z,.48,.11,.56),packageZoom);
    }
    if(chapter>=2)frame=box(selectedCenter.x,selectedCenter.y+.04*cutaway,selectedCenter.z,.49,.15+.13*cutaway,.57);
    const angle=lerp(0,Math.PI/2-.06,orbit),yaw=lerp(0,-.055,orbit);
    const direction=vec(Math.sin(yaw)*Math.cos(angle),Math.sin(angle),Math.cos(yaw)*Math.cos(angle)).normalize();
    const up=compact?vec(0,1,0).lerp(vec(1,0,0),smooth(.55,.9,extraction)).normalize():vec(0,1,0);
    const{width,height}=updateSize();fitCamera(frame,direction,up);
    const architectureMix=chapter<2?0:chapter===2?smooth(.6,.85,p):1;
    const photoPhase=chapter===0?(p<.22?'rack':p<.66?'extract':'tray'):chapter===1?(p<.55?'cooling':p<.7?'board':'package'):inside<.15?'package':inside<.4?'anatomy':'storage';
    const conceptual=chapter===0&&extraction>.25||chapter===1&&separation>.01||chapter>=2;
    note.hidden=!conceptual;note.textContent=chapter===0?'Photo-referenced reconstruction':chapter>=2?(inside<.15?'Official package photograph · illustrative board':inside<.4?'Package anatomy · inferred arrangement':'On-chip storage · conceptual cutaway'):'Cooling & board reconstruction · illustrative';
    note.style.opacity=String(1-architectureMix);
    const showAnatomy=chapter===2&&inside>=.15&&inside<.4;
    const computePoint=selectedCenter.clone().add(vec(.015,.035,0)),memoryPoint=selectedCenter.clone().add(vec(-.1,.035,.03));
    const anchors={
      compute:labelAt('compute',computePoint,showAnatomy,width,height),
      memory:labelAt('memory',memoryPoint,showAnatomy,width,height),
      storage:labelAt('storage',selectedCenter.clone().add(vec(0,.18,0)),chapter===2&&inside>=.4&&inside<.85,width,height),
      tray:labelAt('tray',drawer.localToWorld(vec(bayW/2,.22,trayLength/2+.04)),chapter===0&&selectedBay>.1,width,height)
    };
    for(const label of Object.values(labels))label.style.opacity=String(1-architectureMix);
    canvas.style.opacity=String(1-architectureMix);canvas.style.visibility=visible&&ready&&architectureMix<1?'visible':'hidden';
    host.dataset.hardwarePhase=photoPhase;host.dataset.hardwareConceptual=String(conceptual);host.dataset.hardwareReady=String(ready);
    state={...state,available:!contextLost,loaded:ready,phase:photoPhase,architectureMix,conceptual,anchors,chapter,progress:p,compact};
    if(visible&&ready&&!contextLost&&architectureMix<1&&!document.hidden)renderer.render(scene,camera);
    if(photoPhase!==lastPhase){lastPhase=photoPhase;options.onPhaseChange?.(cloneState(state));}
    return cloneState(state);
  }
  function setPosition(chapter,progress=0,reducedMotion=false) {
    position={chapter:Math.max(0,Math.round(Number(chapter)||0)),progress:clamp(progress),reducedMotion:Boolean(reducedMotion)};
    return renderPosition();
  }
  function setCompact(value,nextAspect) {compact=Boolean(value);if(Number.isFinite(Number(nextAspect))&&Number(nextAspect)>0)aspect=Number(nextAspect);}
  function setVisible(value) {const next=Boolean(value);if(next===visible)return;visible=next;host.style.display=visible?'':'none';if(visible)renderPosition();}
  const onVisibility=()=>{if(!document.hidden&&visible)renderPosition();};document.addEventListener('visibilitychange',onVisibility);
  const onContextLost=event=>{event.preventDefault();contextLost=true;state.available=false;state.errors.push('WebGL context lost; photographic fallback is available.');host.dataset.hardwareAvailable='false';canvas.style.visibility='hidden';options.onReady?.(cloneState(state));};
  const onContextRestored=()=>{contextLost=false;host.dataset.hardwareAvailable='true';renderPosition();options.onReady?.(cloneState(state));};
  canvas.addEventListener('webglcontextlost',onContextLost);canvas.addEventListener('webglcontextrestored',onContextRestored);
  function dispose() {
    if(disposed)return;disposed=true;resizeObserver.disconnect();document.removeEventListener('visibilitychange',onVisibility);canvas.removeEventListener('webglcontextlost',onContextLost);canvas.removeEventListener('webglcontextrestored',onContextRestored);
    resourceTextures.forEach(texture=>texture.dispose());geometries.forEach(geometry=>geometry.dispose());materials.forEach(mat=>mat.dispose());renderer.dispose();canvas.remove();note.remove();Object.values(labels).forEach(label=>label.remove());
  }
  setPosition(0,0,false);
  return {get available(){return state.available;},setPosition,setCompact,setVisible,dispose,getState:()=>cloneState(state),canvas};
}
