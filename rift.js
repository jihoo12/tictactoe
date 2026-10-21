// DIMENSION RIFT: an optional rotating-layer variant of 3D Tic-Tac-Toe.
// Loaded after script.js; classic modes remain unchanged.
(() => {
    const classicMove = makeMove;
    const classicBot = botTurn;
    const classicReset = resetGame;
    const classicSetDifficulty = setDifficulty;
    const riftHint = document.getElementById('rift-hint');
    const sequence = [
        {axis:'y', layer:1}, {axis:'x', layer:0},
        {axis:'z', layer:2}, {axis:'y', layer:0},
        {axis:'x', layer:2}, {axis:'z', layer:1}
    ];
    const axisLabel = { x:'좌우(X)', y:'상하(Y)', z:'앞뒤(Z)' };
    let shiftCount = 0;
    let pendingBot = null;

    function enabled() { return difficulty === 'rift'; }
    function nextShift() { return sequence[shiftCount % sequence.length]; }
    function label() {
        const s = nextShift();
        return '다음 차원 이동: ' + axisLabel[s.axis] + '축 · ' + (s.layer + 1) + '번째 층 · 90°';
    }
    function showHint() {
        riftHint.hidden = !enabled();
        if (enabled()) riftHint.textContent = '🌀 ' + label() + ' | AI가 착수한 직후 발동';
    }
    function rotate(state, s) {
        const result = state.slice();
        for (let x=0;x<3;x++) for (let y=0;y<3;y++) for (let z=0;z<3;z++) {
            const coord = {x,y,z};
            if (coord[s.axis] !== s.layer) continue;
            let nx=x, ny=y, nz=z;
            if (s.axis === 'x') { ny=2-z; nz=y; }
            if (s.axis === 'y') { nx=z; nz=2-x; }
            if (s.axis === 'z') { nx=2-y; ny=x; }
            result[nx*9+ny*3+nz] = state[x*9+y*3+z];
        }
        return result;
    }
    function renderState() {
        gridSlots.forEach((mesh,i) => {
            const v = boardState[i];
            mesh.material.color.setHex(v === 1 ? P1_COLOR : v === 2 ? P2_COLOR : EMPTY_COLOR);
            mesh.material.opacity = v ? 1 : 0.25;
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0;
            mesh.scale.setScalar(v ? 1.12 : 1);
        });
    }
    function finish(winner, line) {
        gameOver = true;
        isBotThinking = false;
        if (line) highlightWinningLine(line);
        turnDisplay.textContent = winner === 1 ? '🏆 차원을 정복했습니다!' :
            winner === 2 ? '🌀 차원에 패배했습니다!' : '🤝 시공간 무승부';
        turnDisplay.style.color = winner === 1 ? '#ff6b6b' : winner === 2 ? '#7db5ff' : '#fff';
        statusDisplay.textContent = '다시 시작하려면 Reset Game을 누르세요.';
        showHint();
    }
    function outcome(state) {
        const h = getWinningLine(state,1), b = getWinningLine(state,2);
        if (h && b) return {winner:0, line:null, ended:true};
        if (h) return {winner:1, line:h, ended:true};
        if (b) return {winner:2, line:b, ended:true};
        if (!state.includes(0)) return {winner:0, line:null, ended:true};
        return {ended:false};
    }
    function commitMove(idx, player) {
        if (gameOver || boardState[idx] !== 0 || player !== currentPlayer) return;
        boardState[idx] = player;
        renderState();
        let result = outcome(boardState);
        if (result.ended) { finish(result.winner,result.line); return; }
        if (player === 2) {
            const shifted = rotate(boardState, nextShift());
            boardState.splice(0,27,...shifted);
            shiftCount++;
            renderState();
            showHint();
            result = outcome(boardState);
            if (result.ended) { finish(result.winner,result.line); return; }
            currentPlayer = 1;
            turnDisplay.textContent = '당신의 차례 🔴';
            turnDisplay.style.color = '#fff';
            statusDisplay.textContent = '회전된 공간을 읽고 다음 수를 선택하세요.';
        } else {
            currentPlayer = 2;
            isBotThinking = true;
            turnDisplay.textContent = '🌀 차원 AI가 미래를 계산 중…';
            turnDisplay.style.color = '#7db5ff';
            statusDisplay.textContent = '이번 AI 착수 직후: ' + label();
            pendingBot = window.setTimeout(() => {
                pendingBot = null;
                if (!enabled() || gameOver || currentPlayer !== 2) return;
                isBotThinking = false;
                const idx = chooseRiftMove(boardState.slice());
                if (idx !== -1) commitMove(idx,2);
            }, 180);
        }
    }
    // Score uncontested lines, immediate threats, and central control.
    function score(state) {
        let total=0;
        for (const line of winningLines) {
            let h=0,b=0;
            for (const i of line) { h += state[i] === 1; b += state[i] === 2; }
            if (h && b) continue;
            if (b) total += b === 2 ? 32 : 3;
            if (h) total -= h === 2 ? 40 : 4;
        }
        if (state[13] === 2) total += 9;
        if (state[13] === 1) total -= 9;
        return total;
    }
    // All forcing moves survive beam pruning, including wins created by a rotation.
    function immediateWins(state, player, phase) {
        const wins = [];
        for (const i of emptyIndices(state)) {
            const next = state.slice(); next[i] = player;
            if (checkWin(next, player)) { wins.push(i); continue; }
            if (player === 2) {
                const end = outcome(next);
                if (!end.ended && outcome(rotate(next,sequence[phase % sequence.length])).winner === 2)
                    wins.push(i);
            }
        }
        return wins;
    }
    function tacticalMoves(state, player, phase, limit) {
        const wins = immediateWins(state,player,phase);
        if (wins.length) return wins;
        const opponent = player===1 ? 2 : 1;
        // A human's immediate wins must be blocked; likewise protect against
        // the bot winning on its next placement/rotation.
        const threats = new Set(immediateWins(state,opponent,phase));
        const moves = emptyIndices(state).map(i => {
            const next=state.slice(); next[i]=player;
            const after = player===2 && !outcome(next).ended ?
                rotate(next,sequence[phase % sequence.length]) : next;
            let value = score(after);
            if (player===2) {
                const responseWins=immediateWins(after,1,phase+1);
                value -= responseWins.length ? 12000 + responseWins.length*400 : 0;
                value += immediateWins(after,2,phase+1).length*800;
            } else {
                value += immediateWins(after,2,phase).length*12000;
            }
            return {i, value, forcing:threats.has(i)};
        });
        moves.sort((a,b) => {
            if (a.forcing!==b.forcing) return a.forcing?-1:1;
            return player===2 ? b.value-a.value : a.value-b.value;
        });
        // Preserve every forcing block even if it exceeds the normal beam width.
        const chosen=moves.slice(0,limit);
        for (const m of moves.slice(limit)) if (m.forcing) chosen.push(m);
        return chosen.map(m=>m.i);
    }
    const cache = new Map();
    let explored = 0;
    const MAX_NODES = 55000;
    function search(state, depth, player, alpha, beta, phase) {
        explored++;
        const end=outcome(state);
        if (end.ended) return end.winner===2 ? 1000000+depth*10000 :
            end.winner===1 ? -1000000-depth*10000 : 0;
        const forcing=immediateWins(state,player,phase);
        if (forcing.length) return player===2 ? 1000000+depth*10000 :
            -1000000-depth*10000;
        if (depth===0 || explored>=MAX_NODES) {
            // Avoid evaluating a position as safe if the next player can win at once.
            return score(state);
        }
        const key=state.join('')+'|'+depth+'|'+player+'|'+(phase%sequence.length);
        if (cache.has(key)) return cache.get(key);
        const maximizing=player===2;
        let best=maximizing ? -Infinity : Infinity;
        const moves=tacticalMoves(state,player,phase,depth>=3?9:12);
        let cut=false;
        for (const i of moves) {
            const next=state.slice(); next[i]=player;
            const after=player===2 && !outcome(next).ended ? rotate(next,sequence[phase % sequence.length]) : next;
            const value=search(after,depth-1,player===2?1:2,alpha,beta,phase+(player===2?1:0));
            best=maximizing ? Math.max(best,value) : Math.min(best,value);
            if (maximizing) alpha=Math.max(alpha,best); else beta=Math.min(beta,best);
            if (beta<=alpha) { cut=true; break; }
        }
        // Alpha/beta cutoff results are bounds, not exact transposition values.
        if (!cut && explored<MAX_NODES) cache.set(key,best);
        return best;
    }
    function chooseRiftMove(state) {
        const moves=emptyIndices(state);
        if (!moves.length) return -1;
        const instant=immediateWins(state,2,shiftCount);
        if (instant.length) return instant[0];
        // Full-width at the root; deeper search uses tactical move ordering.
        // A stable tie-break prefers stronger positions over arbitrary first indices.
        const ordered=tacticalMoves(state,2,shiftCount,27);
        let best=-Infinity,bestIndex=ordered[0];
        cache.clear(); explored=0;
        for (const i of ordered) {
            const next=state.slice(); next[i]=2;
            const transformed=outcome(next).ended ? next : rotate(next,nextShift());
            const val=search(transformed,4,1,-Infinity,Infinity,shiftCount+1);
            if (val>best) { best=val; bestIndex=i; }
        }
        return bestIndex;
    }

    makeMove = function(index) {
        if (!enabled()) return classicMove(index);
        if (currentPlayer===1 && !isBotThinking) commitMove(index,1);
    };
    botTurn = function() {
        if (!enabled()) return classicBot();
        if (gameOver || currentPlayer!==2) return;
        isBotThinking=false;
        const move=chooseRiftMove(boardState.slice());
        if (move!==-1) commitMove(move,2);
    };
    resetGame = function() {
        if (pendingBot !== null) { clearTimeout(pendingBot); pendingBot=null; }
        shiftCount=0;
        classicReset();
        showHint();
        if (enabled()) {
            turnDisplay.textContent='당신의 차례 🔴';
            statusDisplay.textContent='한 라운드마다 큐브의 한 층이 90° 회전합니다.';
        }
    };
    setDifficulty = function(value) {
        if (pendingBot !== null) { clearTimeout(pendingBot); pendingBot=null; }
        classicSetDifficulty(value);
        showHint();
    };
    showHint();
})();
