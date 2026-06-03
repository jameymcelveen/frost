import { vecEq } from '../grid.ts';
import { isOnDartBeam } from './beam.ts';
import {
  TrapType,
  TelegraphKind,
  type EnterAttemptResult,
  type TrapContext,
  type TrapHandler,
} from './types.ts';

export const dartTrapHandler: TrapHandler = {
  type: TrapType.Dart,
  requiresTelegraph: true,

  telegraphKind() {
    return TelegraphKind.Beam;
  },

  onEnterAttempt(ctx: TrapContext): EnterAttemptResult {
    if (isOnDartBeam(ctx.state, ctx.targetPos)) {
      return { kind: 'hit' };
    }
    return { kind: 'allow' };
  },
};

export function beamIncludes(
  beam: readonly { x: number; y: number }[],
  pos: { x: number; y: number },
): boolean {
  return beam.some((p) => vecEq(p, pos));
}
