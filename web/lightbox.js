// The picture viewer: a picture from a chat, large on a dimmed backdrop,
// with its caption, a link that opens the file and keys to the chat's other
// pictures. Left and Right (the arrow keys, the arrows on screen, or a
// swipe) move through every picture the chat shows, in the order it shows
// them, going round at the ends. Escape, the Close key or a click beside
// the picture closes it, and focus goes back to where it was.

// describePicture is what the viewer says about a picture: its caption (the
// alt text, or the file's name), the file's name when the caption does not
// already say it, and where its Open link goes. A drawing held whole in its
// own address (data:) has no file, and a tab cannot be opened on it.
export function describePicture(src, alt) {
  const inline = /^data:/i.test(src);
  let file = inline ? '' : src.split(/[?#]/)[0].split('/').pop();
  try { file = decodeURIComponent(file); } catch {}
  const title = alt || file;
  return { title, file: file === title ? '' : file, open: inline ? '' : src };
}

// stepIndex is the picture dir (1 or -1) steps on from the one at i among
// n, going round at the ends.
export const stepIndex = (i, n, dir) => (i + dir + n) % n;

// pictures lists the pictures the viewer can show in root, in the order
// shown: every picture on screen, but not one inside a link to somewhere
// else, whose click is the link's own.
export function pictures(root) {
  return [...root.querySelectorAll('img')].filter((img) => {
    const a = img.closest('a');
    return (!a || a.href === img.src) && img.getClientRects().length > 0;
  });
}

// createLightbox wires the viewer's dialog. open(img, root) shows img among
// the pictures of root, and says whether it did: false leaves the click to
// the link around the picture.
export function createLightbox(dialog) {
  const part = (name) => dialog.querySelector('.lightbox-' + name);
  const pic = part('img'), title = part('title'), file = part('file'), count = part('count');
  const openLink = part('open'), prev = part('prev'), next = part('next'), closeBtn = part('close');
  let list = [], at = 0, before = null;

  function show(i) {
    at = i;
    const img = list[i];
    const d = describePicture(img.src, img.alt);
    pic.src = img.src;
    pic.alt = d.title;
    title.textContent = d.title;
    file.textContent = d.file;
    file.hidden = !d.file;
    count.textContent = `${i + 1} of ${list.length}`;
    count.hidden = prev.hidden = next.hidden = list.length < 2;
    openLink.hidden = !d.open;
    if (d.open) openLink.href = d.open;
  }
  const step = (dir) => { if (list.length > 1) show(stepIndex(at, list.length, dir)); };

  function open(img, root) {
    list = pictures(root);
    const i = list.indexOf(img);
    if (i < 0) return false;
    before = document.activeElement;
    show(i);
    dialog.showModal();
    dialog.focus();
    return true;
  }
  function close() {
    if (!dialog.open) return;
    dialog.close();
    if (before && before.isConnected && before !== document.body) before.focus();
  }

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Escape') close();
    else return;
    e.preventDefault();
    e.stopPropagation(); // the page's own keys (Escape stops a reply) stay out of it
  });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  // A swipe on a touch screen turns the page; the click it may end in does nothing.
  let x0 = null, swiped = false;
  dialog.addEventListener('pointerdown', (e) => { x0 = e.pointerType === 'touch' ? e.clientX : null; swiped = false; });
  dialog.addEventListener('pointerup', (e) => {
    if (x0 == null || Math.abs(e.clientX - x0) < 40) return;
    step(e.clientX < x0 ? 1 : -1);
    swiped = true;
  });
  dialog.addEventListener('click', (e) => {
    if (swiped) return;
    if (prev.contains(e.target)) step(-1);
    else if (next.contains(e.target)) step(1);
    else if (closeBtn.contains(e.target) || e.target === dialog || e.target === pic.parentElement) close();
  });
  return { open, close };
}
