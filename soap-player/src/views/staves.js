import { nothing } from 'lit';
import { Renderer, Stave, StaveNote, Voice, Formatter, StaveModifier, TextNote } from 'vexflow';

function isPowerOfTwo(n) {
  return (Math.log(n)/Math.log(2)) % 1 === 0;
}

export function renderTempo(soapEngine) {
  if (!soapEngine.current) {
    return nothing;
  }

  if (soapEngine.current.event.duration) {
    return nothing;
  }

  const { basis, bpm } = soapEngine.current.event.tempo;

  let duration = basis.lower / basis.upper;
  let dots = null;

  if ( Math.floor(duration) === duration ) {
    dots = 0;
  } else {
    duration = basis.lower / (basis.upper - 1);
    dots = 1;
  }

  const div = document.createElement('div');

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(80, 60);
  const context = renderer.getContext();

  const stave = new Stave(-10, 10, 0);

  if (isPowerOfTwo(duration) === false) {
    stave.setText(`/${basis.lower}`, StaveModifier.Position.BELOW, { shift_x:20, shift_y:-76, justification: TextNote.Justification.LEFT});
    duration = 1;
  }

  stave.setTempo({ duration, dots, bpm }, 0);
  stave.setContext(context).draw();

  return div;
}

export function renderTimeSignature(soapEngine) {
  if (!soapEngine.current) {
    return nothing;
  }

  if (soapEngine.current.event.duration) {
    return nothing;
  }

  const { signature } = soapEngine.current.event;

  const div = document.createElement('div');

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(100, 50);
  const context = renderer.getContext();
  const stave = new Stave(0, -30, 0);

  stave.addTimeSignature(signature.name);
  stave.setContext(context).draw();
  context.rect(0, 0, 1, 100, { stroke: 'none', fill: 'white' });

  return div;
}

