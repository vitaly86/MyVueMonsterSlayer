function damage(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
}

function heal(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
}

function refreshPage() {
    location.reload();
}

function scrollUp() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



const game = Vue.createApp({
    data() {
        return {
            // Start Game Setup
            startCountDown: 3,
            numberRounds: 0,
            validateStart: false,
            startCountInterval: [],
            transition: false,

            // Game Setup
            htmlLogsList: {
                logsRound: [[]],
                resultRound: []
            },
            attackInterval: [],
            endGame: false,
            intervalEntry: false,
            validateEvent: true,
            logAttackAction: "attacks and deals",
            logSuperAttackAction: "super attacks and deals",
            logHealAction: "heals himself for",
            roundMessage: "",
            gameMessage: "",
            score: 0,
            numberRounds: 3,
            rounds: 0,

            // Player Setup
            playerHealth: 100,
            playerAttack: 0,
            setSuperAttack: 3,
            playerHeal: 0,
            healIndex: 0,
            logPlayerRolle: "Player",
            logHealAction: "heals himself for",
            attack: true,
            superAttack: true,
            heal: false,
            activateHeal: false,
            currentHealActivate: false,
            surrender: false,

            // Monster Setup
            monsterHealth: 100,
            monsterAttack: 0,
            logMonsterRolle: "Monster",
            monsterResponse: false,
            monsterLateResponse: false,
            monsterHealResponse: true,

            // Invalidate buttons
            optionButtons: {
                toggleSimpleAttack: true,
                toggleSpecialAttack: true,
                toggleHeal: true,
                toggleSurrender: true
            }
        }
    },
    watch: {
        playerHealth(value) {
            if (this.rounds <= this.numberRounds) {
                if (value <= 0) {
                    this.validateStart = false;
                    setTimeout(async () => {
                        this.controlStartGame();
                        await delay(3000);
                        setTimeout(() => {
                            this.nextRound();
                        }, 0);
                    }, 1000);
                }
            }
        },
        monsterHealth(value) {
            if (this.rounds <= this.numberRounds) {
                if (value <= 0) {
                    this.score++;
                    this.validateStart = false;
                    this.transition = true;
                    setTimeout(async () => {
                        this.controlStartGame();
                        await delay(3000);
                        setTimeout(() => {
                            this.nextRound();
                        }, 0);
                    }, 1000);
                } else if (value === 100 && this.rounds) {
                    this.clearAllIntervals(this.attackInterval);
                    this.attackInterval.push(this.attackIntern);
                }
            }
        }
    },

    computed: {
        healthMonsterBar() {
            return `${this.monsterHealth}%`;
        },
        healthPlayerBar() {
            return `${this.playerHealth}%`;
        },
        simpleAttackPlayer() {
            if (this.$refs['simpleAttack']) {
                [this.attack, this.monsterResponse] = [this.monsterResponse, this.attack];
            }
        },
        superAttackPlayer() {
            if (this.$refs['specialAttack']) {
                [this.superAttack, this.monsterLateResponse] = [this.monsterLateResponse, this.superAttack];
            }
        },
        healActionResponse() {
            if (this.$refs['heal']) {
                [this.heal, this.monsterHealResponse] = [this.monsterHealResponse, this.heal];
            }
        },
        monsterResultConfig() {
            this.monsterAttack = damage(8, 15);
            this.playerHealth -= this.monsterAttack;
            if (this.playerHealth <= 0) {
                this.playerHealth = 0;
                if (!this.playerHealth) {
                    this.roundMessage = "Loss!";
                    this.htmlLogsList.resultRound.push(this.roundMessage);
                }
            }
            if (this.activateHeal === false) {
                this.healIndex++;
            }
            this.battleLogList(this.logMonsterRolle, this.logAttackAction, this.monsterAttack,
                'log--monster', 'log--damage');
            this.validateButtonsReturn;
        },
        attackIntern() {
            return null;
        },
        validateButtonsReturn() {
            for (let key of Object.keys(this.optionButtons)) {
                this.optionButtons[key] = true;
                console.log('Keys: ' + key);
                console.log(this.optionButtons[key]);
            }
            this.validateEvent = true;
        },
        displayFinalMessage() {
            if (this.rounds == 3 && (!this.monsterHealth || this.playerHealth)) {
                this.endGame = true;
                if (this.score < 2) {
                    this.gameMessage = "End Game! You loss!";
                } else {
                    this.gameMessage = "End Game! You wonn!";
                }
            }
            return this.gameMessage;
        }
    },
    methods: {

        // Start Game Methods Configuration

        startGameSetup() {
            if (this.startCountDown > 0) {
                console.log(this.startCountDown);
                this.startCountDown--;
                if (!this.startCountDown) {
                    this.validateStart = true;
                }

                return this.startCountDown;
            }
        },
        controlStartGame() {
            const that = this;
            this.startCountDown = 3;
            this.validateStart = false;
            this.clearAllIntervals(this.startCountInterval);
            const myIntervalId = setInterval(() => {
                that.startGameSetup();
                if (!that.startGameSetup) {
                    clearInterval(this.startCountInterval[0]);
                    this.removeIntervalId(this.startCountInterval, this.startCountInterval[0]);
                }
            }, 1000);
            this.startCountInterval.push(myIntervalId);
        },
        removeIntervalId(myInterval, interval) {
            myInterval = myInterval.filter(id => id !== interval);
        },
        clearAllIntervals(myInterval) {
            myInterval.forEach(intervalID => clearInterval(intervalID));
            myInterval = [];
        },
        invalidateButtons(event, ref) {
            if (this.validateEvent) {
                for (let key of Object.keys(this.optionButtons)) {
                    if (key !== ref) {
                        this.optionButtons[key] = false;
                    }
                }
                this.validateEvent = false;
            }
        },

        // Player Methods Configuration

        playerRoundAttack() {
            if (this.$refs['monster'] && this.attack && this.optionButtons['toggleSimpleAttack']) {
                this.playerAttack = damage(5, 12);
                this.monsterHealth -= this.playerAttack;
                if (this.monsterHealth <= 0) {
                    this.monsterHealth = 0;
                    if (!this.monsterHealth) {
                        this.roundMessage = "Winn!";
                        this.htmlLogsList.resultRound.push(this.roundMessage);
                    }
                }
                this.simpleAttackPlayer;
                this.battleLogList(this.logPlayerRolle, this.logAttackAction, this.playerAttack,
                    'log--player', 'log--damage');

                this.prepareSpecialAttack();
            }
        },
        prepareSpecialAttack() {
            if (!this.setSuperAttack) {
                this.setSuperAttack = 3;
                this.superAttackPlayer;
            } else if (this.setSuperAttack < 3) {
                this.setSuperAttack--;
            }
        },
        playerSpecialRoundAttack() {
            if (this.setSuperAttack === 3 && this.optionButtons['toggleSpecialAttack']) {
                if (this.$refs['monster'] && this.superAttack) {
                    this.playerAttack = damage(10, 25);
                    this.monsterHealth -= this.playerAttack;
                    if (this.monsterHealth <= 0) {
                        this.monsterHealth = 0;
                        if (!this.monsterHealth) {
                            this.roundMessage = "Winn!";
                            this.htmlLogsList.resultRound.push(this.roundMessage);
                        }
                    }
                    this.battleLogList(this.logPlayerRolle, this.logSuperAttackAction, this.playerAttack,
                        'log--player', 'log--damage');
                    this.monsterLongRoundAttack();
                }
                this.superAttackPlayer;
                this.setSuperAttack--;
            }
        },
        playerRoundHeal() {
            if (this.optionButtons['toggleHeal']) {
                this.playerHeal = heal(8, 20);
                this.playerHealth += this.playerHeal;
                if (this.playerHealth >= 100) {
                    this.playerHealth = 100;
                } else {
                    this.battleLogList(this.logPlayerRolle, this.logHealAction, this.playerHeal,
                        'log--player', 'log--heal');
                }
                this.healActionResponse;
                this.monsterAfterHealAttack();
                this.healIndex = 0;
                this.activateHeal = false;
            }

        },
        applySurrender() {
            if (this.optionButtons['toggleSurrender']) {
                this.surrender = true;
                setTimeout(() => {
                    const gameSurrender = confirm("Are you sure ?");
                    if (gameSurrender) {
                        this.nextRound();
                        refreshPage();
                        clearInterval(this.attackInterval);
                        this.surrender = false;
                    } else {
                        this.surrender = false;
                        this.validateButtonsReturn;
                    }
                }, 0);
            }
        },

        // Monster Methods Configuration

        monsterShortAttackSetup() {
            if (!this.attack) {
                this.monsterResultConfig;
                this.simpleAttackPlayer;

            }
        },
        monsterLongAttackSetup() {
            if (!this.superAttack) {
                this.monsterResultConfig;

            }
        },
        monsterHealSetup() {
            if (this.heal) {
                this.monsterResultConfig;
                this.healActionResponse;

            }
        },
        monsterRoundAttack() {
            this.attackIntern = setInterval(() => {
                if (!this.transition) {
                    this.monsterShortAttackSetup();
                } else if (this.transition && this.rounds) {
                    clearInterval(this.attackInterval[0]);
                    this.removeIntervalId(this.attackInterval, this.attackInterval[0]);
                }

                if (!this.rounds && !this.intervalEntry) {
                    this.attackInterval.push(this.attackIntern);
                    this.intervalEntry = true;
                }
            }, 3000);
        },
        monsterLongRoundAttack() {
            const that = this;
            setTimeout(() => {
                that.monsterLongAttackSetup();
            }, 2000);
        },
        monsterAfterHealAttack() {
            const that = this;
            setTimeout(() => {
                that.monsterHealSetup();
            }, 2000);
        },

        // Battle Log Methods Configuration

        battleLogList(rolle, action, points, colorRolle, colorPoints) {
            const htmlLog = `<span class="${colorRolle}">${rolle}</span
              ><span> ${action} </span
              ><span class="${colorPoints}">${points}</span>`;
            this.htmlLogsList.logsRound[this.rounds].push(htmlLog);
        },


        // Game Cycle Methods Configuration

        nextRound() {
            this.rounds++;
            this.playerHealth = 100;
            this.monsterHealth = 100;
            this.setSuperAttack = 3;
            this.healIndex = 0;
            this.activateHeal = false;
            this.transition = false;
            if (!this.attack) {
                this.attack = true;
                this.monsterResponse = false;
            }
            if (!this.superAttack) {
                this.superAttack = true;
                this.monsterLateResponse = false;
            }

            if (this.htmlLogsList.logsRound.length < this.numberRounds) {
                this.htmlLogsList.logsRound.push([]);
            }
        },
        resetGame() {
            const playerConfirmed = confirm('Do you want to repeat the game?');
            if (playerConfirmed) {
                this.nextRound();
                refreshPage();
                clearInterval(this.attackInterval);
            }
        },

    },
    mounted() {
        this.controlStartGame();
        this.monsterRoundAttack();
        this.monsterLongRoundAttack();
    },
    beforeDestroy() {
        this.clearAllIntervals(this.startCountInterval);
        this.clearAllIntervals(this.attackInterval);
    },
});

game.mount('#game');