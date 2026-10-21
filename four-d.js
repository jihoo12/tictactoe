// HYPERCUBE: actual 4D tic-tac-toe on 3^4=81 positions.
(() => {
  const previousReset=resetGame, previousDifficulty=setDifficulty;
  const hint=document.getElementById('four-d-hint');
  const spheres=[], lines=[], weights=new Array(81).fill(0);
  const state=new Array(81).fill(0);
  const ix=(x,y,z,w)=>w*27+x*9+y*3+z;
  const active=()=>difficulty==='4d';
  let turn=1, finished=false, timer=null, built=false;
  const point=new THREE.Vector2(), ray=new THREE.Raycaster();
  const originalCamera=new THREE.Vector3(6,6,10);
  const directions=[];
  // Unique 4D straight-line directions; first nonzero component is positive.
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)
  for(let c=-1;c<=1;c++)for(let d=-1;d<=1;d++){
    const v=[a,b,c,d], first=v.find(n=>n!==0);
    if(first===1) directions.push(v);
  }
  for(let w=0;w<3;w++)for(let x=0;x<3;x++)
  for(let y=0;y<3;y++)for(let z=0;z<3;z++){
    const p=[x,y,z,w];
    for(const v of directions){
      if(!p.every((n,i)=>n+2*v[i]>=0&&n+2*v[i]<3))continue;
      if(p.every((n,i)=>n-v[i]>=0&&n-v[i]<3))continue;
      const line=[0,1,2].map(t=>ix(x+t*v[0],y+t*v[1],z+t*v[2],w+t*v[3]));
      lines.push(line);
      line.forEach(i=>weights[i]++);
    }
  }
  function winner(s,player){
    return lines.find(([a,b,c])=>s[a]===player&&s[b]===player&&s[c]===player);
  }
  function empty(s){const out=[];for(let i=0;i<81;i++)if(!s[i])out.push(i);return out;}
  function winMoves(s,player){
    const set=new Set();
    for(const [a,b,c] of lines){
      const triplet=[s[a],s[b],s[c]];
      if(triplet.filter(v=>v===player).length===2 && triplet.filter(v=>v===0).length===1){
        if(!s[a])set.add(a);if(!s[b])set.add(b);if(!s[c])set.add(c);
      }
    }
    return [...set];
  }
  function evaluate(s){
    let val=0;
    for(const [a,b,c] of lines){
      const p=(s[a]===2)+(s[b]===2)+(s[c]===2);
      const h=(s[a]===1)+(s[b]===1)+(s[c]===1);
      if(p&&h)continue;
      if(p) val+=p===2?28:2;
      if(h) val-=h===2?34:3;
    }
    return val;
  }
  function choose(s){
    const wins=winMoves(s,2);if(wins.length)return wins[0];
    const threats=winMoves(s,1);
    const moves=empty(s);
    const choices=threats.length ? threats : moves;
    let best=-Infinity, selected=choices[0];
    // Exact immediate threats, fork potential, and one adversarial reply.
    // All 81 legal candidate moves are considered at the root.
    for(const i of choices){
      s[i]=2;
      const enemyWins=winMoves(s,1);
      const botForks=winMoves(s,2);
      let value=evaluate(s)+weights[i]*0.5+botForks.length*150;
      if(enemyWins.length)value-=50000+enemyWins.length*400;
      // Opponent selects the most damaging reply from plausible candidates.
      if(!enemyWins.length){
        const replies=empty(s).map(j=>{
          s[j]=1;const v=evaluate(s);s[j]=0;
          return {j,v};
        }).sort((a,b)=>a.v-b.v).slice(0,6);
        let min=Infinity;
        for(const {j} of replies){
          s[j]=1;
          const danger=winMoves(s,1).length;
          const counter=winMoves(s,2).length;
          const v=evaluate(s)-danger*350+counter*200;
          s[j]=0;
          min=Math.min(min,v);
        }
        if(min!==Infinity)value+=min;
      }
      s[i]=0;
      if(value>best){best=value;selected=i;}
    }
    return selected;
  }
  function build(){
    if(built)return;built=true;
    const geom=new THREE.SphereGeometry(.27,16,12);
    for(let w=0;w<3;w++)for(let x=0;x<3;x++)
    for(let y=0;y<3;y++)for(let z=0;z<3;z++){
      const mesh=new THREE.Mesh(geom,new THREE.MeshPhongMaterial({
        color:0xffffff,transparent:true,opacity:.23,shininess:90
      }));
      mesh.position.set((w-1)*7.3+(x-1)*1.65,(y-1)*1.65,(z-1)*1.65);
      const i=ix(x,y,z,w);mesh.userData.index4d=i;
      mesh.visible=false;scene.add(mesh);spheres[i]=mesh;
    }
  }
  function draw(line){
    spheres.forEach((mesh,i)=>{
      const v=state[i];mesh.material.color.setHex(v===1?0xff3b30:v===2?0x007aff:0xffffff);
      mesh.material.opacity=v?1:.23;
      mesh.material.emissive.setHex(0);
      mesh.scale.setScalar(v?1.25:1);
    });
    if(line)line.forEach(i=>{
      const m=spheres[i];m.material.color.setHex(0xffd700);
      m.material.emissive.setHex(0x664400);m.scale.setScalar(1.6);
    });
  }
  function finish(player,line){
    finished=true;turn=0;isBotThinking=false;gameOver=true;
    draw(line);
    turnDisplay.textContent=player===1?'🏆 4차원 정복 성공!':player===2?'💠 HYPERCUBE AI 승리':'4차원 무승부';
    statusDisplay.textContent='Reset Game으로 다시 도전하세요.';
  }
  function place(i,player){
    if(!active()||finished||turn!==player||state[i])return;
    state[i]=player;draw();
    const line=winner(state,player);
    if(line){finish(player,line);return;}
    if(!state.includes(0)){finish(0,null);return;}
    turn=3-player;currentPlayer=turn;
    if(turn===2){
      isBotThinking=true;turnDisplay.textContent='💠 4D AI 분석 중…';
      timer=setTimeout(()=>{
        timer=null;
        if(!active()||finished||turn!==2)return;
        const j=choose(state);
        isBotThinking=false;
        place(j,2);
      },160);
    }else{
      turnDisplay.textContent='🔴 당신의 차례 · 4D';
      statusDisplay.textContent='3개의 W 슬라이스를 넘나들며 4차원 직선을 완성하세요.';
    }
  }
  function show(){
    const on=active();
    build();
    gridSlots.forEach(m=>m.visible=!on);
    spheres.forEach(m=>m.visible=on);
    hint.hidden=!on;
    if(on){
      camera.position.set(0,9,25);
      controls.target.set(0,0,0);controls.update();
      hint.textContent='W=0 (왼쪽)  ◇  W=1 (중앙)  ◇  W=2 (오른쪽)  |  81칸 · '+lines.length+'개 승리선';
    }else{
      camera.position.copy(originalCamera);
      controls.target.set(0,0,0);controls.update();
    }
  }
  function restart(){
    if(timer!==null){clearTimeout(timer);timer=null;}
    previousReset();
    state.fill(0);turn=1;finished=false;
    if(active()){
      gameOver=false;currentPlayer=1;isBotThinking=false;
      turnDisplay.textContent='🔴 당신의 차례 · 4D';
      statusDisplay.textContent='4D 대각선까지 연결해 3목을 만드세요.';
      draw();
    }
  }
  resetGame=function(){restart();};
  setDifficulty=function(value){
    // Set difficulty without dispatching an old-mode bot on 4D.
    previousDifficulty(value);show();
    if(value==='4d')restart();
  };
  // Capture phase prevents classic 3D click handler firing in 4D.
  window.addEventListener('pointerdown',e=>{
    if(!active()||e.target!==renderer.domElement)return;
    e.stopImmediatePropagation();
    if(finished||turn!==1||isBotThinking)return;
    point.set(e.clientX/window.innerWidth*2-1,-e.clientY/window.innerHeight*2+1);
    ray.setFromCamera(point,camera);
    const hits=ray.intersectObjects(spheres);
    if(hits.length)place(hits[0].object.userData.index4d,1);
  },true);
  window.hypercubeReady=true;
})();
