'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useState, useMemo, Suspense, type ComponentProps } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

type Category = 'bug' | 'question' | 'suggestion';

const COPY = {
  en: {
    categoryLabel: 'Type',
    bug: 'Bug',
    question: 'Question',
    suggestion: 'Suggestion',
    titlePlaceholder: 'Short summary',
    bodyPlaceholder: 'Describe the issue. Markdown allowed.',
    submit: 'Submit',
    submitting: 'Submitting...',
    success: 'Thanks! Tracked as',
    followLink: 'you can follow progress here (no account needed to read).',
    errGeneric: 'Something went wrong, please retry.',
    errValidation: 'Please fill in all required fields correctly.',
    errVerify: 'Verification failed, refresh and retry.',
    errRate: 'Temporarily unavailable, please try later.',
    disabled: 'Support form disabled (missing Turnstile site key).',
  },
  ko: {
    categoryLabel: '유형',
    bug: '버그',
    question: '질문',
    suggestion: '제안',
    titlePlaceholder: '간단한 제목',
    bodyPlaceholder: '내용을 적어주세요. 마크다운 지원.',
    submit: '제출',
    submitting: '제출 중...',
    success: '감사합니다! 이슈로 등록되었습니다:',
    followLink: '여기서 진행 상황을 확인할 수 있습니다 (계정 없이 열람 가능).',
    errGeneric: '문제가 발생했습니다. 다시 시도해주세요.',
    errValidation: '필수 항목을 올바르게 입력해주세요.',
    errVerify: '검증에 실패했습니다. 새로고침 후 다시 시도해주세요.',
    errRate: '일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
    disabled: '지원 양식이 비활성화되었습니다 (Turnstile 사이트 키 누락).',
  },
  ja: {
    categoryLabel: '種別',
    bug: 'バグ',
    question: '質問',
    suggestion: '提案',
    titlePlaceholder: '短い概要',
    bodyPlaceholder: '詳細を記入してください。Markdown可。',
    submit: '送信',
    submitting: '送信中...',
    success: 'ありがとうございます。Issueとして登録されました:',
    followLink: 'ここで進捗を追えます（閲覧にアカウント不要）。',
    errGeneric: '問題が発生しました。再試行してください。',
    errValidation: '必須項目を正しく入力してください。',
    errVerify: '検証に失敗しました。再読み込みして再試行してください。',
    errRate: '一時的に利用できません。しばらくしてから再試行してください。',
    disabled: 'サポートフォームは無効です（Turnstile サイトキー未設定）。',
  },
  zh: {
    categoryLabel: '类型',
    bug: 'Bug',
    question: '提问',
    suggestion: '建议',
    titlePlaceholder: '简短摘要',
    bodyPlaceholder: '请描述详情。支持 Markdown。',
    submit: '提交',
    submitting: '提交中...',
    success: '感谢！已记录为 Issue：',
    followLink: '可在此追踪进度（无需账号即可查看）。',
    errGeneric: '出现错误，请重试。',
    errValidation: '请正确填写所有必填项。',
    errVerify: '验证失败，请刷新后重试。',
    errRate: '暂时不可用，请稍后再试。',
    disabled: '支持表单已禁用（缺少 Turnstile 站点密钥）。',
  },
} as const;

type Lang = keyof typeof COPY;

export function ReportForm() {
  // useSearchParams needs a Suspense boundary during static prerender.
  return (
    <Suspense fallback={null}>
      <ReportFormInner />
    </Suspense>
  );
}

function ReportFormInner() {
  const params = useParams<{ lang?: string }>();
  const search = useSearchParams();
  const locale: Lang =
    params?.lang && params.lang in COPY ? (params.lang as Lang) : 'en';
  const copy = COPY[locale];

  const prefilledPath = useMemo(
    () => search?.get('path') ?? '',
    [search],
  );

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [category, setCategory] = useState<Category>('bug');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'submitting' }
    | { kind: 'success'; url: string }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  if (!siteKey) {
    return (
      <div className="rounded border border-fd-border bg-fd-muted p-4 text-sm text-fd-muted-foreground">
        {copy.disabled}
      </div>
    );
  }

  if (state.kind === 'success') {
    return (
      <div className="rounded border border-fd-border bg-fd-muted p-4 text-sm">
        <p className="mb-2">
          {copy.success}{' '}
          <a
            href={state.url}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {state.url}
          </a>
        </p>
        <p className="text-fd-muted-foreground">{copy.followLink}</p>
      </div>
    );
  }

  const onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (e) => {
    e.preventDefault();
    if (!token) {
      setState({ kind: 'error', message: copy.errVerify });
      return;
    }
    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'report',
          category,
          title,
          body,
          path: prefilledPath || undefined,
          locale,
          turnstileToken: token,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 200 && data.url) {
        setState({ kind: 'success', url: data.url });
      } else if (res.status === 400) {
        setState({ kind: 'error', message: copy.errValidation });
      } else if (res.status === 403) {
        setState({ kind: 'error', message: copy.errVerify });
      } else if (res.status === 429 || res.status === 503) {
        setState({ kind: 'error', message: copy.errRate });
      } else {
        setState({ kind: 'error', message: copy.errGeneric });
      }
    } catch {
      setState({ kind: 'error', message: copy.errGeneric });
    }
  };

  const submitting = state.kind === 'submitting';

  return (
    <form onSubmit={onSubmit} className="my-6 space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{copy.categoryLabel}</legend>
        {(['bug', 'question', 'suggestion'] as const).map((c) => (
          <label key={c} className="mr-4 inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="category"
              value={c}
              checked={category === c}
              onChange={() => setCategory(c)}
            />
            {copy[c]}
          </label>
        ))}
      </fieldset>

      <input
        type="text"
        required
        placeholder={copy.titlePlaceholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border border-fd-border bg-fd-background px-3 py-2 text-sm"
      />

      <textarea
        required
        rows={8}
        placeholder={copy.bodyPlaceholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded border border-fd-border bg-fd-background px-3 py-2 text-sm"
      />

      {prefilledPath ? (
        <p className="text-xs text-fd-muted-foreground">Page: {prefilledPath}</p>
      ) : null}

      <Turnstile
        siteKey={siteKey}
        onSuccess={setToken}
        onError={() => setToken(null)}
        onExpire={() => setToken(null)}
        options={{ size: 'invisible' }}
      />

      {state.kind === 'error' ? (
        <p className="text-sm text-red-600">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !token}
        className="rounded bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-50"
      >
        {submitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
