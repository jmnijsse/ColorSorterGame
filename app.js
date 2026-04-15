let tubes = [];
let selected = null;
let history = [];
let bouncing = null; // { tube: i }
let level = 1;

const COLORS = [
    "#ff2d2d", // rood
    "#0066ff", // blauw
    "#00c853", // groen
    "#ffcc00", // geel
    "#aa00ff", // paars
    "#ff6d00"  // oranje
];

function getDifficulty(level) {
    const colorCount = Math.min(4 + Math.floor((level - 1) / 2), 6);
    const tubeCount = colorCount + 2 + Math.floor(level / 5);

    return { colorCount, tubeCount };
}

function generateLevel() {
    const { colorCount, tubeCount } = getDifficulty(level);

    let pool = [];

    for (let i = 0; i < colorCount; i++) {
        for (let j = 0; j < 4; j++) {
            pool.push(COLORS[i]);
        }
    }

    pool.sort(() => Math.random() - 0.5);

    tubes = [];
    for (let i = 0; i < tubeCount; i++) {
        tubes.push([]);
    }

    pool.forEach((color, i) => {
        tubes[i % colorCount].push(color);
    });

    history = [];
    selected = null;
}

function render() {
    const game = document.getElementById("game");
    game.innerHTML = "";

    tubes.forEach((tube, i) => {
        const div = document.createElement("div");
        div.className = "tube";

        if (i === selected) div.classList.add("selected");

        tube.forEach((color, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = "color";

            const marble = document.createElement("div");
            marble.className = "marble";

            marble.style.background = `radial-gradient(circle at 30% 30%, white, ${color})`;

            // 👉 alleen de bovenste knikker laten bouncen
            if (
                bouncing &&
                bouncing.tube === i &&
                index === tube.length - 1
            ) {
                marble.classList.add("bounce");
            }

            wrapper.appendChild(marble);
            div.appendChild(wrapper);
        });

        div.onclick = () => clickTube(i);
        game.appendChild(div);
    });
}

function clickTube(i) {
    if (selected === null) {
        if (tubes[i].length > 0) {
            selected = i;

            // 👉 trigger bounce alleen hier
            bouncing = { tube: i };

            render();

            // reset bounce na animatie
            setTimeout(() => {
                bouncing = null;
                render();
            }, 350);

            return;
        }
    } else {
        move(selected, i);
        selected = null;
    }

    render();
    checkWin();
}

function move(from, to) {
    if (from === to) return;
    if (tubes[from].length === 0) return;

    let source = tubes[from];
    let target = tubes[to];

    let color = source[source.length - 1];

    // tel hoeveel dezelfde kleur bovenop liggen
    let count = 0;
    for (let i = source.length - 1; i >= 0; i--) {
        if (source[i] === color) count++;
        else break;
    }

    // check hoeveel er in target mogen
    let space = 4 - target.length;

    if (
        space > 0 &&
        (target.length === 0 || target[target.length - 1] === color)
    ) {
        let moveCount = Math.min(count, space);

        history.push(JSON.stringify(tubes));

        // 👉 animatie triggeren
        animateMove(from, to, moveCount);

        // 👉 pas NA animatie echt verplaatsen
        setTimeout(() => {
            for (let i = 0; i < moveCount; i++) {
                target.push(source.pop());
            }
            render();
            checkWin();
        }, 300);
    }
}

function undo() {
    if (history.length > 0) {
        tubes = JSON.parse(history.pop());
        render();
    }
}

function checkWin() {
    let win = tubes.every(tube =>
        tube.length === 0 ||
        (tube.length === 4 && tube.every(c => c === tube[0]))
    );

    if (win) {
        setTimeout(() => {
            level++;
            alert("🎉 Level " + level);

            generateLevel();
            render();
        }, 200);
    }
}

function animateMove(from, to, count) {
    const game = document.getElementById("game");
    const tubesDOM = game.children;

    const fromTube = tubesDOM[from];
    const toTube = tubesDOM[to];

    const fromRect = fromTube.getBoundingClientRect();
    const toRect = toTube.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        const marble = document.createElement("div");
        marble.className = "marble flying";

        marble.style.background = `radial-gradient(circle at 30% 30%, white, ${
            tubes[from][tubes[from].length - 1 - i]
        })`;

        marble.style.position = "fixed";
        marble.style.left = fromRect.left + 12 + "px";
        marble.style.top = fromRect.top + 20 + "px";

        document.body.appendChild(marble);

        animateParabola(marble, fromRect, toRect, i * 80);
    }
}

function animateParabola(el, from, to, delay = 0) {
    const duration = 400;

    const startX = from.left + 12;
    const startY = from.top + 20;

    const endX = to.left + 12;
    const endY = to.top + 20;

    const height = -80; // hoe hoog de boog

    let startTime = null;

    setTimeout(() => {
        function frame(time) {
            if (!startTime) startTime = time;
            let t = (time - startTime) / duration;

            if (t > 1) t = 1;

            // easing (smooth start/end)
            let ease = t * (2 - t);

            // lineaire x
            let x = startX + (endX - startX) * ease;

            // parabool y
            let y =
                startY +
                (endY - startY) * ease +
                height * (4 * ease * (1 - ease));

            el.style.transform = `translate(${x - startX}px, ${y - startY}px)`;

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                el.remove();
            }
        }

        requestAnimationFrame(frame);
    }, delay);
}
// start
generateLevel();
render();
