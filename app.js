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
            startCountdown: 3,
            numberRounds: 0,
            validateStart: false,
            startCount: null,
            transition: false,

            // Game Setup
            htmlLogsList: {
                logsRound: [[]],
                resultRound: []
            },
            attackInterval: null,
            logAttackAction: "attacks and deals",
            logSuperAttackAction: "super attacks and deals",
            logHealAction: "heals himself for",
            roundMessage: "",
            gameMessage: "",
            score: 0,
            numberRounds: 3,
            rounds: 0,
            endGame: false,

            // End Game Setup
            validateStatistics: false,

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
            monsterHealResponse: true
        }
    },
    watch: {
        playerHealth(value) {
            if (this.rounds <= this.numberRounds) {
                setTimeout(() => {
                    if (value <= 0) {
                        this.executeDelay();
                    } else if (value === 100) {
                        this.transition = true;
                        this.controlStartGame();
                    }
                }, 3000);
            }
        },
        monsterHealth(value) {
            if (this.rounds <= this.numberRounds) {
                if (value <= 0) {
                    this.score++;
                    this.executeDelay();
                } else if (value === 100) {
                    this.transition = true;
                    setTimeout(() => {
                        this.controlStartGame();
                    }, 3000);
                }
            }
        },
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
            [this.heal, this.monsterHealResponse] = [this.monsterHealResponse, this.heal];
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
        playerRoundAttack() {
            if (this.$refs['monster'] && this.attack) {
                this.playerAttack = damage(5, 12);
                this.monsterHealth -= this.playerAttack;
                if (this.monsterHealth <= 0) {
                    this.monsterHealth = 0;
                    if (!this.monsterHealth) {
                        this.roundMessage = "Winn!";
                        this.htmlLogsList.resultRound.push(this.roundMessage);
                    }
                }
                this.battleLogList(this.logPlayerRolle, this.logAttackAction, this.playerAttack,
                    'log--player', 'log--damage');
                this.simpleAttackPlayer;
            }
            this.prepareSpecialAttack();
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
            if (this.setSuperAttack === 3) {
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


        },
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
            this.attackInterval = setInterval(() => {
                this.monsterShortAttackSetup();
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
        battleLogList(rolle, action, points, colorRolle, colorPoints) {
            const htmlLog = `<span class="${colorRolle}">${rolle}</span
              ><span> ${action} </span
              ><span class="${colorPoints}">${points}</span>`;
            this.htmlLogsList.logsRound[this.rounds].push(htmlLog);
        },
        startGameSetup() {
            if (this.startCountdown > 0) {
                this.startCountdown--;
                if (this.startCountdown === 0) {
                    this.validateStart = true;
                    this.transition = false;
                    this.validateStatistics = false;
                    clearInterval(this.startCount);
                }
                return this.startCountdown.toString();
            }
        },
        controlStartGame() {
            const that = this;
            this.startCount = setInterval(() => {
                that.startGameSetup();
            }, 1000);
        },
        nextRound() {
            this.rounds++;
            this.playerHealth = 100;
            this.monsterHealth = 100;
            this.startCountdown = 3;
            this.setSuperAttack = 3;
            this.healIndex = 0;
            this.validateStart = false;
            this.activateHeal = false;
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
            } else {
                this.validateStatistics = true;
            }
        },
        applySurrender() {
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
                }
            }, 0);
        },

        async executeDelay() {
            await delay(1000);
            this.nextRound();
        }
    },
    mounted() {
        this.controlStartGame();
        this.monsterRoundAttack();
        this.monsterLongRoundAttack();
    },
    beforeDestroy() {
        clearInterval(this.startCount);
        clearInterval(this.attackInterval);
    },
});

game.mount('#game');