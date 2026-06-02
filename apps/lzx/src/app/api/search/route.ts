import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin';
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese';

// Korean has no official @orama tokenizer; 'english' fallback uses
// whitespace tokenisation and stemming, which gives basic exact-match
// support. Revisit if/when upstream ships a Korean tokenizer.
export const { GET } = createFromSource(source, {
  localeMap: {
    ko: 'english',
    zh: {
      tokenizer: createMandarinTokenizer(),
    },
    ja: {
      tokenizer: createJapaneseTokenizer(),
    },
  },
});
