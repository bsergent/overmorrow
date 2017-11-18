<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>BFSV-Coding | Demo</title>
		<link rel="icon" href="assets/hexagon.png">
		<script data-main="js/config.js" src="js/lib/require.js"></script>

		<style>
			body {
				background-color: black;
        color: #eae872;
        padding-top: 50px;
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
        color: #66653c;
			}
			#game-container {
				text-align: center;
				padding: 0px;
			}
			canvas#game {
				width: 800px;
				height: 600px;
				box-shadow: 0px 0px 5px #eae872;
				image-rendering: pixelated;
				border: 2px solid #eae872;
			}
			#game-container > canvas {
				background-color: black;
			}
		</style>
	</head>

	<body>
      <h1>Overmorrow Demo</h1>
      <p>v0.0.3</p>
      <div id="game-container">
        <canvas id="game" width="800" height="600" tabfocus="1" style=""></canvas>
        <canvas id="buffer" width="800" height="600" tabfocus="1" style="visibility:hidden; display:none;"></canvas>
			</div>
			<p><a href="https://github.com/bsergent/overmorrow">Overmorrow on GitHub</a><!-- TPS=<span id="tps"></span>--></p>
	</body>
</html>
