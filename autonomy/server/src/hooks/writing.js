import { format } from 'date-fns';

export async function r3Post({ persona }) {
  const date = format(new Date(), 'yyyy-MM-dd');
  const lines = [
    `R3 // ${date}`,
    `Recover: Own yesterday without shame.`,
    `Redeem: Turn pain into process.`,
    `Rebuild: Brick-by-brick. No excuses. Only reps.`,
    `— ${persona?.signature || 'SAE'}`,
  ];
  const body = lines.join('\n');
  return { preview: lines.join(' '), body };
}
