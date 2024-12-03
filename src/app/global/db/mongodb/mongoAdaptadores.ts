import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { MongoAdaptadorDb } from 'src/adaptadores/db/mongoAdaptadorDb';

export const mongoAdaptadores = [
  {
    provide: AdaptadorDb,
    useClass: MongoAdaptadorDb,
  },
];
