import Engine from '@/lib/engine/engine.js';

const getHud = () => {
  const { source, lines, level } = Engine.state;

  return {
    source,
    lines,
    level,
  };
};

export default getHud;
