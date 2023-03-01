import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import 'materialize-css/dist/js/materialize'


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
