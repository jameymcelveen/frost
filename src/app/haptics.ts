export type HapticWeight = 'light' | 'heavy';

export async function hapticImpact(weight: HapticWeight): Promise<void> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({
      style: weight === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Light,
    });
  } catch {
    // Web or plugin unavailable
  }
}
