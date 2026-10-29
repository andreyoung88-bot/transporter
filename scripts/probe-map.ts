import { ukPath, iePath, project, ukRings } from '../src/lib/projection';
console.log('uk', ukPath.length, 'ie', iePath.length, 'polys', ukRings().length, 'pts', ukRings().flat(2).length);
console.log('norwich', project({ lat: 52.6286, lon: 1.2924 }), 'penzance', project({ lat: 50.118, lon: -5.537 }), 'thurso', project({ lat: 58.59, lon: -3.52 }), 'belfast', project({lat:54.597,lon:-5.93}));
