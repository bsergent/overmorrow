<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>BFSV-Coding | Overmorrow</title>
		<link rel="icon" href="assets/logo.png">
		<script data-main="dist/config.js" src="js/lib/require.js"></script>

		<style>
			body {
				background-color: black;
				color: #E3BD40;
				padding-top: 12px;
				text-align: center;
				font-family: "Courier New", Courier, monospace;
			}
			img {
				margin: 0px;
			}
			h1 {
				margin: 0px;
			}
			p {
				margin: 0px;
				font-size: 12px;
			}
			a {
				color: #B38D00;
			}
			#game-container {
				margin: 10px;
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
		<img src="assets/logo.png" width="128"/>
		<h1>Overmorrow</h1>
		<p>Package v<span id="version">0.0.0</span> - <span id="demo">No</span> Demo</p>
		<p><a href="?Overworld">Overworld</a> - <a href="?Dungeon">Dungeon</a> - <a href="?GUI">GUI</a></p>
		<div id="game-container">
			<canvas id="game" width="800" height="600" tabfocus="1" style=""></canvas>
			<canvas id="buffer" width="800" height="600" tabfocus="1" style="visibility:hidden; display:none;"></canvas>
		</div>
		<p><a href="https://github.com/bsergent/overmorrow">View on GitHub</a></span></p>
	</body>
</html>
