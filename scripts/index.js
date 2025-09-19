const GAME_SPEED = 150;
let gameStarted = false;

let directons = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
}

let currDirection = directons.RIGHT;
firstElementChild = null

const scores = [];

function reset() {
    const contributionArray = [...document.querySelectorAll('.ContributionCalendar-grid .ContributionCalendar-day')];
    contributionArray.forEach(contribution => contribution.setAttribute('data-level', 0));
}

// remove github events on keydown
setInterval(() => {
    document.querySelectorAll('[data-hotkey]').forEach(el => {
        el.removeAttribute('data-hotkey');
    });
}, 1000)

document.addEventListener('keypress', (event) => {
    switch (event.key) {
        case 'w':
            currDirection = directons.UP;
            break;
        case 's':
            currDirection = directons.DOWN;
            break;
        case 'd':
            currDirection = directons.RIGHT;
            break;
        case 'a':
            currDirection = directons.LEFT;
            break;
    }
});

function main() {
    const grid = document.querySelector('.ContributionCalendar-grid');
    const contributionGrid = [...grid.querySelectorAll('tr')]
        .map(tr => tr.querySelectorAll('.ContributionCalendar-day'))
        .filter(arr => arr.length > 0);

    reset();

    const yearListContainerList = document.getElementById('year-list-container').querySelector('ul');
    firstElementChild = yearListContainerList.firstElementChild;
    yearListContainerList.innerHTML = ''

    const contributionDescription = document.getElementById('js-contribution-activity-description');
    const originalContributionDescriptionText = contributionDescription.innerText.split(' ');

    let moveX = 0;
    let moveY = 0;
    let score = 0;

    updateScore();

    let snake = [{ x: 0, y: 0 }];
    let prevTailPosition = null;

    // Initialize the snake position
    snake[0].x = moveX;
    snake[0].y = moveY;

    let { fruitX, fruitY } = spawnFruit();

    // Main game loop
    setInterval(() => {
        playerHitFruit();
        move();
    }, GAME_SPEED);

    function spawnFruit() {
        const generateRanX = () => Math.floor(Math.random() * contributionGrid[moveY].length)
        const generateRanY = () => Math.floor(Math.random() * contributionGrid.length);

        let ranX = generateRanX();
        let ranY = generateRanY();

        while (isSnakeIntersectingFruit(ranX, ranY)) {
            ranX = generateRanX();
            ranY = generateRanY();
        }

        contributionGrid[ranY][ranX].setAttribute('data-level', 4);

        return {
            fruitX: ranX,
            fruitY: ranY,
        }
    }

    function move() {
        prevTailPosition = { ...snake[snake.length - 1] };
        const head = snake[0];

        // Move each segment to follow the one in front of it
        for (let i = snake.length - 1; i > 0; i--) {
            snake[i] = { ...snake[i - 1] };
        }

        // Move the head based on current direction
        if (currDirection === directons.RIGHT) {
            head.x++;
            if (head.x > contributionGrid[head.y].length - 1) {
                head.x = 0;
            }
        } else if (currDirection === directons.LEFT) {
            head.x--;
            if (head.x < 0) {
                head.x = contributionGrid[head.y].length - 1;
            }
        } else if (currDirection === directons.DOWN) {
            head.y++;
            if (head.y > contributionGrid.length - 1) {
                head.y = 0;
            }
        } else if (currDirection === directons.UP) {
            head.y--;
            if (head.y < 0) {
                head.y = contributionGrid.length - 1;
            }
        }

        // Clear the old tail position (unless we just ate a fruit)
        if (prevTailPosition) {
            contributionGrid[prevTailPosition.y][prevTailPosition.x].setAttribute('data-level', 0);
        }

        snake.forEach((pos, index) => {
            if (index > 0) {
                const { x, y } = pos;

                if (head.x === x && head.y === y) {
                    console.log('GAME OVER');
                    gameOver();
                }
            }
        })

        drawSnake();
    }

    function drawSnake() {
        snake.forEach((pos, index) => {
            const { x, y } = pos;
            const level = index === 0 ? 3 : 2;

            if (x !== fruitX || y !== fruitY) {
                contributionGrid[y][x].setAttribute('data-level', level);
            }
        });
    }

    function playerHitFruit() {
        const head = snake[0];

        if (head.x === fruitX && head.y === fruitY) {
            updateScore();

            // Add a new segment at the previous tail position
            if (prevTailPosition) {
                snake.push(prevTailPosition);
                contributionGrid[prevTailPosition.y][prevTailPosition.x].setAttribute('data-level', 1);
            }

            const newFruitPos = spawnFruit();
            fruitX = newFruitPos.fruitX;
            fruitY = newFruitPos.fruitY;
        }
    }

    function gameOver() {
        scores.push(score);
        const clones = [];

        const yearListContainerList = document.getElementById('year-list-container').querySelector('ul');
        yearListContainerList.innerHTML = '';

        const maxScore = Math.max(...scores);

        scores.forEach(currScore => {
            const clone = firstElementChild.cloneNode(true);
            const a = clone.querySelector('a');
            a.innerText = currScore;

            if (currScore === maxScore) {
                a.setAttribute('aria-current', true);
            } else {
                a.removeAttribute('aria-current');
            }

            yearListContainerList.appendChild(clone);
        })

        snake = [{ x: 0, y: 0 }];
        moveX = 0;
        moveY = 0;
        score = 0;
        prevTailPosition = null;
    }

    function isSnakeIntersectingFruit(currFruitX, currFruitY) {
        return snake.filter((pos) => {
            const { x, y } = pos;

            if (x === currFruitX && y === currFruitY) {
                return true;
            }

            return false;
        }).length > 0;
    }

    function updateScore() {
        originalContributionDescriptionText[0] = score;
        contributionDescription.innerText = originalContributionDescriptionText.join(' ');

        score++;
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    main();
});