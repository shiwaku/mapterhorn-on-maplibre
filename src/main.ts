import './style.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

const protocol = new Protocol({ metadata: true });

maplibregl.addProtocol('mapterhorn', async (params, abortController) => {
    const [z, x, y] = params.url.replace('mapterhorn://', '').split('/').map(Number);
    const name = z <= 12 ? 'planet' : `6-${x >> (z - 6)}-${y >> (z - 6)}`;
    const url = `pmtiles://https://download.mapterhorn.com/${name}.pmtiles/${z}/${x}/${y}.webp`;
    const response = await protocol.tile({ ...params, url }, abortController);
    if (response['data'] === null) throw new Error(`Tile z=${z} x=${x} y=${y} not found.`);
    return response;
});

const map = new maplibregl.Map({
    container: 'map',
    hash: 'map',
    style: {
        version: 8,
        sources: {
            dem: {
                type: 'raster-dem',
                tiles: ['mapterhorn://{z}/{x}/{y}'],
                encoding: 'terrarium',
                tileSize: 512,
                attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>'
            }
        },
        layers: [
            {
                id: 'hillshade',
                type: 'hillshade',
                source: 'dem'
            }
        ]
    },
    center: [139.03052, 35.21077],
    zoom: 13,
    pitch: 60,
    maxPitch: 85
});

map.addControl(
    new maplibregl.NavigationControl({
        visualizePitch: true
    })
);

map.addControl(
      new maplibregl.TerrainControl({
        source: "dem",
        exaggeration: 1,
      })
    );

map.on("load", () => {
      map.setTerrain({ source: "dem", exaggeration: 1 });
});