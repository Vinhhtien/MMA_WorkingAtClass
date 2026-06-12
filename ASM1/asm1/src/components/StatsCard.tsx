import { palette, shadow } from '@/src/constants/design';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
  total: number;
  completed: number;
  remaining: number;
}

export default function StatsCard({ total, completed, remaining }: StatsCardProps) {
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.score}>
          <Text style={styles.scoreValue}>{progress}</Text>
          <Text style={styles.percent}>%</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.kicker}>NHỊP ĐỘ HIỆN TẠI</Text>
          <Text style={styles.title}>Bạn đã hoàn thành {completed}/{total} việc.</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.note}>{remaining} việc vẫn đang chờ bạn xử lý</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: -34, marginBottom: 22 },
  card: {
    minHeight: 148,
    backgroundColor: palette.lime,
    borderWidth: 2,
    borderColor: palette.ink,
    borderRadius: 26,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...shadow,
  },
  score: {
    width: 86,
    height: 94,
    borderRadius: 20,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreValue: { color: palette.white, fontSize: 40, fontWeight: '900', letterSpacing: -3 },
  percent: { color: palette.lime, fontSize: 16, fontWeight: '900', alignSelf: 'flex-start', marginTop: 23 },
  content: { flex: 1 },
  kicker: { color: palette.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: palette.ink, fontSize: 18, lineHeight: 23, fontWeight: '900', marginTop: 5 },
  track: { height: 9, borderRadius: 9, backgroundColor: 'rgba(23,23,23,0.18)', marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: palette.ink, borderRadius: 9 },
  note: { color: palette.ink, fontSize: 11, fontWeight: '700', marginTop: 7 },
});
