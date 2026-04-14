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
    const colorCount = Math.min(3 + Math.floor(level / 3), 6);
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

    let color = tubes[from][tubes[from].length - 1];
    let target = tubes[to];

    if (target.length < 4 &&
        (target.length === 0 || target[target.length - 1] === color)) {

        // save state (undo)
        history.push(JSON.stringify(tubes));

        target.push(tubes[from].pop());
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

// start
generateLevel(3);
render();
