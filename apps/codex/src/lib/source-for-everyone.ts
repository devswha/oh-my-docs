import { forEveryone } from '../../.source/server';
import { loader } from 'fumadocs-core/source';
import { i18n } from './i18n';

export const forEveryoneSource = loader({
  baseUrl: '/for-everyone',
  source: forEveryone.toFumadocsSource(),
  i18n,
});
