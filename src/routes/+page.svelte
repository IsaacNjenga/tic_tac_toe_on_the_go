<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		Circle,
		House,
		Moon,
		Palette,
		RotateCcw,
		Sparkles,
		Sun,
		Trophy,
		X
	} from '@lucide/svelte';
	import './layout.css';

	type Mark = 'X' | 'O';
	type Accent = 'peach' | 'mint' | 'lavender';
	type Scores = { x: number; o: number; draws: number };

	const winningCombinations = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];

	let page = $state<'home' | 'settings'>('home');
	let board = $state<(Mark | null)[]>(Array(9).fill(null));
	let currentTurn = $state<Mark>('X');
	let winner = $state<Mark | null>(null);
	let winningSquares = $state<number[]>([]);
	let isDraw = $state(false);
	let scores = $state<Scores>({ x: 0, o: 0, draws: 0 });
	let accent = $state<Accent>('peach');
	let darkMode = $state(false);
	let ready = $state(false);

	const readCookie = (name: string) => {
		const prefix = `${name}=`;
		const value = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
		return value ? decodeURIComponent(value.slice(prefix.length)) : null;
	};

	const saveScores = () => {
		document.cookie = `tttg-scores=${encodeURIComponent(JSON.stringify(scores))}; max-age=31536000; path=/; samesite=lax`;
	};

	const saveSettings = () => {
		document.cookie = `tttg-settings=${encodeURIComponent(JSON.stringify({ accent, darkMode }))}; max-age=31536000; path=/; samesite=lax`;
	};

	onMount(() => {
		const savedScores = readCookie('tttg-scores');
		if (savedScores) {
			try {
				const parsed = JSON.parse(savedScores) as Partial<Scores>;
				if (
					Number.isSafeInteger(parsed.x) &&
					Number.isSafeInteger(parsed.o) &&
					Number.isSafeInteger(parsed.draws) &&
					(parsed.x ?? -1) >= 0 &&
					(parsed.o ?? -1) >= 0 &&
					(parsed.draws ?? -1) >= 0
				) {
					scores = { x: parsed.x!, o: parsed.o!, draws: parsed.draws! };
				}
			} catch (error) {
				console.warn('Saved scores could not be read.', error);
			}
		}

		const savedSettings = readCookie('tttg-settings');
		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings) as { accent?: Accent; darkMode?: boolean };
				if (parsed.accent === 'peach' || parsed.accent === 'mint' || parsed.accent === 'lavender') {
					accent = parsed.accent;
				}
				if (typeof parsed.darkMode === 'boolean') darkMode = parsed.darkMode;
			} catch (error) {
				console.warn('Saved settings could not be read.', error);
			}
		}

		ready = true;
	});

	function playSquare(index: number) {
		if (board[index] || winner || isDraw) return;

		const nextBoard = [...board];
		nextBoard[index] = currentTurn;
		board = nextBoard;

		const winningCombo = winningCombinations.find((combo) =>
			combo.every((square) => nextBoard[square] === currentTurn)
		);

		if (winningCombo) {
			winner = currentTurn;
			winningSquares = winningCombo;
			scores = {
				...scores,
				[currentTurn === 'X' ? 'x' : 'o']: scores[currentTurn === 'X' ? 'x' : 'o'] + 1
			};
			if (ready) saveScores();
		} else if (nextBoard.every(Boolean)) {
			isDraw = true;
			scores = { ...scores, draws: scores.draws + 1 };
			if (ready) saveScores();
		} else {
			currentTurn = currentTurn === 'X' ? 'O' : 'X';
		}
	}

	function startNextRound() {
		board = Array(9).fill(null);
		currentTurn = 'X';
		winner = null;
		winningSquares = [];
		isDraw = false;
	}

	function clearScores() {
		scores = { x: 0, o: 0, draws: 0 };
		saveScores();
	}

	function selectAccent(value: Accent) {
		accent = value;
		if (ready) saveSettings();
	}

	function toggleDarkMode() {
		darkMode = !darkMode;
		if (ready) saveSettings();
	}
</script>

<svelte:head>
	<title>Tic Tac Toe — A little friendly rivalry</title>
	<meta
		name="description"
		content="A little tic tac toe, a lot of friendly rivalry. Play a round and keep the score."
	/>
</svelte:head>

<div
	class="app-shell"
	class:night={darkMode}
	class:theme-mint={accent === 'mint'}
	class:theme-lavender={accent === 'lavender'}
>
	<aside class="sidebar">
		<a class="brand" href="/" aria-label="Tic Tac Toe home" onclick={() => (page = 'home')}>
			<span class="brand-mark"
				><X size={20} strokeWidth={3} /><Circle size={16} strokeWidth={3} /></span
			>
			<span class="brand-copy">little<span>rivals</span></span>
		</a>

		<div class="nav-label">MENU</div>
		<nav class="navigation" aria-label="Main navigation">
			<button class:active={page === 'home'} onclick={() => (page = 'home')}>
				<House size={19} strokeWidth={2.2} />
				<span>Home</span>
				{#if page === 'home'}<span class="nav-dot"></span>{/if}
			</button>
			<button class:active={page === 'settings'} onclick={() => (page = 'settings')}>
				<Palette size={19} strokeWidth={2.2} />
				<span>Settings</span>
				{#if page === 'settings'}<span class="nav-dot"></span>{/if}
			</button>
		</nav>

		<div class="sidebar-bottom">
			<div class="sidebar-note">
				<Sparkles size={17} />
				<p>Good games.<br /><strong>Great company.</strong></p>
			</div>
			<div class="sidebar-footer"><span class="online-dot"></span> MADE FOR TWO</div>
		</div>
	</aside>

	<main class="main-area">
		<header class="topbar">
			<div class="breadcrumb">
				<span>PLAYGROUND</span><ArrowRight size={13} /><strong
					>{page === 'home' ? 'HOME' : 'SETTINGS'}</strong
				>
			</div>
			<button
				class="topbar-theme"
				onclick={toggleDarkMode}
				aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
			>
				{#if darkMode}<Sun size={17} />{:else}<Moon size={17} />{/if}
				<span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
			</button>
		</header>

		{#if page === 'home'}
			<section class="page-content game-page">
				<div class="intro">
					<div class="eyebrow">
						<span class="eyebrow-sparkle">✳</span> THE CLASSIC, WITH A TWIST
					</div>
					<h1>Ready, set,<br /><span>tic tac toe!</span></h1>
					<p class="intro-copy">Two players. One tiny board. An unreasonable amount of glory.</p>
				</div>

				<div class="game-layout">
					<section class="play-card" aria-label="Tic tac toe game">
						<div class="round-header">
							<div class="round-label"><span class="live-dot"></span> FRIENDLY MATCH</div>
							<div class="round-number">
								ROUND <span>{scores.x + scores.o + scores.draws + 1}</span>
							</div>
						</div>

						<div class="turn-banner" class:finished={winner || isDraw}>
							{#if winner}
								<span class="turn-emoji">🎉</span>
								<span
									><strong>Player {winner === 'X' ? '1' : '2'} takes it!</strong> Nicely played.</span
								>
							{:else if isDraw}
								<span class="turn-emoji">🤝</span>
								<span><strong>A perfect tie!</strong> Rematch?</span>
							{:else}
								<span class="turn-emoji">{currentTurn === 'X' ? '✖️' : '⭕'}</span>
								<span
									><strong>Player {currentTurn === 'X' ? '1' : '2'}’s turn</strong> — you’ve got this!</span
								>
							{/if}
							{#if winner || isDraw}
								<button class="play-again" onclick={startNextRound}
									>Play again <ArrowRight size={15} /></button
								>
							{/if}
						</div>

						<div class="board" role="grid" aria-label="Tic tac toe board">
							{#each board as mark, index (board.indexOf(mark))}
								<button
									class="cell"
									class:mark-x={mark === 'X'}
									class:mark-o={mark === 'O'}
									class:winning-square={winningSquares.includes(index)}
									disabled={!!mark || !!winner || isDraw}
									onclick={() => playSquare(index)}
									role="gridcell"
									aria-label={`Square ${index + 1}${mark ? `, ${mark}` : ', empty'}`}
								>
									{#if mark === 'X'}
										<X size={43} strokeWidth={3.2} />
									{:else if mark === 'O'}
										<Circle size={39} strokeWidth={3.2} />
									{:else}
										<span class="cell-hint"></span>
									{/if}
								</button>
							{/each}
						</div>

						<div class="board-footer">
							<div>
								<span class="turn-key x-key"><X size={13} strokeWidth={3} /></span> PLAYER 1
							</div>
							<span class="board-footer-divider">FIRST MOVE, FIRST GLORY</span>
							<div>
								<span class="turn-key o-key"><Circle size={12} strokeWidth={3} /></span> PLAYER 2
							</div>
						</div>
					</section>

					<aside class="score-panel" aria-label="Match scores">
						<div class="score-panel-heading">
							<div>
								<span class="mini-eyebrow">THE SCOREBOARD</span>
								<h2>Who's on a roll?</h2>
							</div>
							<span class="trophy-icon"><Trophy size={19} /></span>
						</div>

						<div class="score-row player-one">
							<div class="player-avatar"><X size={21} strokeWidth={3} /></div>
							<div class="player-label"><strong>Player 1</strong><span>Team X</span></div>
							<div class="score-value">{scores.x}</div>
						</div>
						<div class="score-row player-two">
							<div class="player-avatar"><Circle size={19} strokeWidth={3} /></div>
							<div class="player-label"><strong>Player 2</strong><span>Team O</span></div>
							<div class="score-value">{scores.o}</div>
						</div>

						<div class="draw-row">
							<span>🤝</span><span>Draws</span><strong>{scores.draws}</strong>
						</div>
						<div class="score-divider"></div>
						<button class="reset-button" onclick={startNextRound}
							><RotateCcw size={15} /> Restart round</button
						>
						<button class="clear-button" onclick={clearScores}>Clear scoreboard</button>
						<div class="score-footnote"><span>✦</span> Score sticks around in this browser.</div>
					</aside>
				</div>

				<footer class="page-footer">
					<span>NO CLOCKS. NO PRESSURE. JUST VIBES.</span>
					<span>BUILT FOR THE LOVE OF THE GAME <span class="footer-heart">♥</span></span>
				</footer>
			</section>
		{:else}
			<section class="page-content settings-page">
				<div class="intro">
					<div class="eyebrow"><span class="eyebrow-sparkle">✳</span> MAKE IT YOURS</div>
					<h1>A little more<br /><span>your style.</span></h1>
					<p class="intro-copy">Set the mood for your next legendary match.</p>
				</div>

				<div class="settings-card">
					<div class="settings-section">
						<div class="settings-icon"><Palette size={20} /></div>
						<div class="settings-description">
							<h2>Pick your palette</h2>
							<p>Choose a color for your playground.</p>
						</div>
						<div class="palette-options" role="group" aria-label="Color theme">
							<button
								class="palette-choice peach-choice"
								class:selected={accent === 'peach'}
								onclick={() => selectAccent('peach')}
								aria-label="Peach palette"
								aria-pressed={accent === 'peach'}><span></span></button
							>
							<button
								class="palette-choice mint-choice"
								class:selected={accent === 'mint'}
								onclick={() => selectAccent('mint')}
								aria-label="Mint palette"
								aria-pressed={accent === 'mint'}><span></span></button
							>
							<button
								class="palette-choice lavender-choice"
								class:selected={accent === 'lavender'}
								onclick={() => selectAccent('lavender')}
								aria-label="Lavender palette"
								aria-pressed={accent === 'lavender'}><span></span></button
							>
						</div>
					</div>
					<div class="settings-divider"></div>
					<div class="settings-section">
						<div class="settings-icon">
							{#if darkMode}<Moon size={20} />{:else}<Sun size={20} />{/if}
						</div>
						<div class="settings-description">
							<h2>Night owl mode</h2>
							<p>Easy on the eyes, even after dark.</p>
						</div>
						<button
							class="toggle-switch"
							class:enabled={darkMode}
							onclick={toggleDarkMode}
							role="switch"
							aria-checked={darkMode}
							aria-label="Toggle night owl mode"><span></span></button
						>
					</div>
					<div class="settings-divider"></div>
					<div class="settings-section score-setting">
						<div class="settings-icon"><Trophy size={20} /></div>
						<div class="settings-description">
							<h2>Your scoreboard</h2>
							<p>Your match scores live in a cookie on this device.</p>
						</div>
						<button class="settings-clear" onclick={clearScores}
							>Clear scores <ArrowRight size={14} /></button
						>
					</div>
				</div>

				<div class="settings-tip">
					<Sparkles size={17} /><span>Good to know</span>
					<p>
						Your colors and scoreboard are saved on this device. Clear your scoreboard whenever you
						want a fresh start.
					</p>
				</div>
				<footer class="page-footer">
					<span>NO CLOCKS. NO PRESSURE. JUST VIBES.</span><span
						>BUILT FOR THE LOVE OF THE GAME <span class="footer-heart">♥</span></span
					>
				</footer>
			</section>
		{/if}
	</main>
</div>
