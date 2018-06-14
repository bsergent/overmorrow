import WorldSandbox from 'overmorrow/classes/WorldSandbox';
import Tile, { TileType, DiscoveryLevel } from 'overmorrow/classes/Tile'
import Rectangle from 'overmorrow/primitives/Rectangle';
import { Perlin, SeededRandom } from 'overmorrow/Utilities';

export default class Dungeon extends WorldSandbox {
  protected generate(): void {
    let gen = new SeededRandom(this.seed.toString());
    for (let x = 0; x < 10; x++)
      console.log(gen.random());
    console.log('-----');
    let per = new Perlin(() => gen.random());
    for (let x = 0; x < 10; x += 0.5)
      console.log(per.get1d(x));

    // Construct rooms
    // Connect rooms (probably use the union-find stuff from CS302, like generating a maze, but with rooms)
    // Decide path
    // Decorate rooms
  }
}