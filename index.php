<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>BFSV-Coding | Overmorrow</title>
		<link rel="icon" href="assets/logo.png">
		<script data-main="js/config.js" src="js/lib/require.js"></script>

		<style>
	body {
		background-color: black;
		color: #E3BD40;
		padding-top: 24px;
		text-align: center;
		font-family: "Courier New", Courier, monospace;
	}
	h1 {
		margin-bottom: 0px;
	}
	p {
		margin: 0px 0px 15px;
		font-size: 12px;
	}
	a {
		color: #B38D00;
	}
	#game-container {
		text-align: center;
		padding: 0px;
		user-selection: none;
	}
	canvas#game {
		width: 800px;
		height: 600px;
		box-shadow: 0px 0px 5px #E3BD40;
		border: 2px solid #E3BD40;
		image-rendering: pixelated;
		background-color: black;
		user-selection: none;
	}
		</style>
	</head>

	<body>
		<img src="assets/logo.png" width="128" style="margin:0xp;"/>
		<h1>Overmorrow Demo</h1>
		<p>v0.0.4</p>
		<div id="game-container">
			<canvas id="game" width="800" height="600" tabfocus="1" style=""></canvas>
			<canvas id="buffer" width="800" height="600" tabfocus="1" style="visibility:hidden; display:none;"></canvas>
			<canvas id="temp" width="800" height="600" tabfocus="1" style="visibility:hidden; display:none;"></canvas>
		</div>
		<p><a href="https://github.com/bsergent/overmorrow">Overmorrow on GitHub</a> TPS=<span id="tps"></span></p>
	</body>
</html>
