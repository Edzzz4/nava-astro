/* ─────────────────────────────────────────────────────────────
   Download page: reads the token from the URL fragment (#t=…),
   asks the download function for the order status and fills one
   POST form per file. Errors from a POST come back as ?e=<code>
   (303 redirect from the function, fragment preserved).
   ───────────────────────────────────────────────────────────── */

type Status = {
  title: string;
  expires: string;
  files: { kind: 'pdf' | 'epub'; remaining: number }[];
};

const ERRORS = ['invalid', 'expired', 'limit'] as const;

async function init(): Promise<void> {
  const root = document.querySelector<HTMLElement>('[data-download]');
  if (!root) return;
  const loading = root.querySelector<HTMLElement>('[data-dl-loading]')!;
  const errorBox = root.querySelector<HTMLElement>('[data-dl-error]')!;
  const ok = root.querySelector<HTMLElement>('[data-dl-ok]')!;

  function fail(code: string): void {
    const key = (ERRORS as readonly string[]).includes(code) ? code : 'generic';
    loading.hidden = true;
    errorBox.textContent = root!.dataset[`err${key[0]!.toUpperCase()}${key.slice(1)}`] ?? '';
    errorBox.hidden = false;
  }

  const token = new URLSearchParams(location.hash.slice(1)).get('t');
  if (!token) return fail('invalid');

  // A refused POST (expired, limit) redirects here with ?e=<code>.
  const postError = new URLSearchParams(location.search).get('e');

  let status: Status;
  try {
    const res = await fetch(`/.netlify/functions/download?t=${encodeURIComponent(token)}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) return fail(data.error ?? 'generic');
    status = data as Status;
  } catch {
    return fail('generic');
  }

  const lang = root.dataset.lang === 'it' ? 'it-IT' : 'en-GB';
  root.querySelector('[data-dl-title]')!.textContent = status.title;
  root.querySelector('[data-dl-expires]')!.textContent = new Intl.DateTimeFormat(lang, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(status.expires));

  for (const f of status.files) {
    const form = root.querySelector<HTMLFormElement>(`[data-dl-form="${f.kind}"]`);
    const count = root.querySelector<HTMLElement>(`[data-dl-remaining="${f.kind}"]`);
    if (!form || !count) continue;
    form.querySelector<HTMLInputElement>('input[name="t"]')!.value = token;
    let remaining = f.remaining;
    const button = form.querySelector('button')!;
    const render = () => {
      count.textContent = String(remaining);
      button.disabled = remaining <= 0;
    };
    render();
    // The response is an attachment: the page stays, so count locally.
    form.addEventListener('submit', () => {
      remaining = Math.max(0, remaining - 1);
      setTimeout(render, 0); // after the browser has read the form
    });
  }

  loading.hidden = true;
  ok.hidden = false;
  if (postError) fail(postError);
}

document.addEventListener('astro:page-load', () => void init());

export {};
